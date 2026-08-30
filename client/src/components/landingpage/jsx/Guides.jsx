import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Guides.css';

const LIGHT_COUNT = 2;
const INITIAL_FULL_COUNT = 6;
const LOAD_MORE_COUNT = 3;

const GuideCard = ({ guide }) => (
  <div
    className="guide-card"
    style={{
      display: 'grid',
      gridTemplateColumns: '3fr 1fr',
      gridAutoRows: '400px',
      alignItems: 'stretch',
      margin: 0,
      padding: 0,
    }}
  >
    <img
      src={guide.image}
      alt={guide.title}
      className="guide-image"
      loading="lazy"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        display: 'block',
        margin: 0,
        padding: 0,
        border: 'none',
      }}
    />

    <div className="guide-content">
      <h3 className="guide-title">{guide.title}</h3>
      <p className="guide-description">{guide.description}</p>

      {guide.features && guide.features.length > 0 && (
        <ul className="guide-features">
          {guide.features.map((feature, i) => (
            <li key={i} className="guide-feature-item">
              <span className="feature-bullet">•</span>
              {feature}
            </li>
          ))}
        </ul>
      )}
       {/* Add Read More link */}
      <Link to={`/guides/${guide.id}`} className="guide-read-more">
        Read More →
      </Link>
    </div>
  </div>
);

const Guides = ({ variant = 'light' }) => {
  const [guides, setGuides] = useState([]);
  const [visibleCount, setVisibleCount] = useState(
    variant === 'full' ? INITIAL_FULL_COUNT : LIGHT_COUNT
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchGuides = async () => {
      try {
        const res = await fetch('/api/guides', { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch guides');
        const data = await res.json();

        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setGuides(sorted);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch error:', err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
    return () => controller.abort();
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((count) => count + LOAD_MORE_COUNT);
  }, []);

  const handleViewAll = useCallback(() => {
    navigate('/guides');
  }, [navigate]);

  const isFull = variant === 'full';

  const visibleGuides = useMemo(
    () => guides.slice(0, visibleCount),
    [guides, visibleCount]
  );

  const hasMore = isFull && visibleCount < guides.length;

  if (loading) {
    return (
      <section className="guides-section">
        <div className="guides-loading">
          <div className="spinner"></div>
          <p>Loading guides...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="guides-section">
        <div className="guides-error">
          <p>Failed to load guides. Please try again later.</p>
        </div>
      </section>
    );
  }

  if (guides.length === 0) {
    return (
      <section className="guides-section">
        <div className="guides-empty">
          <p>No guides available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="guides-section" aria-label="Furniture Guides">
      <div className="guides-container">
        <div className="guides-header">
          <h2>{isFull ? 'All Furniture Guides' : 'Furniture Guides'}</h2>
          <p>
            Expert tips and advice to help you choose the perfect furniture
            for your home and office
          </p>
        </div>

        <div className="guides-list">
          {visibleGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>

        {isFull ? (
          hasMore && (
            <div className="guides-cta">
              <button className="view-all-guides-btn" onClick={handleLoadMore}>
                Load More
              </button>
            </div>
          )
        ) : (
          <div className="guides-cta">
            <button className="view-all-guides-btn" onClick={handleViewAll}>
              View All Guides →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Guides;