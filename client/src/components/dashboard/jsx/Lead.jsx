import { useReducer, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  FiTrash2, FiCheck, FiPhone, FiMessageSquare, FiEye,
  FiUsers, FiUserPlus, FiPhoneCall, FiCheckCircle,
  FiCircle, FiFolder, FiBarChart2, FiClock, FiMail
} from 'react-icons/fi';
import '../css/Lead.css';

// ── Constants ──
const INITIAL_VISIBLE = 10;
const LOAD_MORE = 10;
const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

const initialState = {
  leads: [], loading: true, visibleCount: INITIAL_VISIBLE,
  confirmDeleteId: null, filter: 'all',
};

// ── Reducer ──
const reducer = (s, a) => ({
  SET_LEADS: { ...s, leads: a.payload, loading: false },
  SET_LOADING: { ...s, loading: a.payload },
  SET_VISIBLE: { ...s, visibleCount: a.payload },
  SET_CONFIRM_DELETE: { ...s, confirmDeleteId: a.payload },
  SET_FILTER: { ...s, filter: a.payload, visibleCount: INITIAL_VISIBLE },
}[a.type] || s);

// ── Stats calculator ──
const calcStats = (leads) => ({
  total: leads.length,
  newLeads: leads.filter(l => l.status === 'new').length,
  contacted: leads.filter(l => l.status === 'contacted').length,
  converted: leads.filter(l => l.status === 'converted').length,
});

// ── Status Icon Helper ──
const getStatusIcon = (status) => {
  switch (status) {
    case 'new':
      return <FiUserPlus size={14} />;
    case 'contacted':
      return <FiPhoneCall size={14} />;
    case 'converted':
      return <FiCheckCircle size={14} />;
    case 'closed':
      return <FiCircle size={14} />;
    default:
      return <FiCircle size={14} />;
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'new':
      return 'New';
    case 'contacted':
      return 'Contacted';
    case 'converted':
      return 'Converted';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
};

// ── Lead Card ──
const LeadCard = ({ lead, confirmDeleteId, onDelete, onStatusChange, onReply }) => (
  <div className={`lead-card status-${lead.status}`}>
    <div className="lead-card-header">
      <span className={`lead-status ${lead.status}`}>
        {getStatusIcon(lead.status)} {getStatusLabel(lead.status)}
      </span>
      <span className="lead-date">
        <FiClock size={14} /> {new Date(lead.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
      </span>
    </div>
    
    <div className="lead-card-content">
      <h4 className="lead-name">{lead.name}</h4>
      {lead.phone && <p className="lead-phone"><FiPhone size={14} /> {lead.phone}</p>}
      {lead.email && <p className="lead-email"><FiMail size={14} /> {lead.email}</p>}
      <p className="lead-message">"{lead.message}"</p>
      {lead.source && <span className="lead-source"><FiFolder size={14} /> {lead.source}</span>}
    </div>
    
    <div className="lead-card-actions">
      <button className="reply-btn" onClick={() => onReply(lead)}>
        <FiMessageSquare size={16} /> Reply
      </button>
      {lead.status !== 'converted' && lead.status !== 'closed' && (
        <select 
          className="status-select"
          value={lead.status}
          onChange={(e) => onStatusChange(lead.id, e.target.value)}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
      <button className="delete-btn" onClick={() => onDelete(lead.id)}>
        <FiTrash2 size={16} /> {confirmDeleteId === lead.id ? 'Confirm?' : 'Delete'}
      </button>
    </div>
  </div>
);

// ── Main ──
const Lead = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const loadMoreRef = useRef(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads?t=' + Date.now(), { credentials: 'include' });
      const data = res.ok ? await res.json() : [];
      dispatch({ type: 'SET_LEADS', payload: Array.isArray(data) ? data : [] });
    } catch (e) { dispatch({ type: 'SET_LOADING', payload: false }) }
  }, []);

  useEffect(() => { fetchLeads() }, [fetchLeads]);

  const filteredLeads = useMemo(() => {
    if (state.filter === 'all') return state.leads;
    return state.leads.filter(l => l.status === state.filter);
  }, [state.leads, state.filter]);

  const visibleLeads = useMemo(
    () => filteredLeads.slice(0, state.visibleCount),
    [filteredLeads, state.visibleCount]
  );
  const hasMore = state.visibleCount < filteredLeads.length;

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      () => dispatch({ type: 'SET_VISIBLE', payload: state.visibleCount + LOAD_MORE }),
      { threshold: 0.1, rootMargin: '50px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, state.visibleCount]);

  const handleDelete = useCallback(async (id) => {
    if (state.confirmDeleteId !== id) { dispatch({ type: 'SET_CONFIRM_DELETE', payload: id }); return }
    dispatch({ type: 'SET_CONFIRM_DELETE', payload: null });
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) await fetchLeads();
    } catch (e) { console.error('Delete error:', e) }
  }, [state.confirmDeleteId, fetchLeads]);

  const handleStatusChange = useCallback(async (id, status) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await fetchLeads();
    } catch (e) { console.error('Status update error:', e) }
  }, [fetchLeads]);

  const handleReply = useCallback((lead) => {
    let phone = lead.phone.replace(/[^0-9]/g, '');
    
    if (phone.startsWith('0')) {
      phone = '254' + phone.substring(1);
    } else if (phone.startsWith('7')) {
      phone = '254' + phone;
    } else if (phone.startsWith('+')) {
      phone = phone.substring(1);
    }
    
    const message = `Hi ${lead.name}, thank you for contacting FurniHaven. We received your inquiry: "${lead.message.substring(0, 100)}..." Please let us know how we can help!`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }, []);

  const stats = useMemo(() => calcStats(state.leads), [state.leads]);

  if (state.loading) return <div className="lead-loading"><div className="spinner" /><p>Loading leads...</p></div>;

  return (
    <div className="lead-manage">
      <div className="lead-stats">
        <span><FiBarChart2 size={16} /> Total: {stats.total}</span>
        <span><FiUserPlus size={16} /> New: {stats.newLeads}</span>
        <span><FiPhoneCall size={16} /> Contacted: {stats.contacted}</span>
        <span><FiCheckCircle size={16} /> Converted: {stats.converted}</span>
      </div>

      <div className="lead-header">
        <div className="filter-tabs">
          {['all', 'new', 'contacted', 'converted', 'closed'].map(f => (
            <button
              key={f}
              className={`filter-tab ${state.filter === f ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_FILTER', payload: f })}
            >
              {f === 'all' ? (
                <><FiUsers size={14} /> All</>
              ) : f === 'new' ? (
                <><FiUserPlus size={14} /> New</>
              ) : f === 'contacted' ? (
                <><FiPhoneCall size={14} /> Contacted</>
              ) : f === 'converted' ? (
                <><FiCheckCircle size={14} /> Converted</>
              ) : (
                <><FiCircle size={14} /> Closed</>
              )}
            </button>
          ))}
        </div>
        <div className="header-actions">
          {hasMore && <button className="load-more-btn" onClick={() => dispatch({ type: 'SET_VISIBLE', payload: state.visibleCount + LOAD_MORE })}>Load More</button>}
        </div>
      </div>

      <div className="lead-grid">
        {visibleLeads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            confirmDeleteId={state.confirmDeleteId}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onReply={handleReply}
          />
        ))}
      </div>

      {!visibleLeads.length && (
        <div className="no-leads">
          <p><FiUsers size={18} /> No leads found. New inquiries will appear here.</p>
        </div>
      )}

      {hasMore && <div ref={loadMoreRef} className="load-more-trigger"><div className="spinner small" /></div>}
    </div>
  );
};

export default Lead;