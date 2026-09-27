import { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX, FiList } from 'react-icons/fi';
import '../css/GuidesManage.css';

// ── Constants ──
const INITIAL_VISIBLE = 3;
const LOAD_MORE = 3;

const INITIAL_FORM = {
  title: '',
  description: '',
  features: '',
  image: null,
};

// ── Reducer ──
const formReducer = (state, action) => {
  const actions = {
    SET_FIELD: { ...state, [action.field]: action.value },
    SET_IMAGE: { ...state, image: action.file },
    RESET: INITIAL_FORM,
    SET_FORM: { ...action.data, image: null },
  };
  return actions[action.type] || state;
};

// ── Guide Card ──
const GuideCard = ({ guide, confirmDeleteId, onEdit, onDelete }) => {
  const { id, title, description, features, image } = guide;
  const truncate = (str, len = 100) => str?.length > len ? `${str.substring(0, len)}...` : str || 'No description';

  return (
    <div className="gm-card">
      <div className="gm-image">
        {image ? <img src={image} alt={title || 'Guide'} loading="lazy" /> : <div className="gm-placeholder">No Image</div>}
      </div>
      <div className="gm-info">
        <h3>{title || 'Untitled'}</h3>
        <p className="gm-description">{truncate(description)}</p>
        {features && features.length > 0 && (
          <div className="gm-features-preview">
            <span className="gm-features-count">
              <FiList size={14} /> {features.length} tips
            </span>
            <ul className="gm-features-list">
              {features.slice(0, 3).map((feature, idx) => <li key={idx}>{feature}</li>)}
              {features.length > 3 && <li>+{features.length - 3} more...</li>}
            </ul>
          </div>
        )}
      </div>
      <div className="gm-actions">
        <button className="gm-edit-btn" onClick={() => onEdit(guide)}><FiEdit size={16} /> Edit</button>
        <button className="gm-delete-btn" onClick={() => onDelete(id)}>
          <FiTrash2 size={16} /> {confirmDeleteId === id ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

// ── Main Component ──
const GuidesManage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, dispatchForm] = useReducer(formReducer, INITIAL_FORM);
  const [previewUrl, setPreviewUrl] = useState('');

  // ── Fetch ──
  const fetchGuides = useCallback(async () => {
    try {
      const res = await fetch('/api/guides', { credentials: 'include' });
      const data = res.ok ? await res.json() : [];
      setGuides(Array.isArray(data) ? data : []);
    } catch (e) { setGuides([]) } finally { setLoading(false) }
  }, []);

  useEffect(() => { fetchGuides() }, [fetchGuides]);

  // ── Memoized ──
  const visibleGuides = useMemo(() => guides.slice(0, visibleCount), [guides, visibleCount]);
  const hasMore = useMemo(() => visibleCount < guides.length, [visibleCount, guides.length]);

  // ── Handlers ──
  const handleChange = useCallback((e) => {
    dispatchForm({ type: 'SET_FIELD', field: e.target.name, value: e.target.value });
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      dispatchForm({ type: 'SET_IMAGE', file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const resetForm = useCallback(() => {
    dispatchForm({ type: 'RESET' });
    setPreviewUrl('');
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  }, [resetForm]);

  const handleLoadMore = useCallback(() => setVisibleCount(p => p + LOAD_MORE), []);

  // ── Submit ──
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/guides/${editingId}` : '/api/guides';
      const form = new FormData();
      ['title', 'description', 'features'].forEach(f => form.append(f, formData[f] || ''));
      if (formData.image) form.append('image', formData.image);
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', credentials: 'include', body: form });
      if (!res.ok) throw new Error('Failed to save');
      await fetchGuides();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) { console.error('Save error:', err) }
  }, [editingId, formData, fetchGuides, resetForm]);

  // ── Delete ──
  const handleDelete = useCallback(async (id) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return }
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/guides/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) await fetchGuides();
    } catch (err) { console.error('Delete error:', err) }
  }, [confirmDeleteId, fetchGuides]);

  // ── Edit ──
  const handleEdit = useCallback((guide) => {
    const { id, title, description, features } = guide;
    setEditingId(id);
    dispatchForm({
      type: 'SET_FORM',
      data: {
        title,
        description,
        features: features ? features.join(', ') : '',
      },
    });
    setPreviewUrl(guide.image || '');
    setShowForm(true);
  }, []);

  // ── Form fields config ──
  const formFields = [
    { label: 'Title', name: 'title' },
    { label: 'Description', name: 'description', type: 'textarea' },
    { label: 'Tips (comma-separated)', name: 'features', type: 'text', placeholder: 'e.g. Check the water pressure, Ask about the deposit terms' },
  ];

  // ── Loading ──
  if (loading) return <div className="guides-loading"><div className="spinner" /><p>Loading guides...</p></div>;

  return (
    <div className="guides-manage">
      <div className="guides-header">
        <div className="header-actions">
          {hasMore && <button className="load-more-btn" onClick={handleLoadMore}>Load More</button>}
          <button className="add-btn" onClick={() => setShowForm(true)}><FiPlus size={16} /> Add Guide</button>
        </div>
      </div>

      <div className="guides-grid">
        {visibleGuides.map(guide => <GuideCard key={guide.id} guide={guide} confirmDeleteId={confirmDeleteId} onEdit={handleEdit} onDelete={handleDelete} />)}
      </div>

      {!visibleGuides.length && <div className="no-guides"><p>No guides yet. Click "Add Guide" to create one.</p></div>}

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Guide' : 'Add Guide'}</h3>
              <button className="close-modal" onClick={handleCancel}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {formFields.map(({ label, name, type = 'text', placeholder = '' }) => (
                <div className="form-group" key={name}>
                  <label>{label}</label>
                  {type === 'textarea' ? (
                    <textarea name={name} value={formData[name] || ''} onChange={handleChange} rows="4" required />
                  ) : (
                    <input type={type} name={name} value={formData[name] || ''} onChange={handleChange} placeholder={placeholder} required={name !== 'features'} />
                  )}
                </div>
              ))}

              <div className="form-group">
                <label>Guide Image</label>
                <div className="file-upload-wrapper">
                  <input type="file" id="guide-image-upload" className="file-upload-input" accept="image/*" onChange={handleFileChange} />
                  <label htmlFor="guide-image-upload" className="file-upload-label"><FiPlus size={16} /> Choose Image</label>
                  {formData.image && <span className="file-name">{formData.image.name}</span>}
                  {!formData.image && previewUrl && !editingId && <span className="file-name">Image selected</span>}
                  {editingId && previewUrl && !formData.image && <span className="file-name">Current image (replace)</span>}
                </div>
                {previewUrl && <div className="image-preview"><img src={previewUrl} alt="Preview" /></div>}
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                <button type="submit" className="save-btn">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidesManage;