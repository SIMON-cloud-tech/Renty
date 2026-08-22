import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Hero.css';

// ===== Configuration object for easy updates =====
const HERO_CONFIG = {
  title: 'Find Furniture That Fits Your Life',
  subtitle: `From office to living room — quality you can feel. 
    We deliver across Nairobi, from Karen and Kilimani to Umoja and Kitengela. 
    Whether you need a single piece or a full office setup, we bring craftsmanship and comfort to your space.`,
  tagline: '🪑 Handcrafted · 🛋️ Quality Guaranteed · 🚚 Free Delivery Nairobi · 🔒 2-Year Warranty',
  primaryCTA: 'Browse Collection',
  primaryPath: '/products',
  secondaryCTA: 'View Deals',
  secondaryPath: '/contact',
};

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // ===== Navigation handlers using object lookup =====
  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // ===== Lazy load animation on scroll =====
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('hero-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentHero = heroRef.current;
    if (currentHero) {
      observer.observe(currentHero);
    }

    return () => {
      if (currentHero) {
        observer.unobserve(currentHero);
      }
    };
  }, []);

  // ===== Button config array for cleaner rendering =====
  const buttons = [
    { label: HERO_CONFIG.primaryCTA, path: HERO_CONFIG.primaryPath, type: 'btn-primary' },
    { label: HERO_CONFIG.secondaryCTA, path: HERO_CONFIG.secondaryPath, type: 'btn-secondary' },
  ];

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-overlay">
        <div className="hero-content">
          <h2 className="hero-title">
            {HERO_CONFIG.title}
          </h2>

          <p className="hero-subtitle">
            {HERO_CONFIG.subtitle}
          </p>

          <h4 className="marketing-strip">
            {HERO_CONFIG.tagline}
          </h4>

          <div className="hero-cta">
            {buttons.map(({ label, path, type }) => (
              <button
                key={label}
                className={`btn ${type}`}
                onClick={() => handleNavigation(path)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;