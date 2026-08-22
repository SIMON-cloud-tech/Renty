import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiPackage, FiEdit, FiBox, FiSettings,
  FiLogOut, FiSun, FiMoon,
  FiMenu, FiX, FiFolder, FiStar,
} from 'react-icons/fi';
import '../css/Dashboard.css';
import ProductManage from './ProductManage.jsx';
import BlogManage from './BlogManage.jsx';
import Inventory from './Inventory.jsx';
import ProjectManage from './ProjectManage.jsx';
import TestimonialsManage from './TestimonialManage.jsx';

// ── Constants ──
const MENU_ICONS = {
  products: FiPackage,
  blog: FiEdit,
  inventory: FiBox,
  projects: FiFolder,
  testimonials: FiStar,
};

const MENU_ITEMS = [
  { id: 'products', label: 'Product Management' },
  { id: 'blog', label: 'Blog Management' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'projects', label: 'Project Management' },
  { id: 'testimonials', label: 'Testimonials' },
];

const COMPONENT_MAP = {
  products: ProductManage,
  blog: BlogManage,
  inventory: Inventory,
  projects: ProjectManage,
  testimonials: TestimonialsManage,
};

// ── Helper ──
const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
};

// ── Dashboard ──
const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('products');
  const [theme, setTheme] = useState('light');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── Toggle helpers ──
  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen(p => !p), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  // ── Fetch profile ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 401) navigate('/auth');
          throw new Error('Failed to fetch profile');
        }
        setProfile(await res.json());
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // ── Logout ──
  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    navigate('/auth');
  }, [setUser, navigate]);

  // ── Menu handlers ──
  const handleMenuItemClick = useCallback((id) => {
    setActiveMenuItem(id);
    closeMobileSidebar();
  }, [closeMobileSidebar]);

  // ── Memoized values ──
  const activeLabel = useMemo(
    () => MENU_ITEMS.find(item => item.id === activeMenuItem)?.label || 'Dashboard',
    [activeMenuItem]
  );

  const ActiveComponent = useMemo(
    () => COMPONENT_MAP[activeMenuItem] || (() => <p>Section not found</p>),
    [activeMenuItem]
  );

  const greeting = useMemo(getGreeting, []);

  // ── Loading ──
  if (loading) return <div className="dashboard-status"><p>Loading dashboard...</p></div>;

  // ── Render helpers ──
  const renderMenuItem = ({ id, label }) => {
    const Icon = MENU_ICONS[id] || FiSettings;
    const isActive = activeMenuItem === id;
    return (
      <button
        key={id}
        className={`sidebar-item ${isActive ? 'active' : ''}`}
        onClick={() => handleMenuItemClick(id)}
        title={label}
      >
        <span className="sidebar-icon"><Icon size={20} /></span>
        <span className="sidebar-label">{label}</span>
      </button>
    );
  };

  return (
    <div className={`dashboard ${theme}`}>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="mobile-hamburger" onClick={toggleMobileSidebar} aria-label={mobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
          {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar overlay */}
      <div className={`sidebar-overlay ${mobileSidebarOpen ? 'visible' : ''}`} onClick={closeMobileSidebar} />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header"><h2>Dashboard</h2></div>
        <nav>{MENU_ITEMS.map(renderMenuItem)}</nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="sidebar-icon"><FiLogOut size={20} /></span>
            <span className="sidebar-label">Logout</span>
          </button>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <span className="sidebar-icon">{theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}</span>
            <span className="sidebar-label">{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        <section className="dashboard-row dashboard-row-fixed">
          <div className="welcome-banner">
            <h1 className="welcome-title">{greeting}, {profile?.name || 'User'}! 👋</h1>
          </div>
        </section>

        <section className="dashboard-row dashboard-row-scrollable">
          <div className="content-panel full-width">
            <h3>{activeLabel}</h3>
            <ActiveComponent />
          </div>
        </section>

        <footer className="dashboard-footer">
          <p>© {new Date().getFullYear()} FurniHaven. All Rights Reserved.</p>
          <Link to="/" className="dashboard-footer-link">
            <p>Quality Furniture You Can Trust 🪑</p>
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;