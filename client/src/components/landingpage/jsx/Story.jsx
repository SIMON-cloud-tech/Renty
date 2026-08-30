import { useEffect, useRef } from 'react';
import '../css/Story.css';
import aboutImage from '/dining.jpeg'; // Replace with your furniture store image

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
          <h1>About FurniHaven</h1>
          <p>Quality furniture crafted for comfort — delivered across Nairobi since 2020.</p>
        </div>
      </section>

      {/* ── COMPANY INFO + IMAGE ── */}
      <section className="about-content">
        <div className="about-image">
          <img 
            src={aboutImage} 
            alt="FurniHaven Showroom" 
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="about-text">
          <h2>Who We Are</h2>
          <p>
            <strong>FurniHaven</strong> is a trusted furniture company in Kenya
            specializing in quality home and office furnishings. From executive 
            office chairs and ergonomic workstations to elegant living room sets, 
            durable wardrobes, and custom kitchen cabinets — we bring craftsmanship 
            and comfort to spaces across Karen, Kilimani, Umoja, Kitengela, and beyond.
          </p>
          <p>
            Founded in <strong>2020</strong>, FurniHaven has rapidly expanded 
            its services and successfully furnished over 500 homes, offices, 
            and institutions across Nairobi, Kiambu, and Machakos. From single 
            pieces to full office fit-outs, we deliver quality that lasts — 
            backed by a 2-year warranty and free delivery within Nairobi.
          </p>
          <p className="tagline">🪑 Quality You Can Trust</p>
        </div>
      </section>

      {/* ── MISSION, VISION, VALUES ── */}
      <section className="about-mvv" ref={sectionRef}>
        <div className="mvv-card">
          <h3>🎯 Mission</h3>
          <p>
            To provide high-quality, durable furniture that transforms spaces 
            and enhances lives — with exceptional service and lasting value.
          </p>
        </div>
        <div className="mvv-card">
          <h3>🔭 Vision</h3>
          <p>
            To become Kenya's most trusted furniture brand — recognized for 
            quality, reliability, and customer-first service.
          </p>
        </div>
        <div className="mvv-card">
          <h3>⭐ Core Values</h3>
          <ul>
            <li>Quality</li>
            <li>Integrity</li>
            <li>Customer First</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Story;