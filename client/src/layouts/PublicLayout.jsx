import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/LandingPage/jsx/Footer.jsx';
import Navbar from '../components/LandingPage/jsx/Navbar.jsx';
import Chatbot from '../components/LandingPage/jsx/Chatbot.jsx';
import CookieConsent from '../components/LandingPage/jsx/CookieConsent.jsx';

const PublicLayout = () => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <>
      <Navbar cart={cart} setCart={setCart} cartCount={cartCount} />
      <main className="public-main">
        <Outlet context={{ cart, setCart }} />
      </main>
      <Chatbot />
      <Footer />
      <CookieConsent />
    </>
  );
};

export default PublicLayout;