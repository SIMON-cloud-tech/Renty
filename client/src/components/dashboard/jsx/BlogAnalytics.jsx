import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FiEdit, FiEye, FiClock, FiTrendingUp, FiFolder } from 'react-icons/fi';
import '../css/Analytics.css';

const BlogAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/blogs', { credentials: 'include' });
      const result = res.ok ? await res.json() : null;
      setData(result);
    } catch (e) { console.error('Fetch error:', e) } finally { setLoading(false) }
  }, []);

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics]);

  if (loading) return <div className="analytics-loading"><div className="spinner" /><p>Loading...</p></div>;
  if (!data) return <div className="analytics-empty"><p><FiEdit size={24} /> No data available</p></div>;

  const viewsData = (data.mostViewed || []).map(post => ({ name: post.title, views: post.views }));

  return (
    <div className="analytics-page">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon"><FiEdit size={20} /></span>
          <span className="stat-label">Total Posts</span>
          <span className="stat-value">{data.totalBlogs || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiEye size={20} /></span>
          <span className="stat-label">Total Views</span>
          <span className="stat-value">{data.totalViews || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiClock size={20} /></span>
          <span className="stat-label">Avg Read Time</span>
          <span className="stat-value">{data.averageReadTime || '0 min'}</span>
        </div>
      </div>

      <div className="chart-card">
        <h3><FiTrendingUp size={16} /> Most Viewed Posts</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={viewsData} layout="vertical">
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={150} />
            <Tooltip />
            <Bar dataKey="views" fill="var(--color-accent)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="category-list">
        <h3><FiFolder size={16} /> Posts by Category</h3>
        {Object.entries(data.byCategory || {}).map(([category, count]) => (
          <div key={category} className="category-item">
            <span className="category-label">{category}</span>
            <span className="category-count">{count} posts</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogAnalytics;