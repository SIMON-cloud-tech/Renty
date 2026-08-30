import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  FiDollarSign, FiPackage, FiUsers, FiEdit, FiMessageCircle, 
  FiTrendingUp, FiClock, FiActivity 
} from 'react-icons/fi';
import '../css/Analytics.css';

const AnalyticsOverview = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/overview', { credentials: 'include' });
      const data = res.ok ? await res.json() : null;
      setOverview(data);
    } catch (e) { console.error('Fetch error:', e) } finally { setLoading(false) }
  }, []);

  useEffect(() => { fetchOverview() }, [fetchOverview]);

  if (loading) return <div className="analytics-loading"><div className="spinner" /><p>Loading analytics...</p></div>;
  if (!overview) return <div className="analytics-empty"><p><FiActivity size={24} /> No data available</p></div>;

  return (
    <div className="analytics-page">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon"><FiDollarSign size={24} /></span>
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">KSh {overview.summary?.totalRevenue?.toLocaleString() || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiPackage size={24} /></span>
          <span className="stat-label">Products</span>
          <span className="stat-value">{overview.summary?.totalProducts || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiUsers size={24} /></span>
          <span className="stat-label">Leads</span>
          <span className="stat-value">{overview.summary?.totalLeads || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiEdit size={24} /></span>
          <span className="stat-label">Blogs</span>
          <span className="stat-value">{overview.summary?.totalBlogs || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiMessageCircle size={24} /></span>
          <span className="stat-label">Bot Conversations</span>
          <span className="stat-value">{overview.summary?.totalBotConversations || 0}</span>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="chart-card">
        <h3><FiTrendingUp size={18} /> Monthly Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={overview.monthlyTrend || []}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="leads" stroke="var(--color-accent)" strokeWidth={2} />
            <Line type="monotone" dataKey="conversions" stroke="var(--color-tag)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="activity-card">
        <h3><FiClock size={18} /> Recent Activity</h3>
        <ul className="activity-list">
          {(overview.recentActivity || []).map((activity, idx) => (
            <li key={idx} className="activity-item">
              <span className="activity-type">{activity.type}</span>
              <span className="activity-message">{activity.message}</span>
              <span className="activity-time">{activity.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsOverview;