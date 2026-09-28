import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiX, FiAlertCircle } from 'react-icons/fi';
import SEO from '../../SEO/Seo';
import { cacheUtil } from '../../../utils/cacheUtils';
import '../css/ComparePage.css';

const MAX_COMPARE = 3;

const formatKES = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

const ComparePage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [allHouses, setAllHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const idsParam = params.get('ids') || '';
  const ids = useMemo(
    () => idsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, MAX_COMPARE),
    [idsParam]
  );

  // ── Fetch (reuse the same cache as Houses.jsx) ──
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const cached = cacheUtil.get('renty_units_all');
        if (cached) {
          setAllHouses(cached);
          setLoading(false);
          return;
        }
        const res = await fetch('/api/house/units/all');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        cacheUtil.set('renty_units_all', list);
        setAllHouses(list);
      } catch (err) {
        console.error('Compare fetch error:', err);
        setError('We could not load the houses for comparison. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, []);

  // ── Pick units in the order the ids were given ──
  const compared = useMemo(() => {
    if (!allHouses.length || !ids.length) return [];
    const byId = new Map();
    allHouses.forEach((u) => {
      const id = u.id || u._id;
      if (id) byId.set(String(id), u);
    });
    return ids.map((id) => byId.get(String(id))).filter(Boolean);
  }, [allHouses, ids]);

  const removeFromCompare = useCallback(
    (id) => {
      const remaining = compared
        .map((u) => String(u.id || u._id))
        .filter((x) => x !== String(id));
      if (remaining.length < 2) {
        navigate('/houses');
        return;
      }
      navigate(`/compare?ids=${remaining.join(',')}`, { replace: true });
    },
    [compared, navigate]
  );

  const goBack = useCallback(() => navigate('/houses'), [navigate]);

  // ── Loading / error / empty states ──
  if (loading) {
    return (
      <div className="compare-page compare-state-wrap">
        <div className="spinner" />
        <p>Loading comparison…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compare-page compare-state-wrap">
        <FiAlertCircle size={28} />
        <p>{error}</p>
        <button className="compare-back" onClick={goBack}>
          <FiArrowLeft /> Back to houses
        </button>
      </div>
    );
  }

  if (compared.length < 2) {
    return (
      <div className="compare-page compare-state-wrap">
        <h2>Not enough houses to compare</h2>
        <p>
          You need to select at least two houses from the listings to see them
          side by side.
        </p>
        <button className="compare-back" onClick={goBack}>
          <FiArrowLeft /> Back to houses
        </button>
      </div>
    );
  }

  // ── Rows of the comparison ──
  const rows = [
    {
      label: 'Rent / month',
      render: (u) => <strong className="cmp-price">{formatKES(u.rent)}</strong>,
    },
    {
      label: 'Deposit',
      render: (u) => formatKES(u.deposit),
    },
    {
      label: 'To move in',
      render: (u) =>
        formatKES((Number(u.rent) || 0) + (Number(u.deposit) || 0) + 5000),
    },
    {
      label: 'House type',
      render: (u) => <span className="cmp-cap">{u.houseType}</span>,
    },
    {
      label: 'Location',
      render: (u) => u.location || '—',
    },
    {
      label: 'Status',
      render: (u) => (
        <span className={`cmp-status ${u.status || 'vacant'}`}>
          {u.status || 'vacant'}
        </span>
      ),
    },
    {
      label: 'Pinned on map',
      render: (u) =>
        u.latitude != null && u.longitude != null ? 'Yes' : 'No',
    },
    {
      label: 'Description',
      render: (u) => (
        <span className="cmp-desc">{u.description || '—'}</span>
      ),
    },
  ];

  return (
    <>
      <SEO
        title="Compare houses side by side | RentY"
        description="Compare rent, deposit, move-in cost and location for up to 3 houses side by side."
      />

      <div className="compare-page">
        <button className="compare-back" onClick={goBack}>
          <FiArrowLeft /> Back to houses
        </button>

        <header className="compare-header">
          <h1>Compare houses</h1>
          <p>
            See how these {compared.length} houses stack up against each other.
            Rent, deposit, move-in cost, and location — side by side.
          </p>
        </header>

        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th scope="col" className="cmp-feature-col">
                  <span className="sr-only">Feature</span>
                </th>
                {compared.map((u) => {
                  const id = u.id || u._id;
                  return (
                    <th scope="col" key={id} className="cmp-unit-col">
                      <div className="cmp-unit-head">
                        <button
                          type="button"
                          className="cmp-remove"
                          onClick={() => removeFromCompare(id)}
                          aria-label="Remove from comparison"
                          title="Remove from comparison"
                        >
                          <FiX size={14} />
                        </button>

                        <div className="cmp-unit-image">
                          {u.images?.length > 0 ? (
                            <img src={u.images[0]} alt={u.houseType} />
                          ) : (
                            <div className="placeholder-image">No Image</div>
                          )}
                        </div>

                        <Link to={`/houses/${id}`} className="cmp-unit-title">
                          {u.houseType}
                        </Link>
                        <p className="cmp-unit-location">📍 {u.location}</p>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="cmp-feature-label">
                    {row.label}
                  </th>
                  {compared.map((u) => (
                    <td key={(u.id || u._id) + row.label}>
                      {row.render(u)}
                    </td>
                  ))}
                </tr>
              ))}

              <tr className="cmp-cta-row">
                <th scope="row" className="cmp-feature-label">
                  <span className="sr-only">Action</span>
                </th>
                {compared.map((u) => {
                  const id = u.id || u._id;
                  return (
                    <td key={id + '-cta'}>
                      <button
                        className="cmp-rent-btn"
                        onClick={() => navigate(`/houses/${id}`)}
                      >
                        Rent this <FiArrowRight size={13} />
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ComparePage;