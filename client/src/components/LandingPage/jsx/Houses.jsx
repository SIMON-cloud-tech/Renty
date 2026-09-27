import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../SEO/Seo';
import '../css/Houses.css';
import { cacheUtil } from '../../../utils/cacheUtils';
import { FiArrowRight } from 'react-icons/fi';

const UNITS_PER_LOAD = 6;
const LIGHT_UNITS_COUNT = 3;

const Houses = ({ variant = 'full' }) => {
  const navigate = useNavigate();
  const [allHouses, setAllHouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(
    variant === 'light' ? LIGHT_UNITS_COUNT : UNITS_PER_LOAD
  );
  const [loading, setLoading] = useState(true);
  const loadMoreRef = useRef(null);

  const isLight = variant === 'light';
  const isFull = variant === 'full';

  // ── Fetch data ──
  useEffect(() => {
    const fetchData = async () => {
      const cacheKey = isLight ? 'renty_units_preview' : 'renty_units_all';

      const cached = cacheUtil.get(cacheKey);
      if (cached) {
        setAllHouses(cached);
        setLoading(false);
        return;
      }

      try {
        const endpoint = isLight ? '/api/house/units' : '/api/house/units/all';
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        cacheUtil.set(cacheKey, data);
        setAllHouses(data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLight]);

  // ── Filter — full variant uses search only ──
  const filteredHouses = useMemo(() => {
    if (isLight) return allHouses;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allHouses;
    return allHouses.filter((h) =>
      (h.houseType || '').toLowerCase().includes(term) ||
      (h.location || '').toLowerCase().includes(term)
    );
  }, [searchTerm, allHouses, isLight]);

  // ── Visible slice ──
  const visibleHouses = useMemo(() => {
    const limit = isLight ? LIGHT_UNITS_COUNT : visibleCount;
    return filteredHouses.slice(0, limit);
  }, [filteredHouses, visibleCount, isLight]);

  const hasMore = isFull && visibleCount < filteredHouses.length;

  // ── Handlers ──
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    if (isFull) setVisibleCount(UNITS_PER_LOAD);
  }, [isFull]);

  const handleLoadMore = useCallback(() => {
    if (isFull) setVisibleCount((prev) => prev + UNITS_PER_LOAD);
  }, [isFull]);

  const handleViewAll = useCallback(() => {
    navigate('/houses');
  }, [navigate]);

  const handleRent = useCallback((unitId) => {
    navigate(`/houses/${unitId}`);
  }, [navigate]);

  // ── IntersectionObserver (full variant only) ──
  useEffect(() => {
    if (!isFull || !loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isFull, hasMore, handleLoadMore]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="houses-loading">
        <div className="spinner"></div>
        <p>Loading homes...</p>
      </div>
    );
  }

  // ── Empty ──
  if (allHouses.length === 0) {
    return (
      <div className={`houses-page ${isLight ? 'houses-light' : 'houses-full'}`}>
        <div className="houses-header">
          <h2>{isLight ? 'Available Homes' : 'Browse All Homes'}</h2>
          <p>No homes available right now. Check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isFull && (
        <SEO
          title="Houses for Rent in Nairobi | RentY"
          description="Browse verified, vacant houses and apartments for rent across Nairobi. Find your next home today."
          keywords="houses for rent Nairobi, apartments Nairobi, bedsitter Nairobi, single room Nairobi"
        />
      )}

      <div className={`houses-page ${isLight ? 'houses-light' : 'houses-full'}`}>
        {/* ── Header ── */}
        <div className="houses-header">
          {isLight ? (
            <div className="houses-header-row">
              <div>
                <h5 className="houses-strip">Homes ready for you</h5>
                <h1 className="houses-title">Find a place to live</h1>
                <p className="houses-subtitle">
                  Browse verified, vacant units across Nairobi. One search, one match, one move.
                </p>
              </div>
              <button className="view-all-link" onClick={handleViewAll}>
                View All <FiArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <h2>Browse All Homes</h2>
              <p>
                Verified vacant units across Nairobi — single rooms, bedsitters,
                and family apartments. Every listing is posted by a real landlord.
              </p>

              <div className="search-loadmore-wrapper">
                <div className="searchbar">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by type or location..."
                    value={searchTerm}
                    onChange={handleSearch}
                    aria-label="Search houses"
                  />
                </div>
                {hasMore && (
                  <button className="load-more-btn" onClick={handleLoadMore}>
                    Load More
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Grid ── */}
        <div className="houses-grid">
          {visibleHouses.map((house) => (
            <div
              key={house.id || house._id}
              className="house-card"
            >
              <div className="house-image">
                {house.images?.length > 0 ? (
                  <img src={house.images[0]} alt={house.houseType} loading="lazy" />
                ) : (
                  <div className="placeholder-image">No Image</div>
                )}
              </div>

              <div className="house-info">
                <h3>{house.houseType}</h3>
                <p className="house-location">📍 {house.location}</p>
                <p className="house-price">
                  KES {Number(house.rent || 0).toLocaleString()} / month
                </p>
                <p className="house-description">
                  {house.description && house.description.length > 90
                    ? `${house.description.substring(0, 90)}...`
                    : house.description}
                </p>
              </div>

              <div className="house-actions">
                <button
                  className="rent-btn"
                  onClick={() => handleRent(house.id || house._id)}
                >
                  Rent <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More trigger — full variant only */}
        {isFull && hasMore && (
          <div ref={loadMoreRef} className="load-more-trigger">
            <div className="spinner small"></div>
          </div>
        )}

        {visibleHouses.length === 0 && (
          <div className="no-houses">
            <p>No results. Try a different search.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Houses;