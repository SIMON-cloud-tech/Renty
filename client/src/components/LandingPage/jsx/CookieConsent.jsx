import { useState, useEffect, useCallback } from 'react';
import { FiShield, FiCheck, FiX, FiChevronRight } from 'react-icons/fi';
import '../css/CookieConsent.css';

const STORAGE_KEY = 'furnihaven_cookie_consent';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Check if consent was already given
  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Show banner after small delay
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Accept all cookies
  const handleAccept = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      consent: 'accepted',
      timestamp: Date.now(),
    }));
    setVisible(false);
    setShowDetails(false);
  }, []);

  // Reject non-essential cookies
  const handleReject = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      consent: 'rejected',
      timestamp: Date.now(),
    }));
    setVisible(false);
    setShowDetails(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-label="Cookie consent">
      <div className="cookie-consent__card">
        <div className="cookie-consent__header">
          <span className="cookie-consent__icon">
            <FiShield size={22} />
          </span>
          <h3 className="cookie-consent__title">We Value Your Privacy</h3>
        </div>

        <p className="cookie-consent__text">
          We use cookies to enhance your browsing experience, analyze site traffic, 
          and personalize content. By clicking "Accept All", you consent to our use 
          of cookies.
        </p>

        {showDetails && (
          <div className="cookie-consent__details">
            <div className="cookie-detail">
              <strong>Essential Cookies</strong>
              <span>Required for the website to function. Always active.</span>
            </div>
            <div className="cookie-detail">
              <strong>Analytics Cookies</strong>
              <span>Help us understand how visitors interact with our site.</span>
            </div>
            <div className="cookie-detail">
              <strong>Preference Cookies</strong>
              <span>Remember your settings and preferences.</span>
            </div>
          </div>
        )}

        <div className="cookie-consent__actions">
          <button className="cookie-btn cookie-btn--accept" onClick={handleAccept}>
            <FiCheck size={16} /> Accept All
          </button>
          <button className="cookie-btn cookie-btn--reject" onClick={handleReject}>
            <FiX size={16} /> Reject Non-Essential
          </button>
          <button 
            className="cookie-btn cookie-btn--details" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Learn More'} <FiChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;