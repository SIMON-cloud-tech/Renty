import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import heroData from '../../../data/hero.json';
import '../css/Hero.css';

const TEXT_EXIT_MS = 450;
const RAIN_DROP_COUNT = 80; // Number of rain drops

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const slideIntervalRef = useRef(null);
  const textTimeoutRef = useRef(null);
  const flipTimeoutRef = useRef(null);

  const { slides, settings } = heroData;
  const {
    slideDuration = 60000,
    transitionDuration = 1100,
    autoPlay = true,
    showDots = true,
  } = settings;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [outgoingSlide, setOutgoingSlide] = useState(null);
  const [direction, setDirection] = useState('next');
  const [isFlipping, setIsFlipping] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [textPhase, setTextPhase] = useState('text-in');

  // Generate rain drops once (memoized)
  const rainDrops = useMemo(() => {
    return Array.from({ length: RAIN_DROP_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position (%)
      animationDuration: 0.8 + Math.random() * 0.8, // 0.8s - 1.6s
      animationDelay: Math.random() * 2, // Random delay
      height: 10 + Math.random() * 15, // Drop length (10-25px)
      opacity: 0.2 + Math.random() * 0.4, // Subtle opacity (0.2-0.6)
      width: Math.random() > 0.7 ? 2 : 1, // Some drops thicker
    }));
  }, []);

  useEffect(() => {
    heroRef.current?.style.setProperty('--flip-duration', `${transitionDuration}ms`);
  }, [transitionDuration]);

  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const goToSlide = useCallback(
    (index, dir) => {
      if (isFlipping || index === currentSlide) return;

      const resolvedDir =
        dir || (index > currentSlide || (currentSlide === slides.length - 1 && index === 0)
          ? 'next'
          : 'prev');

      setDirection(resolvedDir);
      setOutgoingSlide(currentSlide);
      setCurrentSlide(index);
      setIsFlipping(true);

      setTextPhase('text-out');
      clearTimeout(textTimeoutRef.current);
      textTimeoutRef.current = setTimeout(() => {
        setTextIndex(index);
        setTextPhase('text-in');
      }, TEXT_EXIT_MS);

      clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = setTimeout(() => {
        setIsFlipping(false);
        setOutgoingSlide(null);
      }, transitionDuration);
    },
    [currentSlide, isFlipping, slides.length, transitionDuration]
  );

  const nextSlide = useCallback(() => {
    const nextIndex = (currentSlide + 1) % slides.length;
    goToSlide(nextIndex, 'next');
  }, [currentSlide, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prevIndex, 'prev');
  }, [currentSlide, slides.length, goToSlide]);

  useEffect(() => {
    if (!autoPlay) return;
    slideIntervalRef.current = setInterval(nextSlide, slideDuration);
    return () => clearInterval(slideIntervalRef.current);
  }, [autoPlay, slideDuration, nextSlide]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('hero-visible');
        });
      },
      { threshold: 0.1 }
    );

    const currentHero = heroRef.current;
    if (currentHero) observer.observe(currentHero);

    return () => {
      if (currentHero) observer.unobserve(currentHero);
      clearInterval(slideIntervalRef.current);
      clearTimeout(textTimeoutRef.current);
      clearTimeout(flipTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      else if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, [slides]);

  const displayedTextSlide = slides[textIndex];

  return (
    <section className="hero" ref={heroRef}>
      {/* Background: current slide + flipping layer */}
      <div className="hero-background">
        <div
          className="hero-bg-current ken-burns"
          style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
        />

        {outgoingSlide !== null && (
          <div
            className={`hero-bg-flip dir-${direction} ${isFlipping ? 'flip-out' : ''}`}
            style={{ backgroundImage: `url(${slides[outgoingSlide].image})` }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Rain Overlay - NEW */}
      <div className="hero-rain" aria-hidden="true">
        {rainDrops.map((drop) => (
          <span
            key={drop.id}
            className="rain-drop"
            style={{
              left: `${drop.left}%`,
              animationDuration: `${drop.animationDuration}s`,
              animationDelay: `${drop.animationDelay}s`,
              height: `${drop.height}px`,
              width: `${drop.width}px`,
              opacity: drop.opacity,
            }}
          />
        ))}
      </div>

      {/* Content Overlay */}
      <div className="hero-overlay">
        <div className="hero-content">
          <div className={`hero-text-content ${textPhase}`}>
            <h2 className="hero-title">{displayedTextSlide.title}</h2>

            <p className="hero-subtitle">{displayedTextSlide.subtitle}</p>

            <h4 className="marketing-strip">{displayedTextSlide.tagline}</h4>

            <div className="hero-cta">
              {displayedTextSlide.primaryCTA && displayedTextSlide.primaryPath && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleNavigation(displayedTextSlide.primaryPath)}
                >
                  {displayedTextSlide.primaryCTA}
                </button>
              )}

              {displayedTextSlide.secondaryCTA && displayedTextSlide.secondaryPath && (
                <button
                  className="btn btn-secondary"
                  onClick={() => handleNavigation(displayedTextSlide.secondaryPath)}
                >
                  {displayedTextSlide.secondaryCTA}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      {showDots && (
        <div className="hero-dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;