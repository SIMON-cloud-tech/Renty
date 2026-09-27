import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import SEO from '../../SEO/Seo';
import '../css/GuideDetail.css';

const GuideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [guide, setGuide] = useState(null);
  const [allGuides, setAllGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ── Fetch guide and all guides ──
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [guideRes, allRes] = await Promise.all([
          fetch(`/api/guides/${id}`, { signal: controller.signal }),
          fetch('/api/guides', { signal: controller.signal }),
        ]);

        if (!guideRes.ok) throw new Error('Guide not found');
        if (!allRes.ok) throw new Error('Failed to fetch guides');

        const guideData = await guideRes.json();
        const allData = await allRes.json();

        // Guard 1: guide can be a valid object or null
        setGuide(guideData && typeof guideData === 'object' ? guideData : null);

        // Guard 2: allGuides must be an array
        setAllGuides(Array.isArray(allData) ? allData : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch error:', err);
          setError(true);
          setGuide(null);
          setAllGuides([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [id]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // ── Related guides — safe against missing ids ──
  const relatedGuides = useMemo(() => {
    if (!guide || allGuides.length === 0) return [];
    const currentId = guide.id ?? guide._id;
    return allGuides
      .filter((g) => (g?.id ?? g?._id) !== currentId)
      .slice(0, 3);
  }, [guide, allGuides]);

  // ── Parse features ──
  const features = useMemo(() => {
    if (!guide) return [];
    if (Array.isArray(guide.features)) return guide.features.filter(Boolean);
    if (typeof guide.features === 'string') {
      return guide.features.split(',').map((f) => f.trim()).filter(Boolean);
    }
    return [];
  }, [guide]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="guide-detail-loading">
        <div className="spinner"></div>
        <p>Loading guide...</p>
      </div>
    );
  }

  // ── Error ──
  if (error || !guide) {
    return (
      <div className="guide-detail-notfound">
        <h2>Guide Not Found</h2>
        <p>Sorry, the guide you are looking for does not exist or has been removed.</p>
        <button className="back-btn" onClick={handleGoBack}>
          ← Back to Guides
        </button>
      </div>
    );
  }

  // ── Safe date format ──
  const publishedDate = guide.createdAt
    ? new Date(guide.createdAt).toLocaleDateString('en-KE', { dateStyle: 'long' })
    : '—';

  return (
    <>
      <SEO
        title={guide.title ?? 'Guide'}
        description={guide.description ?? 'A renting guide from Renty — practical tips and advice.'}
        ogImage={guide.image ?? ''}
        keywords="renting guide, house hunting tips, tenant advice, Nairobi rentals"
      />

      <div className="guide-detail">
        <button className="back-btn" onClick={handleGoBack}>
          <FaArrowLeft /> Back to Guides
        </button>

        {/* ── Main Guide ── */}
        <div className="guide-detail-main">
          <div className="guide-detail-image">
            {guide.image ? (
              <img src={guide.image} alt={guide.title ?? 'Guide'} loading="lazy" />
            ) : (
              <div className="placeholder-image">No Image</div>
            )}
          </div>

          <div className="guide-detail-info">
            <h1>{guide.title ?? 'Untitled'}</h1>

            <p className="guide-detail-description">{guide.description ?? ''}</p>

            {features.length > 0 && (
              <div className="guide-detail-features">
                <h3>Key Points</h3>
                <ul>
                  {features.map((feature, index) => (
                    <li key={`${feature}-${index}`}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="guide-detail-meta">
              <span className="guide-date">Published: {publishedDate}</span>
              {guide.category && (
                <span className="guide-category">📂 {guide.category}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Related Guides ── */}
        {relatedGuides.length > 0 && (
          <section className="related-guides">
            <h3>More Guides</h3>
            <div className="related-guides-grid">
              {relatedGuides.map((related) => {
                const rid = related.id ?? related._id;
                return (
                  <Link
                    to={`/guides/${rid}`}
                    key={rid}
                    className="related-guide-card"
                  >
                    <div className="related-guide-image">
                      {related.image ? (
                        <img
                          src={related.image}
                          alt={related.title ?? 'Guide'}
                          loading="lazy"
                        />
                      ) : (
                        <div className="placeholder-image">No Image</div>
                      )}
                    </div>
                    <h4>{related.title ?? 'Untitled'}</h4>
                    <p>
                      {typeof related.description === 'string' && related.description.length > 0
                        ? `${related.description.substring(0, 80)}...`
                        : ''}
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

export default GuideDetail;