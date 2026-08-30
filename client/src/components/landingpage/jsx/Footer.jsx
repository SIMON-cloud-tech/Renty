import { Link } from 'react-router-dom';
import { FaFacebook, FaTiktok, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { FiHome, FiInfo, FiShoppingBag, FiBookOpen, FiMail, FiPhone, FiMapPin, FiShield, FiMessageCircle, FiLayers, FiStar, FiCompass } from 'react-icons/fi';
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
              <li><Link to="/"><FiHome size={14} /> Home</Link></li>
              <li><Link to="/about"><FiInfo size={14} /> About Us</Link></li>
              <li><Link to="/products"><FiShoppingBag size={14} /> All Products</Link></li>
              <li><Link to="/newarrivals"><FiStar size={14} /> New Arrivals</Link></li>
              <li><Link to="/guides"><FiCompass size={14} /> Inspirations</Link></li>
              <li><Link to="/blogs"><FiBookOpen size={14} /> Blog</Link></li>
              <li><Link to="/contact"><FiMail size={14} /> Contact</Link></li>
              <li><Link to="/privacy"><FiShield size={14} /> Privacy Policy</Link></li>
            </ul>
          </div>

          {/* SHOP CATEGORIES */}
          <div>
            <h2 className="footer-title small">Shop Categories</h2>
            <ul className="footer-links">
              <li><Link to="/shop/sofas">Sofas</Link></li>
              <li><Link to="/shop/beds">Beds</Link></li>
              <li><Link to="/shop/tables">Tables</Link></li>
              <li><Link to="/shop/outdoor">Outdoor</Link></li>
              <li><Link to="/shop/office">Office</Link></li>
            </ul>
          </div>

          {/* ROOMS */}
          <div>
            <h2 className="footer-title small">Shop by Room</h2>
            <ul className="footer-links">
              <li><Link to="/rooms/living-room">Living Room</Link></li>
              <li><Link to="/rooms/bedroom">Bedroom</Link></li>
              <li><Link to="/rooms/kitchen">Kitchen</Link></li>
              <li><Link to="/rooms/home-office">Home Office</Link></li>
              <li><Link to="/rooms/outdoor-spaces">Outdoor Spaces</Link></li>
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
              <p><FiMapPin size={14} /> Nairobi — Karen, Kilimani, Umoja</p>
            </div>

            <div className="footer-contact">
              <h2 className="footer-title small">Contact</h2>
              <p><FiPhone size={14} /> +254 727 713 219</p>
              <p><FiMail size={14} /> info@furnihaven.co.ke</p>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="footer-middle">
          {/* SOCIALS */}
          <div>
            <h2 className="footer-title small">Follow Us</h2>
            <div className="footer-socials">
              <a href="#" className="social-icon" aria-label="Facebook"><FaFacebook /></a>
              <a href="#" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" className="social-icon" aria-label="TikTok"><FaTiktok /></a>
              <a href="https://wa.me/254703433014" className="social-icon" aria-label="WhatsApp"><FaWhatsapp /></a>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FurniHaven. All rights reserved.</p>
          <p>Quality Furniture You Can Trust 🪑</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;