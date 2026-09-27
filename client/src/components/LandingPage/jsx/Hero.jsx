import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import heroData from '../../../data/hero.json';
import '../css/Hero.css';

// ── Constants (outside the component so they're created once) ──
const { slides, settings = {} } = heroData;
const SLIDE_MS = settings.slideDuration ?? 3000;
const FADE_S = settings.fadeDuration ?? 0.8;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.22 } },
};

// ── Hero ──
const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const videoRefs = useRef([]);
  const inView = useInView(heroRef, { amount: 0.2 });
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((i) => setCurrent(i), []);

  // Rotate: a fresh timeout per slide, so clicking a bar restarts the countdown.
  // Paused while the hero is off-screen or the user prefers reduced motion.
  useEffect(() => {
    if (!inView || reduce || slides.length < 2) return;
    const t = setTimeout(() => setCurrent(c => (c + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [current, inView, reduce]);

  // A new slide starts its video from the beginning
  useEffect(() => {
    const v = videoRefs.current[current];
    if (v) v.currentTime = 0;
  }, [current]);

  // Only the visible slide's video plays; the rest are paused to save CPU/GPU
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === current && inView && !reduce) {
        v.muted = true; // some browsers ignore the attribute for autoplay
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [current, inView, reduce]);

  const slide = slides[current];

  return (
    <section className="hero" ref={heroRef}>
      {/* ── Background videos (stacked, crossfaded) ── */}
      <div className="hero__videos" aria-hidden="true">
        {slides.map((s, i) => (
          <motion.video
            key={s.id}
            ref={(el) => { videoRefs.current[i] = el; }}
            className="hero__video"
            src={s.video}
            poster={s.poster}
            muted
            loop
            playsInline
            preload="auto"
            initial={false}
            animate={{ opacity: i === current ? 1 : 0, scale: i === current ? 1 : 1.06 }}
            transition={{ duration: reduce ? 0 : FADE_S, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── Darkening + blurred backdrop (left side only) ── */}
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__blur" aria-hidden="true" />

      {/* ── Overlay text for the current video ── */}
      <div className="hero__inner">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="hero__text"
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <motion.h1 variants={item} className="hero__title">{slide.title}</motion.h1>
            <motion.span variants={item} className="hero__accent" aria-hidden="true" />
            <motion.p variants={item} className="hero__subtitle">{slide.subtitle}</motion.p>
            <motion.p variants={item} className="hero__tagline">{slide.tagline}</motion.p>

            <motion.div variants={item} className="hero__cta">
              {slide.primaryCTA && slide.primaryPath && (
                <motion.button
                  type="button"
                  className="hero__btn hero__btn--primary"
                  onClick={() => navigate(slide.primaryPath)}
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {slide.primaryCTA} →
                </motion.button>
              )}
              {slide.secondaryCTA && slide.secondaryPath && (
                <motion.button
                  type="button"
                  className="hero__btn hero__btn--secondary"
                  onClick={() => navigate(slide.secondaryPath)}
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {slide.secondaryCTA} →
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
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
                  <motion.span
                    className="hero__bar-fill"
                    initial={{ scaleX: reduce ? 1 : 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: reduce ? 0 : SLIDE_MS / 1000, ease: 'linear' }}
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