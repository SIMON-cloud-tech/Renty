import { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiBookOpen, FiList, FiImage, FiFolder, FiClock } from 'react-icons/fi';
import '../css/Analytics.css';

const COLORS = [
  'var(--walnut-500)',   // #3B2A20 - Darkest walnut
  'var(--walnut-400)',   // Lighter walnut
  'var(--walnut-300)',   // Even lighter
  'var(--brass-500)',    // #A97C50 - Brass
  'var(--brass-400)',    // Lighter brass
  'var(--brass-300)',    // Even lighter
  'var(--sage-500)',     // #6B7860 - Sage
  'var(--danger-500)',   // #A6402D - Brick red
];

const GuideAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/guides', { credentials: 'include' });
      const result = res.ok ? await res.json() : null;
      setData(result);
    } catch (e) { console.error('Fetch error:', e) } finally { setLoading(false) }
  }, []);

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics]);

  if (loading) return <div className="analytics-loading"><div className="spinner" /><p>Loading...</p></div>;
  if (!data) return <div className="analytics-empty"><p><FiBookOpen size={24} /> No data available</p></div>;

  const roomData = Object.entries(data.byRoom || {}).map(([name, value]) => ({ name, value }));
  const totalGuides = roomData.reduce((sum, item) => sum + item.value, 0);

  // Custom label showing name + percentage
  const renderPieLabel = ({ name, value, percent }) => {
    return `${name} (${(percent * 100).toFixed(0)}%)`;
  };

  return (
    <div className="analytics-page">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon"><FiBookOpen size={20} /></span>
          <span className="stat-label">Total Guides</span>
          <span className="stat-value">{data.totalGuides || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiList size={20} /></span>
          <span className="stat-label">With Features</span>
          <span className="stat-value">{data.withFeatures || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiImage size={20} /></span>
          <span className="stat-label">With Images</span>
          <span className="stat-value">{data.withImages || 0}</span>
        </div>
      </div>

      <div className="chart-card">
        <h3><FiFolder size={16} /> Guides by Room</h3>
        {totalGuides > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={roomData} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={80} 
                label={renderPieLabel}
                labelLine={true}
              >
                {roomData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} guides (${((value / totalGuides) * 100).toFixed(1)}%)`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="analytics-empty">No room data available. Add room to your guides.</p>
        )}
      </div>

      <div className="recent-list">
        <h3><FiClock size={16} /> Recent Guides</h3>
        {(data.recentGuides || []).map((guide, idx) => (
          <div key={idx} className="recent-item">
            <span className="recent-title">{guide.title}</span>
            <span className="recent-date">{guide.createdAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuideAnalytics;