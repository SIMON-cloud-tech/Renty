import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  FiMessageCircle, FiCheckCircle, FiHelpCircle, 
  FiBarChart2, FiFolder, FiClock 
} from 'react-icons/fi';
import '../css/Analytics.css';

const COLORS = ['var(--color-accent)', 'var(--color-brand)', 'var(--color-tag)', 'var(--color-danger)', 'var(--color-accent-hover)', 'var(--walnut-400)'];

const BotAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/bot', { credentials: 'include' });
      const result = res.ok ? await res.json() : null;
      setData(result);
    } catch (e) { console.error('Fetch error:', e) } finally { setLoading(false) }
  }, []);

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics]);

  if (loading) return <div className="analytics-loading"><div className="spinner" /><p>Loading...</p></div>;
  if (!data) return <div className="analytics-empty"><p><FiMessageCircle size={24} /> No data available</p></div>;

  const questionData = (data.mostAskedQuestions || []).map(q => ({ name: q.question, value: q.frequency }));
  const categoryData = Object.entries(data.byCategory || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="analytics-page">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon"><FiMessageCircle size={20} /></span>
          <span className="stat-label">Total Conversations</span>
          <span className="stat-value">{data.totalConversations || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiCheckCircle size={20} /></span>
          <span className="stat-label">Answered</span>
          <span className="stat-value">{data.answered || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiHelpCircle size={20} /></span>
          <span className="stat-label">Unanswered</span>
          <span className="stat-value">{data.unanswered || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><FiBarChart2 size={20} /></span>
          <span className="stat-label">Answer Rate</span>
          <span className="stat-value">{data.answerRate || 0}%</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3><FiHelpCircle size={16} /> Most Asked Questions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={questionData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3><FiFolder size={16} /> Questions by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={80}>
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="peak-hours">
        <h3><FiClock size={16} /> Peak Hours</h3>
        {Object.entries(data.peakHours || {}).map(([time, count]) => (
          <div key={time} className="peak-item">
            <span className="peak-label">{time}</span>
            <div className="peak-bar">
              <div className="peak-fill" style={{ width: `${(count / data.totalConversations) * 100}%` }} />
            </div>
            <span className="peak-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BotAnalytics;