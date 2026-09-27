import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../SEO/Seo';
import '../css/Houses.css';
import { cacheUtil } from '../../../utils/cacheUtils';
import { FiArrowRight, FiMapPin, FiX } from 'react-icons/fi';

const UNITS_PER_LOAD = 6;
const LIGHT_UNITS_COUNT = 3;
const NEAR_RADIUS_KM = 5; // how far "near me" reaches

// ── Haversine: distance between two lat/lng points, in km ──
const distanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // earth radius in km
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const Houses = ({ variant = 'full' }) => {
  const navigate = useNavigate();
  const [allHouses, setAllHouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(
    variant === 'light' ? LIGHT_UNITS_COUNT : UNITS_PER_LOAD
  );
  const [loading, setLoading] = useState(true);
  const loadMoreRef = useRef(null);

  // ── Near-me state ──
  const [nearMe, setNearMe] = useState(null);        // { lat, lng } when active
  const [nearStatus, setNearStatus] = useState('');   // hint / error text

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

  // ── Near me: capture the client's coordinates ──
  const handleNearMe = useCallback(() => {
    // Toggle off if already active
    if (nearMe) {
      setNearMe(null);
      setNearStatus('');
      return;
    }

    if (!navigator.geolocation) {
      setNearStatus('Location is not supported on this device.');
      return;
    }

    setNearStatus('Getting your location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearStatus('');
      },
      (err) => {
        setNearStatus(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Enable it in your browser to use Near Me.'
            : 'Could not get your location. Try again outdoors.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [nearMe]);

  const clearNearMe = useCallback(() => {
    setNearMe(null);
    setNearStatus('');
  }, []);

  // ── Filter: search term, then near-me radius, then distance sort ──
  const filteredHouses = useMemo(() => {
    let list = allHouses;

    // Light variant: no filters, just the first N
    if (!isLight) {
      const term = searchTerm.toLowerCase().trim();
      if (term) {
        list = list.filter((h) =>
          (h.houseType || '').toLowerCase().includes(term) ||
          (h.location || '').toLowerCase().includes(term)
        );
      }
    }

    // Near-me: keep only units with coords within the radius, add distance, sort
    if (nearMe) {
      list = list
        .filter((h) => h.latitude != null && h.longitude != null)
        .map((h) => ({
          ...h,
          _distanceKm: distanceKm(nearMe.lat, nearMe.lng, h.latitude, h.longitude),
        }))
        .filter((h) => h._distanceKm <= NEAR_RADIUS_KM)
        .sort((a, b) => a._distanceKm - b._distanceKm);
    }

    return list;
  }, [searchTerm, allHouses, isLight, nearMe]);

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

                <button
                  className={`near-me-btn ${nearMe ? 'active' : ''}`}
                  onClick={handleNearMe}
                  aria-pressed={nearMe}
                  title={nearMe ? 'Showing homes near you' : 'Show homes near me'}
                >
                  {nearMe ? <FiX size={15} /> : <FiMapPin size={15} />}
                  {nearMe ? 'Clear' : 'Near Me'}
                </button>

                {hasMore && (
                  <button className="load-more-btn" onClick={handleLoadMore}>
                    Load More
                  </button>
                )}
              </div>

              {/* Status line: hint, error, or active-near-me summary */}
              {nearStatus && <p className="near-me-status">{nearStatus}</p>}
              {nearMe && !nearStatus && (
                <p className="near-me-status">
                  Showing homes within {NEAR_RADIUS_KM} km of you.
                  {filteredHouses.length === 0 && ' No pinned homes in this radius.'}
                  <button type="button" className="near-me-clear-inline" onClick={clearNearMe}>
                    Clear
                  </button>
                </p>
              )}
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
                {house._distanceKm != null && (
                  <span className="house-distance-badge">
                    {house._distanceKm < 1
                      ? `${Math.round(house._distanceKm * 1000)} m`
                      : `${house._distanceKm.toFixed(1)} km`}
                  </span>
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
            <p>
              {nearMe
                ? `No pinned homes within ${NEAR_RADIUS_KM} km. Try a different area or clear the filter.`
                : 'No results. Try a different search.'}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Houses;