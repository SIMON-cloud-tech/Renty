const { AppError } = require('./errorHandler');

// ─────────────────────────────────────────────────────────────
//  Daraja API constants — sandbox defaults, read from .env
// ─────────────────────────────────────────────────────────────
const DARAJA_BASE = process.env.DARAJA_BASE_URL || 'https://sandbox.safaricom.co.ke';
const CONSUMER_KEY = process.env.DARAJA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET;
const SHORTCODE = process.env.DARAJA_SHORTCODE || '174379';
const PASSKEY = process.env.DARAJA_PASSKEY;
const CALLBACK_URL = process.env.DARAJA_CALLBACK_URL; // your ngrok URL + /api/webhooks/daraja

if (!CONSUMER_KEY || !CONSUMER_SECRET || !PASSKEY || !CALLBACK_URL) {
  throw new Error('Missing Daraja env vars (CONSUMER_KEY, CONSUMER_SECRET, PASSKEY, CALLBACK_URL)');
}

// ── OAuth: every Daraja call needs a fresh Bearer token ──
const getToken = async () => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await fetch(`${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new AppError(data?.errorMessage || 'Daraja OAuth failed', res.status || 502);
  }
  return data.access_token;
};

// ── Daraja STK password: base64(shortcode + passkey + timestamp) ──
const buildStkPassword = () => {
  const ts = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14); // YYYYMMDDHHmmss
  const eat = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const raw = `${SHORTCODE}${PASSKEY}${ts}`;
  return { password: Buffer.from(raw).toString('base64'), timestamp: ts };
};

// ── STK Push. Returns { providerRef } = CheckoutRequestID ──
const requestPayment = async ({ phone, amount, email, name, reference }) => {
  if (!phone) throw new AppError('Client phone required', 400);
  if (!amount || amount <= 0) throw new AppError('Amount must be positive', 400);

  const token = await getToken();
  const { password, timestamp } = buildStkPassword();

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),          // Daraja wants integer KES, no decimals
    PartyA: phone,                        // paying phone
    PartyB: SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: CALLBACK_URL,
    AccountReference: (reference || 'rent').slice(0, 12),
    TransactionDesc: `Rent for ${name || 'client'}`.slice(0, 13),
  };

  const res = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ResponseCode !== '0') {
    const msg = data.errorMessage || data.ResponseDescription || 'STK push failed';
    throw new AppError(msg, res.status || 502);
  }

  // This is the handle you persist. The payment result arrives later on the callback.
  return { providerRef: data.CheckoutRequestID };
};

// ── B2C payout. Requires SecurityCredential (initiator password, RSA-encrypted). ──
// For sandbox testing you can use a pre-generated sandbox security credential,
// or skip payout entirely until you go live. This function throws clearly if unset.
const sendPayout = async ({ phone, amount, narrative, reference }) => {
  if (!phone) throw new AppError('Landlord phone required', 400);
  if (!amount || amount <= 0) throw new AppError('Payout amount must be positive', 400);

  const securityCredential = process.env.DARAJA_SECURITY_CREDENTIAL;
  const initiatorName = process.env.DARAJA_INITIATOR_NAME;
  if (!securityCredential || !initiatorName) {
    throw new AppError('B2C not configured: set DARAJA_SECURITY_CREDENTIAL and DARAJA_INITIATOR_NAME', 500);
  }

  const token = await getToken();

  const payload = {
    InitiatorName: initiatorName,
    SecurityCredential: securityCredential,
    CommandID: 'BusinessPayment',
    Amount: Math.round(amount),
    PartyA: SHORTCODE,
    PartyB: phone,                       // landlord receiving
    Remarks: (narrative || 'Rent payout').slice(0, 100),
    QueueTimeOutURL: process.env.DARAJA_QUEUE_TIMEOUT_URL || CALLBACK_URL,
    ResultURL: process.env.DARAJA_RESULT_URL || CALLBACK_URL,
    Occasion: (reference || '').slice(0, 100),
  };

  const res = await fetch(`${DARAJA_BASE}/mpesa/b2c/v1/paymentrequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ResponseCode !== '0') {
    const msg = data.errorMessage || data.ResponseDescription || 'Payout failed';
    throw new AppError(msg, res.status || 502);
  }

  // Daraja B2C returns ConversationID as the tracking handle.
  return { payoutRef: data.ConversationID || data.OriginatorConversationID || reference };
};

module.exports = { requestPayment, sendPayout };