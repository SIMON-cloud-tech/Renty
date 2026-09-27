// Starts a rent: server reserves the unit and sends the M-Pesa prompt.
export const startRent = async (unitId, navigate) => {
  try {
    const res = await fetch('/api/client/rent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ unitId }), // only the id; the server works out the amount
    });

    // Not logged in: go to login, then come back to this house
    if (res.status === 401) {
      navigate(`/admin?next=${encodeURIComponent(`/houses/${unitId}`)}`);
      return { ok: false, redirected: true };
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: data.message || 'Could not start the payment.' };
    return { ok: true, paymentId: data.paymentId };
  } catch {
    return { ok: false, message: 'Network error. Please try again.' };
  }
};

// Checks the payment every few seconds until it is paid, failed, or we give up.
export const pollPayment = async (paymentId, { intervalMs = 3000, timeoutMs = 90000 } = {}) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const res = await fetch(`/api/client/rent/${paymentId}/status`, { credentials: 'include' });
      if (res.ok) {
        const { status } = await res.json();
        if (status === 'paid' || status === 'approved') return 'paid';
        if (status === 'failed' || status === 'cancelled') return 'failed';
      }
    } catch {
      /* ignore and try again */
    }
  }
  return 'timeout';
};