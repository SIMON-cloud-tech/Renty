const Payment = require('../models/Payment');
const Landlord = require('../models/Landlord');
const Unit = require('../models/Unit');
const mpesaUtil = require('./mpesaUtil');
const { AppError } = require('./errorHandler');

// ── Config ──
const COMMISSION_PERCENT = Number(process.env.COMMISSION_PERCENT || 10);
const RELEASE_HOURS = Number(process.env.RELEASE_HOURS || 24);

// ── The ONE place that decides what a client is charged ──
// rent + deposit, read off the Unit document. Never from the client.
const calculateCharge = (unit) => {
  if (!unit) throw new AppError('Unit required to calculate charge', 500);
  const rent = Number(unit.rent) || 0;
  const deposit = Number(unit.deposit) || 0;
  return rent + deposit;
};

// ── The ONE place that decides how money is split ──
// commission is a percentage of the amount; landlord gets the rest.
const calculateSplit = (amount) => {
  const gross = Number(amount) || 0;
  const commission = Math.round((gross * COMMISSION_PERCENT) / 100);
  const landlordAmount = gross - commission;
  return { commission, landlordAmount };
};

// ── The ONE place that releases money to the landlord ──
// Used by BOTH the client approve button AND the auto-release job.
// Atomic flip paid -> approved is the lock: if it returns null,
// someone else already released this payment, so we skip the payout.
const releaseToLandlord = async (paymentId) => {
  const payment = await Payment.findOneAndUpdate(
    { _id: paymentId, status: 'paid' },          // only if still 'paid'
    { $set: { status: 'approved', releasedAt: new Date() } },
    { new: true }
  );

  if (!payment) {
    // Already approved, or not in a releasable state — not an error, just skip.
    return { released: false, reason: 'not-in-paid-state' };
  }

  // We flipped it. Now pay the landlord. If this throws, we roll the
  // status back so the job/button can retry — better than silent loss.
  try {
    const landlord = await Landlord.findOne({ userId: payment.landlordId }).lean();
    if (!landlord?.phone) throw new AppError('Landlord phone missing', 500);

    const { payoutRef } = await mpesaUtil.sendPayout({
      phone: landlord.phone,
      amount: payment.landlordAmount,
      narrative: `Rent payout for unit ${payment.unitId}`,
      reference: String(payment._id),
    });

    payment.payoutRef = payoutRef;
    await payment.save();

    // Mark the unit as occupied now that money has moved.
    await Unit.updateOne(
      { _id: payment.unitId },
      { $set: { status: 'occupied', clientId: payment.clientId } }
    );

    return { released: true, payoutRef };
  } catch (err) {
    // Roll back to 'paid' so a retry can happen.
    await Payment.updateOne(
      { _id: payment._id, status: 'approved' },
      { $set: { status: 'paid', releasedAt: null } }
    );
    throw err;
  }
};

module.exports = {
  calculateCharge,
  calculateSplit,
  releaseToLandlord,
  COMMISSION_PERCENT,
  RELEASE_HOURS,
};