import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX, FiSearch, FiUser, FiPhone, FiMail, FiChevronDown } from 'react-icons/fi';
import Cart from './Cart';
import '../css/Navbar.css';
import LogoImage from '/logo.jpeg';

const MENU_ITEMS = [
  {label: 'Home', path: '/'},
  {label: 'About', path: '/about'},
  { 
    label: 'Shop', 
    path: null,  // ← Changed to null
    dropdown: [
      { label: 'Sofas', path: '/shop/sofas' },
      { label: 'Beds', path: '/shop/beds' },
      { label: 'Tables', path: '/shop/tables' },
      { label: 'Outdoor', path: '/shop/outdoor' },
      { label: 'Office', path: '/shop/office' },
    ]
  },
  { label: 'New Arrivals', path: '/newarrivals' },
  { 
    label: 'Rooms', 
    path: null,  // ← Changed to null
    dropdown: [
      { label: 'Living Room', path: '/rooms/living-room' },
      { label: 'Bedroom', path: '/rooms/bedroom' },
      { label: 'Kitchen', path: '/rooms/kitchen' },
      { label: 'Home Office', path: '/rooms/home-office' },
      { label: 'Outdoor Spaces', path: '/rooms/outdoor-spaces' },
    ]
  },
  {label: 'Inspirations', path: '/guides'},
  { label: 'Contact', path: '/contact' },
  {label: 'Blogs', path: '/blogs'},
];

const Navbar = ({ cart, setCart, cartCount = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileDropdown, setMobileDropdown] = useState(null);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileDropdown(null);
  };
  const toggleCart = () => setCartOpen(!cartOpen);
  const closeCart = () => setCartOpen(false);
  const handleDropdownEnter = (index) => setActiveDropdown(index);
  const handleDropdownLeave = () => setActiveDropdown(null);
  const toggleMobileDropdown = (index) => {
    setMobileDropdown(mobileDropdown === index ? null : index);
  };

  return (
    <>
      {/* ============ TOP UTILITY BAR ============ */}
      <div className="top-utility-bar">
        <div className="utility-container">
          <div className="utility-left">
            <a href="mailto:info@furniturestore.com" className="utility-contact">
              <FiMail size={14} />
              <span>info@furniturestore.com</span>
            </a>
            <a href="tel:+15551234567" className="utility-contact">
              <FiPhone size={14} />
              <span>+1 (555) 123-4567</span>
            </a>
          </div>

          <div className="utility-right">
            <button className="utility-icon-btn" aria-label="Search">
              <FiSearch size={18} />
            </button>
            <Link to="/admin" className="utility-icon-btn" aria-label="Admin login">
              <FiUser size={18} />
            </Link>
            <button className="utility-icon-btn" onClick={toggleCart} aria-label="Open cart">
              <FiShoppingCart size={18} />
              {cartCount > 0 && <span className="utility-cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* ============ MAIN NAVBAR ============ */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <img src={LogoImage} alt="Furniture Store Logo" className="navbar-logo-img" />
          </Link>

          <ul className="nav-menu">
            {MENU_ITEMS.map((item, index) => (
              <li 
                key={item.label} 
                className="nav-item"
                onMouseEnter={() => handleDropdownEnter(index)}
                onMouseLeave={handleDropdownLeave}
              >
                {item.path ? (
                  <Link 
                    to={item.path} 
                    className="nav-link"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                    {item.dropdown && <FiChevronDown size={16} className="dropdown-arrow" />}
                  </Link>
                ) : (
                  <span className="nav-link" style={{ cursor: 'default' }}>
                    {item.label}
                    {item.dropdown && <FiChevronDown size={16} className="dropdown-arrow" />}
                  </span>
                )}

                {item.dropdown && activeDropdown === index && (
                  <ul className="dropdown-menu">
                    {item.dropdown.map((subItem) => (
                      <li key={subItem.path} className="dropdown-item">
                        <Link 
                          to={subItem.path} 
                          className="dropdown-link"
                          onClick={closeMobileMenu}
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <div className="nav-right">
            <button 
              className="mobile-menu-btn" 
              onClick={toggleMobileMenu} 
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* ============ MOBILE MENU ============ */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="mobile-nav-menu">
            {MENU_ITEMS.map((item, index) => (
              <li key={item.label} className="mobile-nav-item">
                <div className="mobile-nav-link-wrapper">
                  {item.path ? (
                    <Link 
                      to={item.path} 
                      className="mobile-nav-link"
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="mobile-nav-link">{item.label}</span>
                  )}
                  
                  {item.dropdown && (
                    <button 
                      className="mobile-dropdown-toggle"
                      onClick={() => toggleMobileDropdown(index)}
                    >
                      <FiChevronDown 
                        size={18} 
                        className={mobileDropdown === index ? 'rotate-180' : ''}
                      />
                    </button>
                  )}
                </div>

                {item.dropdown && mobileDropdown === index && (
                  <ul className="mobile-dropdown-menu">
                    {item.dropdown.map((subItem) => (
                      <li key={subItem.path} className="mobile-dropdown-item">
                        <Link 
                          to={subItem.path} 
                          className="mobile-dropdown-link"
                          onClick={closeMobileMenu}
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <Cart
        cart={cart}
        setCart={setCart}
        isOpen={cartOpen}
        onClose={closeCart}
      />
    </>
  );
};

export default Navbar;