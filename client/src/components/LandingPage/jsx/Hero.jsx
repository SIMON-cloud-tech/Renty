import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import heroData from '../../../data/hero.json';
import '../css/Hero.css';

// ── Constants ──
const { slides, settings = {} } = heroData;
const SLIDE_MS = settings.slideDuration ?? 3000;

// Single background video for every slide — pulled from hero.json settings.
const HERO_VIDEO = settings.video ?? '/bg2.mp4';

// Respect the user's motion preference. Falls back to false on old browsers.
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [reduce, setReduce] = useState(prefersReducedMotion);

  // Keep `reduce` in sync if the user toggles it while the page is open
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const onChange = (e) => setReduce(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const goTo = useCallback((i) => setCurrent(i), []);

  // Rotate slides. Text changes; the video underneath keeps playing.
  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const t = setTimeout(() => setCurrent((c) => (c + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [current, reduce]);

  // Play the video only while the hero is on screen.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reduce) {
          v.muted = true;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(v);
    return () => observer.disconnect();
  }, [reduce]);

  const slide = slides[current];

  return (
    <section className="hero" ref={heroRef}>
      {/* ── Single background video ── */}
      <div className="hero__videos" aria-hidden="true">
        <video
          ref={videoRef}
          className="hero__video"
          src={HERO_VIDEO}
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>

      {/* ── Darkening + blurred backdrop (left side only) ── */}
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__blur" aria-hidden="true" />

      {/* ── Overlay text — the `key` remounts this block on every slide change,
             so the CSS entry animation replays ── */}
      <div className="hero__inner">
        <div key={slide.id} className="hero__text">
          <h1 className="hero__title">{slide.title}</h1>
          <span className="hero__accent" aria-hidden="true" />
          <p className="hero__subtitle">{slide.subtitle}</p>
          <p className="hero__tagline">{slide.tagline}</p>

          <div className="hero__cta">
            {slide.primaryCTA && slide.primaryPath && (
              <button
                type="button"
                className="hero__btn hero__btn--primary"
                onClick={() => navigate(slide.primaryPath)}
              >
                {slide.primaryCTA} →
              </button>
            )}
            {slide.secondaryCTA && slide.secondaryPath && (
              <button
                type="button"
                className="hero__btn hero__btn--secondary"
                onClick={() => navigate(slide.secondaryPath)}
              >
                {slide.secondaryCTA} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Progress bars ── */}
      {slides.length > 1 && (
        <div className="hero__progress">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="hero__bar"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current}
            >
              <span className="hero__bar-track">
                {i === current && (
                  <span
                    className="hero__bar-fill"
                    style={{
                      animationDuration: reduce ? '0s' : `${SLIDE_MS}ms`,
                    }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default memo(Hero);