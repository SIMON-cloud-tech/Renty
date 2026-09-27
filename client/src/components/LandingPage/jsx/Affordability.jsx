import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiAlertCircle, FiArrowRight, FiInfo } from 'react-icons/fi';
import '../css/Affordability.css';

const CACHE_KEY = 'renty_units_all';

// Conservative rent-to-income ceiling. Landlords and financial advisors
// usually place this at 30% of net monthly income.
const RENT_RATIO = 0.3;

// Small safety margin — we don't want to show units that push someone
// right up against the ceiling and leave no room for deposits or emergencies.
const SAFETY_FACTOR = 0.95;

const formatKES = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

const AffordabilityTool = () => {
  const navigate = useNavigate();
  const [income, setIncome] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Fetch units once, reuse the same cache key as Houses.jsx ──
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed?.value ?? parsed)) {
            setUnits(parsed.value ?? parsed);
            setLoading(false);
            return;
          }
        }

        const res = await fetch('/api/house/units/all');
        if (!res.ok) throw new Error('Could not load listings');
        const data = await res.json();
        setUnits(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('We could not load available homes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, []);

  // ── Numbers ──
  const incomeNum = Number(String(income).replace(/[^\d]/g, '')) || 0;
  const otherNum = Number(String(otherIncome).replace(/[^\d]/g, '')) || 0;
  const totalIncome = incomeNum + otherNum;

  // The monthly rent someone can comfortably pay.
  const maxRent = useMemo(
    () => Math.floor(totalIncome * RENT_RATIO * SAFETY_FACTOR),
    [totalIncome]
  );

  // Units they can afford, sorted cheapest-first.
  const affordable = useMemo(() => {
    if (!incomeNum || !units.length) return [];
    return units
      .filter((u) => Number(u.rent) > 0 && Number(u.rent) <= maxRent)
      .sort((a, b) => Number(a.rent) - Number(b.rent));
  }, [units, maxRent, incomeNum]);

  // Their "stretch" range — units slightly above comfort, up to 35%.
  const stretchCeiling = Math.floor(totalIncome * 0.35);
  const stretchable = useMemo(() => {
    if (!incomeNum || !units.length) return [];
    return units
      .filter((u) => Number(u.rent) > maxRent && Number(u.rent) <= stretchCeiling)
      .sort((a, b) => Number(a.rent) - Number(b.rent));
  }, [units, maxRent, stretchCeiling, incomeNum]);

  const handleCalculate = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleViewHouse = useCallback(
    (id) => navigate(`/houses/${id}`),
    [navigate]
  );

  const showResults = incomeNum > 0;

  return (
    <section className="afford" aria-labelledby="afford-title">
      <div className="afford-inner">
        {/* ── Left: input ── */}
        <div className="afford-left">
          <span className="afford-tag">Know your number</span>
          <h2 id="afford-title" className="afford-title">
            What can you comfortably afford?
          </h2>
          <p className="afford-lead">
            Enter your monthly income and we'll show you the homes that fit
            comfortably in your budget — with room left for food, transport,
            and emergencies. No signup required.
          </p>

          <form className="afford-form" onSubmit={handleCalculate}>
            <label className="afford-field">
              <span>Monthly net salary (KES)</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 60000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                autoComplete="off"
              />
            </label>

            <label className="afford-field">
              <span>Other monthly income (optional)</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. side hustle, family support"
                value={otherIncome}
                onChange={(e) => setOtherIncome(e.target.value)}
                autoComplete="off"
              />
            </label>
          </form>

          {showResults && (
            <div className="afford-summary">
              <FiTrendingUp size={18} />
              <div>
                <p className="afford-summary-line">
                  Based on {formatKES(totalIncome)} a month, we recommend rent
                  of <strong>{formatKES(maxRent)}</strong> or less.
                </p>
                <p className="afford-summary-sub">
                  That leaves about {formatKES(Math.floor(totalIncome * 0.7))} for
                  everything else — food, transport, savings.
                </p>
              </div>
            </div>
          )}

          <p className="afford-note">
            <FiInfo size={14} /> This is a guide, not financial advice. If your
            situation is different — for example, you split rent with a partner
            or expect a raise soon — you can stretch a little higher.
          </p>
        </div>

        {/* ── Right: results ── */}
        <div className="afford-right">
          {loading && (
            <div className="afford-state">
              <div className="spinner" />
              <p>Loading available homes…</p>
            </div>
          )}

          {!loading && error && (
            <div className="afford-state error">
              <FiAlertCircle size={22} />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && !showResults && (
            <div className="afford-state">
              <h3>Your results will appear here</h3>
              <p>
                Enter your monthly income on the left and we'll match you with
                homes you can afford — and explain why.
              </p>
            </div>
          )}

          {!loading && !error && showResults && (
            <>
              {affordable.length > 0 ? (
                <>
                  <h3 className="afford-results-title">
                    {affordable.length} home{affordable.length > 1 ? 's' : ''} in
                    your comfortable range
                  </h3>
                  <div className="afford-list">
                    {affordable.map((u) => (
                      <AffordCard
                        key={u.id || u._id}
                        unit={u}
                        maxRent={maxRent}
                        totalIncome={totalIncome}
                        onView={handleViewHouse}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="afford-state">
                  <h3>No homes match that budget yet</h3>
                  <p>
                    The lowest rent currently listed is{' '}
                    {units.length
                      ? formatKES(Math.min(...units.map((u) => Number(u.rent) || Infinity)))
                      : '—'}
                    . Try a higher income or check back soon — new listings are
                    added weekly.
                  </p>
                </div>
              )}

              {stretchable.length > 0 && (
                <div className="afford-stretch">
                  <h4 className="afford-stretch-title">
                    If you're willing to stretch a little
                  </h4>
                  <p className="afford-stretch-sub">
                    These are slightly above your comfortable range but still
                    within reach. Only consider them if your income is stable
                    or you share costs.
                  </p>
                  <div className="afford-list stretch">
                    {stretchable.map((u) => (
                      <AffordCard
                        key={u.id || u._id}
                        unit={u}
                        maxRent={maxRent}
                        totalIncome={totalIncome}
                        onView={handleViewHouse}
                        stretched
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

// ── Card ──
const AffordCard = ({ unit, maxRent, totalIncome, onView, stretched = false }) => {
  const id = unit.id || unit._id;
  const rent = Number(unit.rent) || 0;
  const deposit = Number(unit.deposit) || 0;
  const pctOfIncome = totalIncome > 0 ? Math.round((rent / totalIncome) * 100) : 0;
  const totalMove = rent + deposit;

  return (
    <div className={`afford-card ${stretched ? 'stretched' : ''}`}>
      <div className="afford-card-top">
        <h4 className="afford-card-title">{unit.houseType}</h4>
        <span className="afford-card-rent">{formatKES(rent)}<em>/mo</em></span>
      </div>
      <p className="afford-card-location">📍 {unit.location}</p>

      <div className="afford-card-stats">
        <div className="afford-stat">
          <span className="afford-stat-label">Share of income</span>
          <span className="afford-stat-value">{pctOfIncome}%</span>
        </div>
        <div className="afford-stat">
          <span className="afford-stat-label">To move in</span>
          <span className="afford-stat-value">{formatKES(totalMove)}</span>
        </div>
      </div>

      <p className="afford-card-reason">
        {stretched
          ? `Slightly above the recommended ${formatKES(maxRent)}/month, but still within reach.`
          : `Fits comfortably within your budget of ${formatKES(maxRent)}/month.`}
      </p>

      <button className="afford-card-btn" onClick={() => onView(id)}>
        View this house <FiArrowRight size={14} />
      </button>
    </div>
  );
};

export default AffordabilityTool;