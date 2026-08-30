import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/landingpage/jsx/Loader.jsx';
// Layouts
import PublicLayout from './layouts/PublicLayout.jsx';

// Public pages
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Products from './components/landingpage/jsx/Products.jsx';
import ProductDetail from './components/landingpage/jsx/ProductDetail.jsx';
import BlogDetail from './components/landingpage/jsx/BlogDetail.jsx';
import BlogSection from './components/landingpage/jsx/BlogSection.jsx';
import CategoryPage from './components/landingpage/jsx/CategoryPage.jsx';
import Guides from './components/landingpage/jsx/Guides.jsx';
import NewArrivals from './components/landingpage/jsx/NewArrivals.jsx';
import GuideDetail from './components/landingpage/jsx/GuideDetail.jsx';
import Privacy from './components/landingpage/jsx/Privacy.jsx';

// Admin / Auth
import Auth from './components/dashboard/jsx/Auth.jsx';
import Reset from './components/dashboard/jsx/Reset.jsx';
import Dashboard from './components/dashboard/jsx/Dashboard.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const isAuthenticated = !!user;

  return (
    <Routes>
      {/* ===== PUBLIC ROUTES (with Navbar + Footer) ===== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products variant="full" />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blogs" element={<BlogSection />} />
        <Route path='guides' element={<Guides variant='full' />} />
        <Route path="/guides/:id" element={<GuideDetail />} />
        <Route path='/newarrivals' element={<NewArrivals />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />

        {/* ===== SHOP CATEGORIES (filter by category) ===== */}
        <Route path="/shop/sofas" element={<CategoryPage filterType="category" filterValue="sofas" title="Sofas" />} />
        <Route path="/shop/beds" element={<CategoryPage filterType="category" filterValue="beds" title="Beds" />} />
        <Route path="/shop/tables" element={<CategoryPage filterType="category" filterValue="tables" title="Tables" />} />
        <Route path="/shop/outdoor" element={<CategoryPage filterType="category" filterValue="outdoor" title="Outdoor" />} />
        <Route path="/shop/office" element={<CategoryPage filterType="category" filterValue="office" title="Office" />} />

        {/* ===== ROOM CATEGORIES (filter by room) ===== */}
        <Route path="/rooms/living-room" element={<CategoryPage filterType="room" filterValue="living-room" title="Living Room" />} />
        <Route path="/rooms/bedroom" element={<CategoryPage filterType="room" filterValue="bedroom" title="Bedroom" />} />
        <Route path="/rooms/kitchen" element={<CategoryPage filterType="room" filterValue="kitchen" title="Kitchen" />} />
        <Route path="/rooms/home-office" element={<CategoryPage filterType="room" filterValue="home-office" title="Home Office" />} />
        <Route path="/rooms/outdoor-spaces" element={<CategoryPage filterType="room" filterValue="outdoor-spaces" title="Outdoor Spaces" />} />
      </Route>

      {/* ===== HIDDEN ADMIN LOGIN ===== */}
      <Route
        path="/admin"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Auth setUser={setUser} />
          )
        }
      />

      {/* ===== PASSWORD RESET ===== */}
      <Route path="/reset" element={<Reset />} />

      {/* ===== PROTECTED DASHBOARD ===== */}
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated ? (
            <Dashboard setUser={setUser} />
          ) : (
            <Navigate to="/admin" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;