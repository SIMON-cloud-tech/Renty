const Payment = require('../models/Payment');
const Unit = require('../models/Unit');
const { asyncHandler } = require('../utils/errorHandler');
const paymentsUtil = require('../utils/paymentsUtil');

// Daraja STK callback: body is nested under Body.stkCallback
// Success (ResultCode 0) carries CallbackMetadata.Item[] with Amount, MpesaReceiptNumber, PhoneNumber.
// Failures carry NO CallbackMetadata at all — only ResultCode + ResultDesc.
exports.handleDarajaWebhook = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const cb = body?.Body?.stkCallback;

  // Always acknowledge Daraja with 200 + its own envelope, or it retries.
  const ack = () => res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  if (!cb) {
    console.warn('[daraja webhook] malformed body', JSON.stringify(body).slice(0, 300));
    return ack();
  }

  const checkoutId = cb.CheckoutRequestID;   // this is what we saved as providerRef
  const resultCode = Number(cb.ResultCode);

  if (!checkoutId) {
    console.warn('[daraja webhook] missing CheckoutRequestID');
    return ack();
  }

  const payment = await Payment.findOne({ providerRef: checkoutId });
  if (!payment) {
    console.warn(`[daraja webhook] no payment for CheckoutRequestID ${checkoutId}`);
    return ack(); // ack so Daraja stops retrying
  }

  // Idempotency — already finalised, do nothing.
  if (['paid', 'failed', 'approved', 'cancelled'].includes(payment.status)) {
    return ack();
  }

  if (resultCode === 0) {
    // Success — pull fields out of CallbackMetadata.Item[]
    const items = cb?.CallbackMetadata?.Item || [];
    const pick = (name) => items.find((i) => i.Name === name)?.Value;

    const receipt = pick('MpesaReceiptNumber') || null;
    const { commission, landlordAmount } = paymentsUtil.calculateSplit(payment.amount);
    const releaseAt = new Date(Date.now() + paymentsUtil.RELEASE_HOURS * 60 * 60 * 1000);

    await Payment.updateOne(
      { _id: payment._id, status: 'pending' },
      {
        $set: {
          status: 'paid',
          paidAt: new Date(),
          mpesaReceipt: receipt,
          commission,
          landlordAmount,
          releaseAt,
        },
      }
    );

    await Unit.updateOne(
      { _id: payment.unitId },
      { $set: { status: 'occupied', clientId: payment.clientId } }
    );

    return ack();
  }

  // Non-zero ResultCode — the payment did not complete.
  // Common codes: 1032 cancelled, 1037 timeout, 1 insufficient, 2001 wrong PIN.
  // Never read CallbackMetadata here — it is absent.
  await Payment.updateOne(
    { _id: payment._id, status: 'pending' },
    {
      $set: {
        status: 'failed',
        failureReason: cb.ResultDesc || `Daraja code ${resultCode}`,
      },
    }
  );

  await Unit.updateOne(
    { _id: payment.unitId, status: 'reserved' },
    { $set: { status: 'vacant', clientId: null, reservedUntil: null } }
  );

  return ack();
});