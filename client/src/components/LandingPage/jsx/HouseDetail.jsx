import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import SEO from '../../SEO/Seo';
import '../css/HouseDetail.css';
import { cacheUtil } from '../../../utils/cacheUtils';
import { startRent, pollPayment } from '../../../utils/rentUtil';

const HouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [house, setHouse] = useState(null);
  const [allHouses, setAllHouses] = useState([]);
  const [landlord, setLandlord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rentState, setRentState] = useState({ busy: false, message: '' });

  // ── Fetch house, all houses, and landlord ──
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setLandlord(null);
    setRentState({ busy: false, message: '' });
    window.scrollTo(0, 0); // a new house starts at the top

    const fetchData = async () => {
      try {
        const [houseRes, allRes] = await Promise.all([
          fetch(`/api/house/units/${id}`, { signal: controller.signal }),
          fetch('/api/house/units/all', { signal: controller.signal }),
        ]);

        if (!houseRes.ok) throw new Error('House not found');
        if (!allRes.ok) throw new Error('Failed to fetch houses');

        const houseData = await houseRes.json();
        const allData = await allRes.json();
        const allList = Array.isArray(allData) ? allData : [];

        setHouse(houseData && typeof houseData === 'object' ? houseData : null);
        setAllHouses(allList);
        cacheUtil.set('renty_units_all', allList);

        // Landlord is stored on the unit as userId
        if (houseData?.userId) {
          const landlordRes = await fetch(
            `/api/house/units/landlord/${houseData.userId}`,
            { signal: controller.signal }
          );
          if (landlordRes.ok) setLandlord(await landlordRes.json());
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Fetch error:', err);
        setError(true);
        setHouse(null);
      } finally {
        // Don't clear loading for a request that was cancelled
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [id]);

  const handleGoBack = useCallback(() => {
    navigate('/houses');
  }, [navigate]);

  // ── Rent Now: the util does the work, this just shows the progress ──
  const handleRent = useCallback(async () => {
    setRentState({ busy: true, message: '' });

    const result = await startRent(house.id || house._id, navigate);
    if (result.redirected) return; // sent to login
    if (!result.ok) {
      setRentState({ busy: false, message: result.message });
      return;
    }

    setRentState({ busy: true, message: 'Check your phone and enter your M-Pesa PIN...' });
    const final = await pollPayment(result.paymentId);

    setRentState({
      busy: false,
      message:
        final === 'paid'
          ? 'Payment received! Your booking is confirmed. You can track it in your dashboard.'
          : final === 'failed'
            ? 'The payment was not completed. You can try again.'
            : 'We have not received confirmation yet. Please check your dashboard shortly.',
    });
  }, [house, navigate]);

  // ── Related houses — same type OR within ±20% rent ──
  const relatedHouses = useMemo(() => {
    if (!house || allHouses.length === 0) return [];
    const currentId = house.id || house._id;

    const sameType = allHouses.filter(
      (h) => (h.id || h._id) !== currentId && h.houseType === house.houseType
    );
    const nearbyRent = allHouses.filter((h) => {
      const hid = h.id || h._id;
      if (hid === currentId) return false;
      if (sameType.some((s) => (s.id || s._id) === hid)) return false;
      return Math.abs(h.rent - house.rent) <= house.rent * 0.2;
    });
    return [...sameType, ...nearbyRent].slice(0, 4);
  }, [house, allHouses]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="house-detail-loading">
        <div className="spinner"></div>
        <p>Loading house details...</p>
      </div>
    );
  }

  // ── Error ──
  if (error || !house) {
    return (
      <div className="house-detail-notfound">
        <h2>House Not Found</h2>
        <p>Sorry, this house does not exist or has been removed.</p>
        <button className="back-btn" onClick={handleGoBack}>
          ← Back to Houses
        </button>
      </div>
    );
  }

  // Only vacant houses can be rented (a missing status counts as vacant)
  const canRent = !house.status || house.status === 'vacant';

  return (
    <>
      <SEO
        title={`${house.houseType} in ${house.location}`}
        description={house.description || `A ${house.houseType} available for rent in ${house.location}.`}
        ogImage={house.images?.[0]}
        keywords={`house for rent, ${house.houseType}, ${house.location}, Nairobi rental`}
      />

      <div className="house-detail">
        <button className="back-btn" onClick={handleGoBack}>
          <FaArrowLeft /> Back to Houses
        </button>

        {/* ── Main ── */}
        <div className="house-detail-main">
          <div className="house-detail-image">
            {house.images?.length > 0 ? (
              <img src={house.images[0]} alt={house.houseType} />
            ) : (
              <div className="placeholder-image">No Image</div>
            )}
            {house.status && <span className="house-status-badge">{house.status}</span>}
          </div>

          <div className="house-detail-info">
            <h1>{house.houseType}</h1>
            <p className="house-detail-location">📍 {house.location}</p>

            <div className="house-detail-price">
              KES {Number(house.rent).toLocaleString()} / month
            </div>

            {house.deposit > 0 && (
              <p className="house-detail-deposit">
                Deposit: KES {Number(house.deposit).toLocaleString()}
              </p>
            )}

            {house.description && (
              <p className="house-detail-description">{house.description}</p>
            )}

            {landlord && (
              <div className="house-detail-landlord">
                <h3>Landlord</h3>
                <p><strong>{landlord.name}</strong></p>
                {landlord.phone && <p>{landlord.phone}</p>}
              </div>
            )}

            {/* ── Rent Now ── */}
            <div className="house-detail-actions">
              {canRent ? (
                <button
                  type="button"
                  className="rent-now-btn"
                  onClick={handleRent}
                  disabled={rentState.busy}
                >
                  {rentState.busy ? 'Processing...' : 'Rent Now'}
                </button>
              ) : (
                <p className="house-detail-unavailable">This house is not available right now.</p>
              )}
              {rentState.message && (
                <p className="house-detail-rent-message" role="status">{rentState.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Related Houses ── */}
        {relatedHouses.length > 0 && (
          <section className="related-houses">
            <h3>Similar Houses</h3>
            <div className="related-houses-grid">
              {relatedHouses.map((r) => {
                const rid = r.id || r._id;
                return (
                  <Link
                    to={`/houses/${rid}`}
                    key={rid}
                    className="related-house-card"
                  >
                    <div className="related-house-image">
                      {r.images?.length > 0 ? (
                        <img src={r.images[0]} alt={r.houseType} loading="lazy" />
                      ) : (
                        <div className="placeholder-image">No Image</div>
                      )}
                    </div>
                    <h4>{r.houseType}</h4>
                    <p className="related-house-location">📍 {r.location}</p>
                    <p className="related-house-rent">
                      KES {Number(r.rent).toLocaleString()} / month
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default HouseDetail;