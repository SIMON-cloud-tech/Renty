import { Link } from 'react-router-dom';
import {
  FiHome, FiInfo, FiPhoneCall, FiKey, FiBookOpen, FiUsers,
  FiMapPin, FiMail, FiPhone, FiGlobe,
} from 'react-icons/fi';
import {
  FaYoutube, FaTiktok, FaFacebook, FaInstagram,
} from 'react-icons/fa';
import '../css/Footer.css';
import logo from '/logo.png';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* ── Top band ── */}
        <div className="footer-top">

          {/* Left — identity */}
          <div className="footer-identity">
            <h6 className="footer-strip">Rent smarter. Live better.</h6>

            <div className="footer-brand">
              <img src={logo} alt="Renty logo" className="footer-logo" />
              <span className="footer-name">Renty</span>
            </div>

            <h1 className="footer-tagline">
              Find a home that fits your life.
            </h1>

            <p className="footer-descriptor">
              Verified vacant houses and apartments across Nairobi.
              Search by location and budget, and rent directly from real landlords.
            </p>
          </div>

          {/* Right — quick links + contact */}
          <div className="footer-right">

            {/* Quick links */}
            <div className="footer-col">
              <h2 className="footer-title">Quick Links</h2>
              <ul className="footer-links">
                <li><Link to="/"><FiHome size={14} /> Home</Link></li>
                <li><Link to="/about"><FiInfo size={14} /> About</Link></li>
                <li><Link to="/contact"><FiPhoneCall size={14} /> Contact</Link></li>
                <li><Link to="/house"><FiKey size={14} /> Houses</Link></li>
                <li><Link to="/blogs"><FiBookOpen size={14} /> Blogs</Link></li>
                <li><Link to="/partners"><FiUsers size={14} /> Partners</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h2 className="footer-title">Contact</h2>
              <ul className="footer-links footer-contact">
                <li><FiMapPin size={14} /> Nairobi, Kenya</li>
                <li>
                  <FiMail size={14} />
                  <a href="mailto:simonmbithi143@gmail.com">simonmbithi143@gmail.com</a>
                </li>
                <li>
                  <FiPhone size={14} />
                  <a href="tel:+254700000000">+254 700 000 000</a>
                </li>
                <li>
                  <FiGlobe size={14} />
                  <a href="https://renty.co.ke" target="_blank" rel="noopener noreferrer">
                    renty.co.ke
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* ── Bottom band ── */}
        <div className="footer-bottom">

          <div className="footer-bottom-left">
            <p className="footer-copy">© {year} Renty. All rights reserved.</p>
            <p className="footer-legal">
              <Link to="/privacy">Privacy Policy</Link>
              <span className="footer-dot">·</span>
              <Link to="/terms">Terms &amp; Conditions</Link>
            </p>
          </div>

          <div className="footer-socials">
            <a
              href="https://youtube.com"
              className="social-icon"
              aria-label="YouTube"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube />
            </a>
            <a
              href="https://tiktok.com"
              className="social-icon"
              aria-label="TikTok"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok />
            </a>
            <a
              href="https://facebook.com"
              className="social-icon"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook />
            </a>
            <a
              href="https://instagram.com"
              className="social-icon"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;