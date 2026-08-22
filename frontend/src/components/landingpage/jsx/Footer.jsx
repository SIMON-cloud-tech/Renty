import { Link } from 'react-router-dom';
import { FaFacebook, FaTiktok, FaInstagram } from 'react-icons/fa';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* TOP SECTION */}
        <div className="footer-top">
          {/* BUSINESS INFO */}
          <div>
            <h2 className="footer-title main">FurniHaven</h2>
            <p className="footer-text">
              Your trusted source for quality furniture across Nairobi. 
              From office seating and beds to wardrobes and TV stands, 
              we deliver craftsmanship and comfort to homes and businesses 
              in Karen, Kilimani, Umoja, Kitengela, and beyond.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h2 className="footer-title small">Quick Links</h2>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/products">Shop</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/blogs">Blog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* HOURS & LOCATION */}
          <div>
            <h2 className="footer-title small">Working Hours</h2>
            <div className="footer-hours">
              <p>Mon – Fri: 8AM – 6PM</p>
              <p>Saturday: 9AM – 4PM</p>
              <p>Sunday: Closed</p>
            </div>

            <div className="footer-location">
              <h2 className="footer-title small">Location</h2>
              <p>Nairobi — Karen, Kilimani, Umoja</p>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="footer-middle">
          {/* SOCIALS */}
          <div>
            <h2 className="footer-title small">Follow Us</h2>
            <div className="footer-socials">
              <a href="#" className="social-icon"><FaFacebook /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
              <a href="#" className="social-icon"><FaTiktok /></a>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FurniHaven. All rights reserved.</p>
          <p>
            Quality Furniture You Can Trust{' '}
            <Link to="/admin" className="admin-sun-icon" aria-label="Admin login">🪑</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;