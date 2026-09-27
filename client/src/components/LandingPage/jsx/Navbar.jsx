import { Link, NavLink, useLocation } from 'react-router-dom';
import { memo, useState, useEffect, useCallback } from 'react';
import { FiMenu, FiX, FiLogIn } from 'react-icons/fi';
import '../css/Navbar.css';
import LogoImage from '/logo.png';

// ── Constants ──
const BRAND_NAME = 'Renty';
const TAGLINE = 'Find your next home with ease';

const MENU_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Houses', path: '/houses' },
  { label: 'Blogs', path: '/blogs' },
  {label: 'Guides', path: '/guides'},
  { label: 'Partners', path: '/partners' },
];

const linkClass = ({ isActive }) => `site-nav__link${isActive ? ' active' : ''}`;

// ── Navbar ──
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [pastHero, setPastHero] = useState(false);

  const toggle = useCallback(() => setOpen((p) => !p), []);
  const close = useCallback(() => setOpen(false), []);

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Home page only: clear over the hero, frosted glass once you scroll past it
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const navClass = `site-nav${isHome ? ' site-nav--home' : ''}${isHome && !pastHero ? ' site-nav--clear' : ''}`;

  return (
    <>
      <header className={navClass}>
        <div className="site-nav__inner">
          {/* ── Left: logo + name inline, tagline below ── */}
          <Link to="/" className="site-nav__brand" onClick={close}>
            <span className="site-nav__brand-row">
              <img
                src={LogoImage}
                alt=""
                width="36"
                height="36"
                className="site-nav__logo"
                decoding="async"
              />
              <span className="site-nav__name">{BRAND_NAME}</span>
            </span>
            <h5 className="site-nav__tagline">{TAGLINE}</h5>
          </Link>

          {/* ── Centre: menu ── */}
          <nav
            id="site-nav-menu"
            className={`site-nav__menu${open ? ' open' : ''}`}
            aria-label="Main"
          >
            <ul>
              {MENU_ITEMS.map(({ label, path }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={path === '/'}
                    className={linkClass}
                    onClick={close}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}

              {/* Login link inside the mobile menu */}
              <li className="site-nav__login-item">
                <NavLink to="/admin" className={linkClass} onClick={close}>
                  <FiLogIn size={16} /> Login
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* ── Right: Login + Rent Now + hamburger ── */}
          <div className="site-nav__actions">
            <Link to="/admin" className="site-nav__login" onClick={close}>
              <FiLogIn size={16} /> Login
            </Link>

            <button type="button" className="site-nav__cta">
              Rent Now
            </button>

            <button
              type="button"
              className="site-nav__toggle"
              onClick={toggle}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="site-nav-menu"
            >
              {open ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Tap outside to close */}
      {open && <div className="site-nav__backdrop" onClick={close} />}
    </>
  );
};

export default memo(Navbar);