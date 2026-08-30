import { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiPackage, FiCheckCircle, FiTag, FiBarChart2, FiHome, FiDollarSign } from 'react-icons/fi';
import '../css/Analytics.css';

const COLORS = ['var(--color-accent)', 'var(--color-brand)', 'var(--color-tag)', 'var(--color-danger)', 'var(--color-accent-hover)', 'var(--walnut-400)'];

const ProductAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/products', { credentials: 'include' });
      const result = res.ok ? await res.json() : null;
      setData(result);
    } catch (e) { console.error('Fetch error:', e) } finally { setLoading(false) }
  }, []);

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics]);

  if (loading) return <div className="analytics-loading"><div className="spinner" /><p>Loading...</p></div>;
  if (!data) return <div className="analytics-empty"><p><FiPackage size={24} /> No data available</p></div>;

  const categoryData = Object.entries(data.byCategory || {}).map(([name, value]) => ({ name, value }));
  const roomData = Object.entries(data.byRoom || {}).map(([name, value]) => ({ name, value }));

  // Calculate percentage for pie chart labels
  const totalRooms = roomData.reduce((sum, item) => sum + item.value, 0);
  const renderPieLabel = ({ name, value, percent }) => {
    return `${name} (${(percent * 100).toFixed(0)}%)`;
  };

  return (
    <div className="analytics-page">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon"><FiPackage size={20} /></span>
          <span className="stat-label">Total Products</span>
          <span className="stat-value">{data.totalProducts || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiCheckCircle size={20} /></span>
          <span className="stat-label">Normal</span>
          <span className="stat-value">{data.byStatus?.normal || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiTag size={20} /></span>
          <span className="stat-label">Offers</span>
          <span className="stat-value">{data.byStatus?.offer || 0}</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3><FiBarChart2 size={16} /> Products by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3><FiHome size={16} /> Products by Room</h3>
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
              <Tooltip formatter={(value, name) => [`${value} products (${((value / totalRooms) * 100).toFixed(1)}%)`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="price-distribution">
        <h3><FiDollarSign size={16} /> Price Distribution</h3>
        {Object.entries(data.priceRange || {}).map(([range, count]) => (
          <div key={range} className="price-bar">
            <span className="price-label">{range}</span>
            <div className="price-bar-track">
              <div className="price-bar-fill" style={{ width: `${(count / data.totalProducts) * 100}%` }} />
            </div>
            <span className="price-count">{count} products</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductAnalytics;