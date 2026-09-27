import { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  FiUsers, FiUserPlus, FiPhoneCall, FiCheckCircle, 
  FiRefreshCw, FiMapPin, FiTrendingUp, FiShoppingBag 
} from 'react-icons/fi';
import '../css/Analytics.css';

const COLORS = ['var(--color-danger)', 'var(--color-accent)', 'var(--color-tag)', 'var(--neutral-400)'];

const LeadAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/leads', { credentials: 'include' });
      const result = res.ok ? await res.json() : null;
      setData(result);
    } catch (e) { console.error('Fetch error:', e) } finally { setLoading(false) }
  }, []);

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics]);

  if (loading) return <div className="analytics-loading"><div className="spinner" /><p>Loading...</p></div>;
  if (!data) return <div className="analytics-empty"><p><FiUsers size={24} /> No data available</p></div>;

  const statusData = Object.entries(data.byStatus || {}).map(([name, value]) => ({ name, value }));
  const locationData = Object.entries(data.byLocation || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="analytics-page">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon"><FiUsers size={20} /></span>
          <span className="stat-label">Total Leads</span>
          <span className="stat-value">{data.totalLeads || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiUserPlus size={20} /></span>
          <span className="stat-label">New</span>
          <span className="stat-value">{data.byStatus?.new || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiPhoneCall size={20} /></span>
          <span className="stat-label">Contacted</span>
          <span className="stat-value">{data.byStatus?.contacted || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiCheckCircle size={20} /></span>
          <span className="stat-label">Converted</span>
          <span className="stat-value">{data.byStatus?.converted || 0}</span>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="funnel-card">
        <h3><FiRefreshCw size={16} /> Conversion Funnel</h3>
        <div className="funnel">
          <div className="funnel-step" style={{ width: '100%' }}>
            Total Leads: {data.totalLeads || 0} (100%)
          </div>
          <div className="funnel-step" style={{ width: '70%' }}>
            Contacted: {(data.byStatus?.contacted || 0) + (data.byStatus?.converted || 0)} (70%)
          </div>
          <div className="funnel-step" style={{ width: '40%' }}>
            Converted: {data.byStatus?.converted || 0} ({data.conversionRate || 0}%)
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3><FiMapPin size={16} /> Leads by Location</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={locationData} dataKey="value" nameKey="name" outerRadius={80} label>
                {locationData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3><FiTrendingUp size={16} /> Monthly Lead Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyTrend || []}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="leads" stroke="var(--color-accent)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="inquiry-list">
        <h3><FiShoppingBag size={16} /> Most Inquired Products</h3>
        {Object.entries(data.byProductInterest || {}).map(([product, count]) => (
          <div key={product} className="inquiry-item">
            <span className="inquiry-label">{product}</span>
            <div className="inquiry-bar">
              <div className="inquiry-fill" style={{ width: `${(count / data.totalLeads) * 100}%` }} />
            </div>
            <span className="inquiry-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadAnalytics;