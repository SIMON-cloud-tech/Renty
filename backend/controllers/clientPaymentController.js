const crypto = require('crypto');
const Payment = require('../models/Payment');
const Unit = require('../models/Unit');
const Landlord = require('../models/Landlord');
const Client = require('../models/Client');
const { asyncHandler, AppError } = require('../utils/errorHandler');
const mpesaUtil = require('../utils/mpesaUtil');
const paymentsUtil = require('../utils/paymentsUtil');

// Model status -> what the client sees.
// 'paid' = M-Pesa confirmed, waiting for the client to approve release to the landlord.
const DISPLAY_STATUS = { paid: 'pending', approved: 'approved' };

// ============================================================
//  READ — dashboard
// ============================================================

// Only this client's own payments that have actually been paid.
exports.getClientPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({
    clientId: req.user.id,
    status: { $in: Object.keys(DISPLAY_STATUS) },
  }).sort({ createdAt: -1 }).lean();

  const [units, landlords] = await Promise.all([
    Unit.find({ _id: { $in: payments.map(p => p.unitId) } })
      .select('houseType location')
      .lean(),
    Landlord.find({ userId: { $in: payments.map(p => p.landlordId) } })
      .select('userId name')
      .lean(),
  ]);

  const unitById = new Map(units.map(u => [String(u._id), u]));
  const landlordNames = new Map(landlords.map(l => [String(l.userId), l.name]));

  res.json(payments.map(p => {
    const unit = unitById.get(String(p.unitId));
    return {
      _id: p._id,
      landlord: landlordNames.get(String(p.landlordId)) || '',
      amount: p.amount ?? null,
      status: DISPLAY_STATUS[p.status],
      house: unit?.houseType || '',
      location: unit?.location || '',
    };
  }));
});

// ============================================================
//  READ — poll a single payment's status
// ============================================================

// Only this client's own payment.
exports.getPaymentStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { paymentId } = req.params;

  const payment = await Payment.findOne({ _id: paymentId, clientId: userId })
    .select('status')
    .lean();

  if (!payment) throw new AppError('Payment not found', 404);

  res.json({ status: payment.status });
});

// ============================================================
//  WRITE — start a rent
// ============================================================

// Reserve the unit, create the Payment, push the STK.
exports.startRent = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { unitId } = req.body;

  if (!unitId) throw new AppError('unitId is required', 400);

  // The client must have a Client profile — that's where the M-Pesa phone lives.
  const client = await Client.findOne({ userId }).lean();
  if (!client?.phone) {
    throw new AppError('Complete your client profile (phone) before renting', 400);
  }

  // 1. Atomic reserve: only succeeds if the unit is currently vacant.
  //    If two people click at the same time, the second gets null.
  const unit = await Unit.findOneAndUpdate(
    { _id: unitId, status: 'vacant' },
    {
      $set: {
        status: 'reserved',
        clientId: userId,
        reservedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 min hold
      },
    },
    { new: true }
  );

  if (!unit) {
    throw new AppError('This house is no longer available', 409);
  }

  // 2. Amount comes OFF THE UNIT DOC — never from the client body.
  const amount = paymentsUtil.calculateCharge(unit);

  // 3. Create the Payment in 'pending' state.
  const payment = await new Payment({
    id: crypto.randomUUID(),
    clientId: userId,
    unitId: unit._id,
    landlordId: unit.userId,
    amount,
    type: 'booking',
    status: 'pending',
    provider: 'intasend',
    phone: client.phone,
  }).save();

  // 4. Fire the STK push. The try/catch exists ONLY for rollback: if the
  //    push fails, undo the reservation and fail the payment, then rethrow
  //    so asyncHandler forwards the error to errorHandler. Not error handling.
  let providerRef;
  try {
    ({ providerRef } = await mpesaUtil.requestPayment({
      phone: client.phone,
      amount,
      email: client.email,
      name: client.name,
      reference: payment.id,
    }));
  } catch (err) {
    await Promise.all([
      Payment.updateOne(
        { _id: payment._id },
        { $set: { status: 'failed', failureReason: err.message || 'STK push failed' } }
      ),
      Unit.updateOne(
        { _id: unit._id, status: 'reserved' },
        { $set: { status: 'vacant', clientId: null, reservedUntil: null } }
      ),
    ]);
    throw err;
  }

  payment.providerRef = providerRef;
  await payment.save();

  return res.status(201).json({ paymentId: payment._id });
});