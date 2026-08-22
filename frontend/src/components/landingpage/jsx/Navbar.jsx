import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import Cart from './Cart';
import '../css/Navbar.css';
import LogoImage from '/logo.png' // Replace with your furniture store logo

const MENU_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/products' },
  { label: 'Categories', path: '/categories' },
  { label: 'About', path: '/about' },
  { label: 'Projects', path: '/projects' },
  { label: 'Blog', path: '/blogs' },
  { label: 'Contact', path: '/contact' },
];

const Navbar = ({ cart, setCart, cartCount = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleCart = () => setCartOpen(!cartOpen);
  const closeCart = () => setCartOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <img src={LogoImage} alt="Furniture Store Logo" className="navbar-logo-img" />
          </Link>

          <ul className="nav-menu">
            {MENU_ITEMS.map((item) => (
              <li key={item.path} className="nav-item">
                <Link to={item.path} className="nav-link" onClick={closeMobileMenu}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-right">
            {/* Cart icon – opens cart drawer */}
            <button className="cart-icon-wrapper" onClick={toggleCart} aria-label="Open cart">
              <FiShoppingCart size={24} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="mobile-nav-menu">
            {MENU_ITEMS.map((item) => (
              <li key={item.path} className="mobile-nav-item">
                <Link to={item.path} className="mobile-nav-link" onClick={closeMobileMenu}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mobile-nav-item">
              <Link to="/admin" className="mobile-nav-link" onClick={closeMobileMenu}>
                Admin
              </Link>
            </li>
            <li className="mobile-nav-item">
              <button className="mobile-nav-link" onClick={() => { closeMobileMenu(); toggleCart(); }}>
                Cart {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Cart Drawer */}
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