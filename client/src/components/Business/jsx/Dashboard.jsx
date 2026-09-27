import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiHome, FiUser, FiUsers, FiXCircle, FiSettings, FiLogOut, FiSun, FiMoon,
  FiMenu, FiX, FiChevronDown, FiChevronRight, FiEdit, FiBookOpen, FiMessageCircle, FiBarChart2
} from 'react-icons/fi';
import '../css/Dashboard.css';
import Units from './Units.jsx';
import Landlords from './Landlords.jsx';
import Clients from './Clients.jsx';
import Cancellations from './Cancellations.jsx';
import Blogs from './BlogManage.jsx';
import Guides from './GuidesManage.jsx';
import Bot from './Bot.jsx';
import LeadAnalytics from './LeadAnalytics.jsx';
import BlogAnalytics from './BlogAnalytics.jsx';
import GuideAnalytics from './GuideAnalytics.jsx';
import BotAnalytics from './BotAnalytics.jsx';
import Lead from './Lead.jsx';
import Testimonials from './TestimonialManage.jsx';


const MENU_ICONS = {
  unit: FiHome,
  landlord: FiUser,
  client: FiUsers,
  cancellation: FiXCircle,
  blog: FiEdit,
  guide: FiBookOpen,
  bot: FiMessageCircle,
  leads: FiUsers,
  analytics: FiBarChart2,
  'analytics-leads': FiUsers,
  'analytics-blogs': FiEdit,
  'analytics-guides': FiBookOpen,
  'analytics-bot': FiMessageCircle,
};

const MENU_ITEMS = [
  { id: 'unit', label: 'Units' },
  { id: 'landlord', label: 'Landlords' },
  { id: 'client', label: 'Clients' },
  { id: 'cancellation', label: 'Cancellations' },
  { id: 'blog', label: 'Blogs' },
  { id: 'guides', label: 'Guides' },
  { id: 'testimonials', label: 'Testimonials' },
  { 
    id: 'analytics', 
    label: 'Analytics',
    children: [
      { id: 'analytics-blogs', label: 'Blogs' },
      { id: 'analytics-guides', label: 'Guides' },
      { id: 'analytics-bot', label: 'Bot' },
    ]
  },
];

const COMPONENT_MAP = {
  guides: Guides,
  unit: Units,
  landlord: Landlords,
  client: Clients,
  cancellation: Cancellations,
  blog: Blogs,
  testimonials: Testimonials,
  guide: Guides,
  bot: Bot,
  leads: Lead,
  'analytics-leads': LeadAnalytics,
  'analytics-blogs': BlogAnalytics,
  'analytics-guides': GuideAnalytics,
  'analytics-bot': BotAnalytics,
};

// ── Helper ──
const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
};

// ── Business Dashboard ──
const Dashboard = ({ setUser }) => {
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
        <div className="sidebar-header"><h2>Business Dashboard</h2></div>
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
          <p>© {new Date().getFullYear()} Business Dashboard. All Rights Reserved. <Link to='/houses'>Go back</Link></p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;