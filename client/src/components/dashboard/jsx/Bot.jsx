import { useReducer, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  FiPlus, FiEdit, FiTrash2, FiX, FiCheck, 
  FiMessageCircle, FiHelpCircle, FiCheckCircle,
  FiFolder, FiRepeat, FiLayers, FiSend, FiClock
} from 'react-icons/fi';
import '../css/Bot.css';

// ── Constants ──
const INITIAL_VISIBLE = 5;
const LOAD_MORE = 5;
const CATEGORY_OPTIONS = [
  'general', 'products', 'pricing', 'delivery', 'support',
  'materials', 'customization', 'appointments', 'payment',
  'locations', 'contact', 'returns', 'sustainability', 'trust', 'persona'
];

const initialState = {
  entries: [], loading: true, showForm: false, editingId: null,
  answeringId: null, visibleCount: INITIAL_VISIBLE, confirmDeleteId: null,
  filter: 'all',
  formData: { keywords: '', reply: '', category: 'general', question: '' },
};

// ── Reducer ──
const reducer = (s, a) => ({
  SET_ENTRIES: { ...s, entries: a.payload, loading: false },
  SET_LOADING: { ...s, loading: a.payload },
  TOGGLE_FORM: { ...s, showForm: !s.showForm, answeringId: null },
  SET_EDITING: { ...s, editingId: a.payload, answeringId: null, showForm: !!a.payload },
  SET_ANSWERING: { ...s, answeringId: a.payload, editingId: null, showForm: !!a.payload },
  SET_VISIBLE: { ...s, visibleCount: a.payload },
  SET_CONFIRM_DELETE: { ...s, confirmDeleteId: a.payload },
  SET_FILTER: { ...s, filter: a.payload, visibleCount: INITIAL_VISIBLE },
  RESET_FORM: { ...s, editingId: null, answeringId: null, showForm: false, formData: initialState.formData },
  UPDATE_FORM: { ...s, formData: { ...s.formData, ...a.payload } },
  SET_FORM_WITH_DATA: { ...s, formData: { ...a.payload }, showForm: true },
}[a.type] || s);

// ── Bot Card ──
const BotCard = ({ entry, confirmDeleteId, onEdit, onDelete, onAnswer }) => {
  const isPending = entry.status === 'pending' && !entry.isAnswered;
  
  return (
    <div className={`bot-card ${isPending ? 'pending' : 'active'}`}>
      <div className="bot-card-header">
        <span className={`bot-status ${entry.status}`}>
          {isPending ? (
            <><FiHelpCircle size={14} /> Unanswered</>
          ) : (
            <><FiCheckCircle size={14} /> Answered</>
          )}
        </span>
        {entry.category && (
          <span className="bot-category">
            <FiFolder size={14} /> {entry.category}
          </span>
        )}
        {entry.frequency > 1 && (
          <span className="bot-frequency">
            <FiRepeat size={14} /> {entry.frequency}x
          </span>
        )}
      </div>
      
      <div className="bot-card-content">
        {isPending ? (
          <p className="bot-question">"{entry.question}"</p>
        ) : (
          <>
            <p className="bot-reply">{entry.reply}</p>
            {entry.keywords && entry.keywords.length > 0 && (
              <div className="bot-keywords">
                {entry.keywords.slice(0, 5).map((kw, idx) => (
                  <span key={idx} className="keyword-tag">{kw}</span>
                ))}
                {entry.keywords.length > 5 && <span className="keyword-more">+{entry.keywords.length - 5}</span>}
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="bot-card-actions">
        {isPending ? (
          <button className="answer-btn" onClick={() => onAnswer(entry)}>
            <FiCheck size={16} /> Answer
          </button>
        ) : (
          <button className="edit-btn" onClick={() => onEdit(entry)}>
            <FiEdit size={16} /> Edit
          </button>
        )}
        <button className="delete-btn" onClick={() => onDelete(entry.id)}>
          <FiTrash2 size={16} /> {confirmDeleteId === entry.id ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

// ── Main ──
const Bot = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const loadMoreRef = useRef(null);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/bot?t=' + Date.now(), { credentials: 'include' });
      const data = res.ok ? await res.json() : [];
      dispatch({ type: 'SET_ENTRIES', payload: Array.isArray(data) ? data : [] });
    } catch (e) { dispatch({ type: 'SET_LOADING', payload: false }) }
  }, []);

  useEffect(() => { fetchEntries() }, [fetchEntries]);

  const filteredEntries = useMemo(() => {
    if (state.filter === 'all') return state.entries;
    if (state.filter === 'pending') return state.entries.filter(e => e.status === 'pending' && !e.isAnswered);
    if (state.filter === 'answered') return state.entries.filter(e => e.isAnswered);
    return state.entries;
  }, [state.entries, state.filter]);

  const visibleEntries = useMemo(
    () => filteredEntries.slice(0, state.visibleCount),
    [filteredEntries, state.visibleCount]
  );
  const hasMore = state.visibleCount < filteredEntries.length;

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      () => dispatch({ type: 'SET_VISIBLE', payload: state.visibleCount + LOAD_MORE }),
      { threshold: 0.1, rootMargin: '50px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, state.visibleCount]);

  const handleChange = useCallback(e => dispatch({ type: 'UPDATE_FORM', payload: { [e.target.name]: e.target.value } }), []);
  const resetForm = useCallback(() => dispatch({ type: 'RESET_FORM' }), []);
  const handleCancel = useCallback(() => { dispatch({ type: 'RESET_FORM' }) }, []);
  const handleLoadMore = useCallback(() => dispatch({ type: 'SET_VISIBLE', payload: state.visibleCount + LOAD_MORE }), [state.visibleCount]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { formData, editingId, answeringId } = state;
    try {
      const payload = {
        reply: formData.reply,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
        category: formData.category,
        isAnswered: true,
        status: 'answered',
      };

      const url = editingId ? `/api/bot/${editingId}` : answeringId ? `/api/bot/${answeringId}/answer` : '/api/bot';
      const method = editingId || answeringId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) { await fetchEntries(); resetForm() }
    } catch (e) { console.error('Save error:', e) }
  }, [state, fetchEntries, resetForm]);

  const handleDelete = useCallback(async (id) => {
    if (state.confirmDeleteId !== id) { dispatch({ type: 'SET_CONFIRM_DELETE', payload: id }); return }
    dispatch({ type: 'SET_CONFIRM_DELETE', payload: null });
    try {
      const res = await fetch(`/api/bot/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) await fetchEntries();
    } catch (e) { console.error('Delete error:', e) }
  }, [state.confirmDeleteId, fetchEntries]);

  const handleEdit = useCallback((entry) => {
    const { id, keywords, reply, category } = entry;
    dispatch({
      type: 'SET_FORM_WITH_DATA',
      payload: { keywords: keywords ? keywords.join(', ') : '', reply, category: category || 'general', question: '' },
    });
    dispatch({ type: 'SET_EDITING', payload: id });
  }, []);

  const handleAnswer = useCallback((entry) => {
    const { id, question } = entry;
    dispatch({
      type: 'SET_FORM_WITH_DATA',
      payload: { keywords: '', reply: '', category: 'general', question },
    });
    dispatch({ type: 'SET_ANSWERING', payload: id });
  }, []);

  if (state.loading) return <div className="bot-loading"><div className="spinner" /><p>Loading bot knowledge...</p></div>;

  const renderField = ({ label, name, type = 'text', options = [] }) => (
    <div className="form-group" key={name}>
      <label>{label}</label>
      {type === 'textarea' ? (
        <textarea name={name} value={state.formData[name] || ''} onChange={handleChange} rows="4" required />
      ) : type === 'select' ? (
        <select name={name} value={state.formData[name] || ''} onChange={handleChange}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={state.formData[name] || ''} onChange={handleChange} required />
      )}
    </div>
  );

  const formFields = [
    { label: 'Reply (Bot\'s Answer)', name: 'reply', type: 'textarea' },
    { label: 'Keywords (comma separated)', name: 'keywords' },
    { label: 'Category', name: 'category', type: 'select', options: CATEGORY_OPTIONS },
  ];

  return (
    <div className="bot-manage">
      <div className="bot-stats">
        <span><FiLayers size={16} /> Total: {state.entries.length}</span>
        <span><FiCheckCircle size={16} /> Answered: {state.entries.filter(e => e.isAnswered).length}</span>
        <span><FiHelpCircle size={16} /> Pending: {state.entries.filter(e => e.status === 'pending' && !e.isAnswered).length}</span>
      </div>

      <div className="bot-header">
        <div className="filter-tabs">
          {['all', 'answered', 'pending'].map(f => (
            <button
              key={f}
              className={`filter-tab ${state.filter === f ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_FILTER', payload: f })}
            >
              {f === 'all' ? (
                <><FiLayers size={14} /> All</>
              ) : f === 'answered' ? (
                <><FiCheckCircle size={14} /> Answered</>
              ) : (
                <><FiHelpCircle size={14} /> Pending</>
              )}
            </button>
          ))}
        </div>
        <div className="header-actions">
          {hasMore && <button className="load-more-btn" onClick={handleLoadMore}>Load More</button>}
          <button className="add-btn" onClick={() => dispatch({ type: 'TOGGLE_FORM' })}><FiPlus size={16} /> Add Knowledge</button>
        </div>
      </div>

      <div className="bot-grid">
        {visibleEntries.map(entry => (
          <BotCard
            key={entry.id}
            entry={entry}
            confirmDeleteId={state.confirmDeleteId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAnswer={handleAnswer}
          />
        ))}
      </div>

      {!visibleEntries.length && (
        <div className="no-entries">
          <p><FiMessageCircle size={18} /> No entries found. Click "Add Knowledge" to create one.</p>
        </div>
      )}

      {hasMore && <div ref={loadMoreRef} className="load-more-trigger"><div className="spinner small" /></div>}

      {state.showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{state.editingId ? 'Edit Knowledge' : state.answeringId ? 'Answer Question' : 'Add Knowledge'}</h3>
              <button className="close-modal" onClick={handleCancel}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              {state.answeringId && state.formData.question && (
                <div className="form-group">
                  <label>Question</label>
                  <p className="pending-question">"{state.formData.question}"</p>
                </div>
              )}
              {formFields.map(renderField)}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                <button type="submit" className="save-btn">
                  {state.editingId ? <><FiCheck size={16} /> Update</> : state.answeringId ? <><FiSend size={16} /> Save Answer</> : <><FiPlus size={16} /> Save</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bot;