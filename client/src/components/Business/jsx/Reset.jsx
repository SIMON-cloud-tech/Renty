import { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Reset.css';

// ── Constants ──
const INITIAL_OTP = ['', '', '', '', '', ''];
const STEPS = { EMAIL: 1, OTP: 2, PASSWORD: 3 };

// ── Helpers ──
const isOtpComplete = (otp) => otp.every(d => d !== '') && otp.join('').length === 6;

const Reset = () => {
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(INITIAL_OTP);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  // ── Status updater ──
  const setStatusMessage = useCallback((msg, isSuccess = false) => {
    setStatus(msg);
    if (isSuccess) {
      setTimeout(() => setStatus(''), 2000);
    }
  }, []);

  // ── API caller ──
  const callApi = useCallback(async (endpoint, body, method = 'POST') => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (err) {
      return { ok: false, data: { message: 'Network error. Please try again.' } };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Step 1: Send OTP ──
  const handleEmailSubmit = useCallback(async (e) => {
    e.preventDefault();
    setStatus('');
    const { ok, data } = await callApi('/api/reset/send-otp', { email });
    if (ok) {
      setStatusMessage('OTP sent! Check console for code.', true);
      console.log('OTP:', data.otp);
      setStep(STEPS.OTP);
    } else {
      setStatusMessage(data.message || 'Failed to send OTP');
    }
  }, [email, callApi, setStatusMessage]);

  // ── Step 2: Verify OTP ──
  const handleOtpChange = useCallback(async (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (isOtpComplete(newOtp)) {
      setStatusMessage('Verifying...');
      const { ok, data } = await callApi('/api/reset/verify-otp', {
        email,
        otp: newOtp.join(''),
      });
      if (ok) {
        setStatusMessage('Verification done', true);
        setTimeout(() => { setStatus(''); setStep(STEPS.PASSWORD) }, 1500);
      } else {
        setStatusMessage(data.message || 'Invalid OTP');
        setOtp(INITIAL_OTP);
        inputRefs.current[0]?.focus();
      }
    }
  }, [otp, email, callApi, setStatusMessage]);

  // ── Step 3: Reset Password ──
  const handlePasswordSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setStatusMessage('Passwords do not match');
      return;
    }
    setStatus('');
    const { ok, data } = await callApi('/api/reset/reset-password', {
      email,
      otp: otp.join(''),
      newPassword: passwords.new,
    });
    if (ok) {
      setStatusMessage('Password reset successful! Redirecting...', true);
      setTimeout(() => navigate('/admin'), 2000);
    } else {
      setStatusMessage(data.message || 'Failed to reset password');
    }
  }, [email, otp, passwords, callApi, setStatusMessage, navigate]);

  // ── Memoized status class ──
  const statusClass = useMemo(() => {
    if (!status) return '';
    const successKeywords = ['sent', 'Verification done', 'successful', 'Redirecting'];
    return successKeywords.some(kw => status.includes(kw)) ? 'done' : '';
  }, [status]);

  // ── Render helpers ──
  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
      <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Submit'}</button>
    </form>
  );

  const renderOtpStep = () => (
    <div className="otp-section">
      <p>Enter 6‑digit code</p>
      <div className="otp-inputs">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type="text"
            maxLength="1"
            value={digit}
            onChange={e => handleOtpChange(i, e.target.value)}
            className="otp-box"
            disabled={loading}
          />
        ))}
      </div>
      {status && <p className={`otp-status ${statusClass}`}>{status}</p>}
    </div>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handlePasswordSubmit} className="password-section">
      <input type="password" placeholder="Enter new password" value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} required />
      <input type="password" placeholder="Confirm new password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} required />
      {status && <p className={`otp-status ${statusClass}`}>{status}</p>}
      <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Password'}</button>
    </form>
  );

  const stepMap = {
    [STEPS.EMAIL]: renderEmailStep,
    [STEPS.OTP]: renderOtpStep,
    [STEPS.PASSWORD]: renderPasswordStep,
  };

  return (
    <div className="reset">
      <div className="reset-card">
        <p className="reset-title">Reset your password here</p>
        {stepMap[step]?.()}
      </div>
    </div>
  );
};

export default Reset;