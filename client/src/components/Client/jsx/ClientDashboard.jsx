import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiHome, FiCreditCard, FiSettings, FiLogOut, FiSun, FiMoon,
  FiMenu, FiX, FiChevronDown, FiChevronRight
} from 'react-icons/fi';
import '../../Business/css/Dashboard.css';
import ClientUnits from './ClientUnits.jsx';
import ClientPayments from './ClientPayments.jsx';

const MENU_ICONS = {
  unit: FiHome,
  payment: FiCreditCard,
};

const MENU_ITEMS = [
  { id: 'unit', label: 'Units' },
  { id: 'payment', label: 'Payments' },
];

const COMPONENT_MAP = {
  unit: ClientUnits,
  payment: ClientPayments,
};

// ── Helper ──
const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
};

// ── Client Dashboard ──
const ClientDashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState('unit');
  const [theme, setTheme] = useState('light');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // ── Toggle helpers ──
  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen(p => !p), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const toggleExpand = useCallback((id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // ── Fetch profile ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 401) navigate('/admin');
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
    navigate('/admin');
  }, [setUser, navigate]);

  // ── Menu handlers ──
  const handleMenuItemClick = useCallback((id, hasChildren) => {
    if (hasChildren) {
      toggleExpand(id);
    } else {
      setActiveMenuItem(id);
      closeMobileSidebar();
    }
  }, [closeMobileSidebar, toggleExpand]);

  // ── Memoized values ──
  const activeLabel = useMemo(() => {
    for (const item of MENU_ITEMS) {
      if (item.id === activeMenuItem) return item.label;
      if (item.children) {
        const child = item.children.find(c => c.id === activeMenuItem);
        if (child) return `${item.label} → ${child.label}`;
      }
    }
    return 'Dashboard';
  }, [activeMenuItem]);

  const ActiveComponent = useMemo(
    () => COMPONENT_MAP[activeMenuItem] || (() => <p>Section not found</p>),
    [activeMenuItem]
  );

  const greeting = useMemo(getGreeting, []);

  // ── Loading ──
  if (loading) return <div className="dashboard-status"><p>Loading dashboard...</p></div>;

  // ── Render helpers ──
  const renderMenuItem = ({ id, label, children }) => {
    const Icon = MENU_ICONS[id] || FiSettings;
    const isActive = activeMenuItem === id;
    const isExpanded = expandedItems[id];
    const hasChildren = children && children.length > 0;

    return (
      <div key={id} className="sidebar-item-wrapper">
        <button
          className={`sidebar-item ${isActive ? 'active' : ''} ${hasChildren ? 'has-children' : ''}`}
          onClick={() => handleMenuItemClick(id, hasChildren)}
          title={label}
        >
          <span className="sidebar-icon"><Icon size={20} /></span>
          <span className="sidebar-label">{label}</span>
          {hasChildren && (
            <span className="sidebar-arrow">
              {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </span>
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="sidebar-children">
            {children.map(child => {
              const ChildIcon = MENU_ICONS[child.id] || FiSettings;
              const isChildActive = activeMenuItem === child.id;
              return (
                <button
                  key={child.id}
                  className={`sidebar-item child-item ${isChildActive ? 'active' : ''}`}
                  onClick={() => handleMenuItemClick(child.id, false)}
                  title={child.label}
                >
                  <span className="sidebar-icon"><ChildIcon size={16} /></span>
                  <span className="sidebar-label">{child.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
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
        <div className="sidebar-header"><h2>Client Dashboard</h2></div>
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
            <h1 className="welcome-title">{greeting}, {profile?.name || 'User'}</h1>
          </div>
        </section>

        <section className="dashboard-row dashboard-row-scrollable">
          <div className="content-panel full-width">
            <h3>{activeLabel}</h3>
            <ActiveComponent />
          </div>
        </section>

        <footer className="dashboard-footer">
          <p>© {new Date().getFullYear()} Client Dashboard. All Rights Reserved. <Link to='/'>Go back</Link></p>
        </footer>
      </main>
    </div>
  );
};

export default ClientDashboard;
