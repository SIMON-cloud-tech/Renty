import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/LandingPage/jsx/Loader.jsx';

// import the layout
import PublicLayout from './layouts/PublicLayout.jsx';

// public pages
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import ComparePage from './components/LandingPage/jsx/ComparePage.jsx';
import HousesPage from './pages/HousesPage.jsx';
import Contact from './pages/Contact.jsx';
import Affordability from './components/LandingPage/jsx/Affordability.jsx';
import Blog from './components/LandingPage/jsx/BlogSection.jsx';
import Guides from './components/LandingPage/jsx/Guides.jsx';
import Privacy from './components/LandingPage/jsx/Privacy.jsx';
import GuideDetail from './components/LandingPage/jsx/GuideDetail.jsx';
import BlogDetail from './components/LandingPage/jsx/BlogDetail.jsx';
import HouseDetail from './components/LandingPage/jsx/HouseDetail.jsx';
import Partners from './components/LandingPage/jsx/Partners.jsx';
import Terms from './components/LandingPage/jsx/Terms.jsx';

// Auth
import Auth from './components/Business/jsx/Auth.jsx';
import Reset from './components/Business/jsx/Reset.jsx';

// Dashboards (one per role)
import BusinessDashboard from './components/Business/jsx/Dashboard.jsx';
import LandlordDashboard from './components/Landlord/jsx/LandlordDashboard.jsx';
import ClientDashboard from './components/Client/jsx/ClientDashboard.jsx';

// Where each role lands after login
const HOME = { business: '/business', landlord: '/landlord', client: '/client' };

// Only renders its children for the matching role
const RoleRoute = ({ user, role, children }) => {
  if (!user) return <Navigate to="/admin" replace />;
  if (user.role !== role) return <Navigate to={HOME[user.role] || '/admin'} replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        setUser(res.ok ? await res.json() : null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <Loader />;

  // Null if logged out, or if the session has no valid role (e.g. an old cookie)
  const homePath = user ? HOME[user.role] : null;

  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={ <Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/houses" element={<HousesPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blogs" element={<Blog />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/guides/:id" element={<GuideDetail />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/houses/:id" element={<HouseDetail />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/affordability" element={<Affordability />} />
        <Route path="compare" element={<ComparePage />} />
      </Route>

      {/* One login/signup form for all roles */}
      <Route
        path="/admin"
        element={homePath ? <Navigate to={homePath} replace /> : <Auth setUser={setUser} />}
      />

      <Route path="/reset" element={<Reset />} />

      <Route
        path="/business/*"
        element={
          <RoleRoute user={user} role="business">
            <BusinessDashboard setUser={setUser} />
          </RoleRoute>
        }
      />
      <Route
        path="/landlord/*"
        element={
          <RoleRoute user={user} role="landlord">
            <LandlordDashboard setUser={setUser} />
          </RoleRoute>
        }
      />
      <Route
        path="/client/*"
        element={
          <RoleRoute user={user} role="client">
            <ClientDashboard setUser={setUser} />
          </RoleRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;