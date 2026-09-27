import { useEffect, useRef } from 'react';
import '../css/Story.css';
import aboutImage from '/about.jpeg';

const Story = () => {
  const sectionRef = useRef(null);

  // Lazy load animations on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('mvv-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.mvv-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      {/* ── HERO / INTRO SECTION ── */}
      <section className="about-hero">
        <div className="about-hero-overlay">
          <h1>About Renty</h1>
          <p>Connecting renters to verified homes across Nairobi.</p>
        </div>
      </section>

      {/* ── COMPANY INFO + IMAGE ── */}
      <section className="about-content">
        <div className="about-image">
          <img
            src={aboutImage}
            alt="Renty — verified homes in Nairobi"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="about-text">
          <h2>Who We Are</h2>
          <p>
            <strong>Renty</strong> is a Nairobi-based rental platform built to make
            house hunting simple and honest. From single rooms and bedsitters to
            family apartments, we list vacant units from verified landlords — with
            real photos, clear rent, and direct contact.
          </p>
          <p>
            Founded in <strong>2024</strong>, Renty helps renters search by
            location and budget instead of walking from gate to gate. Every listing
            goes through the landlord before it goes live, and every enquiry reaches
            a real person — no agents, no hidden fees, no middlemen.
          </p>
          <p className="tagline">🏠 Rent smarter. Live better.</p>
        </div>
      </section>

      {/* ── MISSION, VISION, VALUES ── */}
      <section className="about-mvv" ref={sectionRef}>
        <div className="mvv-card">
          <h3>🎯 Mission</h3>
          <p>
            To make renting in Kenya transparent, direct, and stress-free for both
            renters and landlords.
          </p>
        </div>
        <div className="mvv-card">
          <h3>🔭 Vision</h3>
          <p>
            To become East Africa&apos;s most trusted rental platform — known for
            verified listings, honest pricing, and real human contact.
          </p>
        </div>
        <div className="mvv-card">
          <h3>⭐ Core Values</h3>
          <ul>
            <li>Transparency</li>
            <li>Trust</li>
            <li>Directness</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Story;