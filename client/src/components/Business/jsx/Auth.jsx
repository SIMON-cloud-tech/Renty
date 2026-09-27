import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { FiEye, FiEyeOff, FiSun } from 'react-icons/fi';
import '../css/Auth.css';

// ── Constants ──
const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  role: 'client',
};
const ENDPOINTS = { login: '/api/login', register: '/api/register' };
const HOME = { business: '/business', landlord: '/landlord', client: '/client' };
const SIGNUP_ROLES = [
  { value: 'client', label: 'Client' },
  { value: 'landlord', label: 'Landlord' },
];

// ── Auth ──
const Auth = ({ setUser }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  // ── Handlers ──
  const handleChange = useCallback((e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }, []);

  const toggleLogin = useCallback(() => setIsLogin(p => !p), []);
  const togglePassword = useCallback(() => setShowPassword(p => !p), []);
  const goToReset = useCallback(() => navigate('/reset'), [navigate]);

  // ── Submit ──
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const endpoint = isLogin ? ENDPOINTS.login : ENDPOINTS.register;
    const body = isLogin
      ? { email: form.email, password: form.password }
      : form;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type');
      const data = contentType?.includes('application/json') ? await res.json() : await res.text();

      if (res.ok) {
        setUser(data.user);
        navigate(HOME[data.user?.role] || '/admin');
      } else {
        setMessage(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setMessage('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [isLogin, form, setUser, navigate]);

  // ── Render helpers ──
  const renderField = ({ label, name, type = 'text', placeholder = '', required = false, pattern }) => (
    <div className="form-group" key={name}>
      <label>{label}</label>
      {name === 'password' ? (
        <div className="password-wrapper">
          <input type={showPassword ? 'text' : 'password'} name={name} value={form[name] || ''} onChange={handleChange} placeholder={placeholder} required={required} />
          <span className="password-toggle" onClick={togglePassword}>{showPassword ? <FiEyeOff /> : <FiEye />}</span>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={form[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          pattern={pattern}
        />
      )}
    </div>
  );

  const fieldConfigs = [
    { label: 'Full Name', name: 'fullName', placeholder: 'John Doe', required: true },
    { label: 'Email Address', name: 'email', type: 'email', placeholder: 'john@example.com', required: true },
    {
      label: 'M-Pesa Phone Number',
      name: 'phone',
      type: 'tel',
      placeholder: '254712345678',
      required: true,
      pattern: '^254\\d{9}$',
    },
    { label: 'Password', name: 'password', placeholder: '••••••••', required: true },
  ];

  // On login only email + password are shown; on signup all four.
  const visibleFields = isLogin
    ? fieldConfigs.filter(f => f.name === 'email' || f.name === 'password')
    : fieldConfigs;

  return (
    <div className="auth">
      {/* ── Left ── */}
      <div className="auth-left">
        <div className="logo-container"><FiSun size={80} color="var(--color-accent)" /></div>
        <h1>Renty</h1>
        <p>Find, list and manage rental homes in one place.</p>
      </div>

      {/* ── Right ── */}
      <div className="auth-right">
        <div className="auth-form">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <form onSubmit={handleSubmit}>
            {visibleFields.map(renderField)}

            {!isLogin && (
              <div className="form-group">
                <label>I am a</label>
                <select name="role" value={form.role} onChange={handleChange} required>
                  {SIGNUP_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            )}

            {message && <p className={`auth-message ${message.includes('successful') || message.includes('created') ? 'success' : 'error'}`}>{message}</p>}

            {isLogin && <p className="forgot-password" onClick={goToReset}>Forgot Password?</p>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="auth-toggle">
            {isLogin ? (
              <>Don't have an account? <span onClick={toggleLogin}>Sign up</span></>
            ) : (
              <>Already have an account? <span onClick={toggleLogin}>Log in</span></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;