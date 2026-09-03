import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import heroData from '../../../data/hero.json';
import '../css/Hero.css';

const TEXT_EXIT_MS = 450;
const WHATSAPP_NUMBER = '254700000000'; // TODO: replace with real number

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const slideIntervalRef = useRef(null);
  const textTimeoutRef = useRef(null);
  const flipTimeoutRef = useRef(null);

  const { slides, settings } = heroData;
  const {
    slideDuration = 60000,
    transitionDuration = 1500,
    autoPlay = true,
    showDots = true,
  } = settings;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [outgoingSlide, setOutgoingSlide] = useState(null);
  const [direction, setDirection] = useState('next');
  const [isFlipping, setIsFlipping] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [textPhase, setTextPhase] = useState('text-in');

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
    <section className="hero-split" ref={heroRef}>
      {/* ===== LEFT — text column, plain background ===== */}
      <div className="hero-split__content">
        <div className={`hero-split__text ${textPhase}`}>
          <h2 className="hero-split__title">{displayedTextSlide.title}</h2>
          <span className="hero-split__accent-line" aria-hidden="true" />

          <p className="hero-split__subtitle">{displayedTextSlide.subtitle}</p>

          <p className="hero-split__tagline">{displayedTextSlide.tagline}</p>

          <div className="hero-split__cta">
            {displayedTextSlide.primaryCTA && displayedTextSlide.primaryPath && (
              <button
                className="btn btn-primary"
                onClick={() => handleNavigation(displayedTextSlide.primaryPath)}
              >
                {displayedTextSlide.primaryCTA} →
              </button>
            )}
            {displayedTextSlide.secondaryCTA && displayedTextSlide.secondaryPath && (
              <button
                className="btn btn-secondary"
                onClick={() => handleNavigation(displayedTextSlide.secondaryPath)}
              >
                {displayedTextSlide.secondaryCTA} →
              </button>
            )}
          </div>
        </div>

        {showDots && (
          <div className="hero-split__dots">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                style={
                  index === currentSlide
                    ? { '--dot-play-state': autoPlay ? 'running' : 'paused' }
                    : undefined
                }
              >
                {index === currentSlide && (
                  <span
                    className="hero-dot-fill"
                    style={{ animationDuration: `${slideDuration}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== RIGHT — angled image panel ===== */}
      <div className="hero-split__media">
        <span className="hero-split__badge">
          <span>Trusted</span>
          <strong>Quality</strong>
        </span>

        <div className="hero-split__image-wrap">
          <div className="hero-split__image-shadow" aria-hidden="true" />

          <div
            className="hero-split__image-current"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          />

          {outgoingSlide !== null && (
            <div
              className={`hero-split__image-flip dir-${direction} ${isFlipping ? 'flip-out' : ''}`}
              style={{ backgroundImage: `url(${slides[outgoingSlide].image})` }}
              aria-hidden="true"
            />
          )}

          <div className="hero-split__vignette" aria-hidden="true" />
          <div className="hero-split__grain" aria-hidden="true" />
        </div>
      </div>

      {/* ===== Floating WhatsApp ===== */}
    </section>
  );
};

export default Hero;