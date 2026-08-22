import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQuoteLeft } from 'react-icons/fa';
import '../css/Testimonials.css';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonials');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setTestimonials(data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Auto‑rotate every 60 seconds
  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 60000);

    return () => clearInterval(interval);
  }, [testimonials]);

  // Manual dot navigation
  const goToSlide = (index) => setCurrentIndex(index);

  if (loading) return <div className="testimonials-loading">Loading testimonials...</div>;
  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <section className="testimonials-house">
      <div className="testimonial-header">
        <h2>What Our Customers Say</h2>
        <p>Real reviews from people who have furnished their spaces with us</p>
      </div>
      <section className="testimonials-section">
        {/* LEFT: CTA with background image */}
        <div className="testimonials-cta">
          <div className="cta-overlay">
            <h2>Find Your Perfect Piece</h2>
            <p>Join hundreds of satisfied customers who have transformed their spaces with quality furniture.</p>
            <div className="cta-buttons">
              <button className="btn-cta shop-btn" onClick={() => navigate('/products')}>
                Shop Now
              </button>
              <button className="btn-cta consult-btn" onClick={() => navigate('/contact')}>
                Consult
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Testimonial carousel */}
        <div className="testimonials-carousel">
          <div className="testimonial-card">
            <FaQuoteLeft className="quote-icon" />
            <p className="testimonial-text">{current.text}</p>
            <div className="testimonial-author">
              <span className="author-name">{current.name}</span>
              <span className="author-location">{current.location}</span>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="dot-indicators">
            {testimonials.map((_, idx) => (
              <span
                key={idx}
                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(idx)}
              />
            ))}
          </div>
        </div>
      </section>
    </section>
  );
};

export default Testimonials;