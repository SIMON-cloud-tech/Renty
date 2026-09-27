import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiAlertCircle, FiArrowRight, FiInfo, FiTruck } from 'react-icons/fi';
import '../css/AffordabilityTool.css';

const CACHE_KEY = 'renty_units_all';

// Conservative rent-to-income ceiling — 30% of net income.
const RENT_RATIO = 0.3;

// Small safety margin so we don't push people to the edge of the ceiling.
const SAFETY_FACTOR = 0.95;

// Stretch ceiling — up to 35% if the user is willing to push it.
const STRETCH_RATIO = 0.35;

// Rough moving-cost estimate in KES. Covers a small van, fuel, and a
// couple of hours of loading help. Users can adjust in future versions.
const MOVING_COST = 5000;

const formatKES = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

const AffordabilityTool = () => {
  const navigate = useNavigate();
  const [income, setIncome] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Fetch units once, reuse the same cache as Houses.jsx ──
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const list = Array.isArray(parsed?.value ?? parsed) ? (parsed.value ?? parsed) : null;
          if (list) {
            setUnits(list);
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

  const maxRent = useMemo(
    () => Math.floor(totalIncome * RENT_RATIO * SAFETY_FACTOR),
    [totalIncome]
  );
  const stretchCeiling = Math.floor(totalIncome * STRETCH_RATIO);

  // ── Affordable units ──
  const affordable = useMemo(() => {
    if (!incomeNum || !units.length) return [];
    return units
      .filter((u) => Number(u.rent) > 0 && Number(u.rent) <= maxRent)
      .sort((a, b) => Number(a.rent) - Number(b.rent));
  }, [units, maxRent, incomeNum]);

  // ── Stretch units ──
  const stretchable = useMemo(() => {
    if (!incomeNum || !units.length) return [];
    return units
      .filter((u) => Number(u.rent) > maxRent && Number(u.rent) <= stretchCeiling)
      .sort((a, b) => Number(a.rent) - Number(b.rent));
  }, [units, maxRent, stretchCeiling, incomeNum]);

  // ── Cheapest affordable unit — for the "cash to move in" summary ──
  const cheapestAffordable = affordable[0] || null;
  const cheapestMoveInCost = cheapestAffordable
    ? Number(cheapestAffordable.rent) + Number(cheapestAffordable.deposit || 0) + MOVING_COST
    : 0;

  const handleCalculate = useCallback((e) => e.preventDefault(), []);

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
            comfortably in your budget — including what you'll need to move in.
            No signup required.
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

          {/* ── Day-one cash requirement ── */}
          {showResults && cheapestAffordable && (
            <div className="afford-dayone">
              <div className="afford-dayone-head">
                <FiTruck size={18} />
                <span>What you'll need on day one</span>
              </div>
              <p className="afford-dayone-detail">
                For the cheapest home in your range —{' '}
                <strong>{cheapestAffordable.houseType}</strong> in{' '}
                {cheapestAffordable.location} — you'll need roughly:
              </p>
              <ul className="afford-dayone-list">
                <li>
                  <span>First month's rent</span>
                  <span>{formatKES(cheapestAffordable.rent)}</span>
                </li>
                <li>
                  <span>Deposit</span>
                  <span>{formatKES(cheapestAffordable.deposit || 0)}</span>
                </li>
                <li>
                  <span>Moving cost (est.)</span>
                  <span>{formatKES(MOVING_COST)}</span>
                </li>
                <li className="total">
                  <span>Total to move in</span>
                  <span>{formatKES(cheapestMoveInCost)}</span>
                </li>
              </ul>
              <p className="afford-dayone-note">
                The moving cost is an estimate — it varies with distance and how
                much you own.
              </p>
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
                homes you can afford — including what you'll need to move in.
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
  const moveInCost = rent + deposit + MOVING_COST;

  return (
    <div className={`afford-card ${stretched ? 'stretched' : ''}`}>
      <div className="afford-card-top">
        <h4 className="afford-card-title">{unit.houseType}</h4>
        <span className="afford-card-rent">
          {formatKES(rent)}
          <em>/mo</em>
        </span>
      </div>
      <p className="afford-card-location">📍 {unit.location}</p>

      <div className="afford-card-stats">
        <div className="afford-stat">
          <span className="afford-stat-label">Share of income</span>
          <span className="afford-stat-value">{pctOfIncome}%</span>
        </div>
        <div className="afford-stat">
          <span className="afford-stat-label">To move in</span>
          <span className="afford-stat-value">{formatKES(moveInCost)}</span>
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