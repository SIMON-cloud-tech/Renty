import { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import '../css/BlogManage.css';

// ── Constants ──
const INITIAL_VISIBLE = 3;
const LOAD_MORE = 3;
const INITIAL_FORM = { title: '', description: '', keywords: '', image: null };

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

// ── Blog Card ──
const BlogCard = ({ blog, confirmDeleteId, onEdit, onDelete }) => {
  const { id, title, description, keywords, image } = blog;
  const truncate = (str, len = 100) => str?.length > len ? `${str.substring(0, len)}...` : str || 'No description';

  return (
    <div className="project-card">
      <div className="project-image">
        {image ? <img src={image} alt={title || 'Blog'} loading="lazy" /> : <div className="placeholder-image">No Image</div>}
      </div>
      <div className="project-info">
        <h3>{title || 'Untitled'}</h3>
        <p className="project-short">{truncate(description)}</p>
        {keywords && (
          <div className="blog-keywords">
            {keywords.split(',').map((kw, i) => <span key={i} className="keyword-tag">#{kw.trim()}</span>)}
          </div>
        )}
      </div>
      <div className="project-actions">
        <button className="edit-btn" onClick={() => onEdit(blog)}><FiEdit /> Edit</button>
        <button className="delete-btn" onClick={() => onDelete(id)}>
          <FiTrash2 /> {confirmDeleteId === id ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

// ── Main Component ──
const BlogManage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, dispatchForm] = useReducer(formReducer, INITIAL_FORM);
  const [previewUrl, setPreviewUrl] = useState('');

  // ── Fetch ──
  const fetchBlogs = useCallback(async () => {
    try {
      const res = await fetch('/api/blogs', { credentials: 'include' });
      const data = res.ok ? await res.json() : [];
      setBlogs(Array.isArray(data) ? data : []);
    } catch (e) { setBlogs([]) } finally { setLoading(false) }
  }, []);

  useEffect(() => { fetchBlogs() }, [fetchBlogs]);

  // ── Memoized ──
  const visibleBlogs = useMemo(() => blogs.slice(0, visibleCount), [blogs, visibleCount]);
  const hasMore = useMemo(() => visibleCount < blogs.length, [visibleCount, blogs.length]);

  // ── Handlers (object lookup) ──
  const fieldMap = { SET_FIELD: 'field', SET_IMAGE: 'file' };
  const handleChange = useCallback((e) => {
    dispatchForm({ type: 'SET_FIELD', field: e.target.name, value: e.target.value });
  }, []);
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) { dispatchForm({ type: 'SET_IMAGE', file }); setPreviewUrl(URL.createObjectURL(file)) }
  }, []);
  const resetForm = useCallback(() => { dispatchForm({ type: 'RESET' }); setPreviewUrl('') }, []);
  const handleCancel = useCallback(() => { setShowForm(false); setEditingId(null); resetForm() }, [resetForm]);
  const handleLoadMore = useCallback(() => setVisibleCount(p => p + LOAD_MORE), []);

  // ── Submit ──
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/blogs/${editingId}` : '/api/blogs';
      const form = new FormData();
      ['title', 'description', 'keywords'].forEach(f => form.append(f, formData[f] || ''));
      if (formData.image) form.append('image', formData.image);
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', credentials: 'include', body: form });
      if (!res.ok) throw new Error('Failed to save');
      await fetchBlogs();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) { console.error('Save error:', err) }
  }, [editingId, formData, fetchBlogs, resetForm]);

  // ── Delete ──
  const handleDelete = useCallback(async (id) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return }
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) await fetchBlogs();
    } catch (err) { console.error('Delete error:', err) }
  }, [confirmDeleteId, fetchBlogs]);

  // ── Edit ──
  const handleEdit = useCallback((blog) => {
    const { id, title, description, keywords } = blog;
    setEditingId(id);
    dispatchForm({ type: 'SET_FORM', data: { title, description, keywords: keywords || '' } });
    setPreviewUrl(blog.image || '');
    setShowForm(true);
  }, []);

  // ── Form fields config (object lookup) ──
  const formFields = [
    { label: 'Title', name: 'title' },
    { label: 'Content / Description', name: 'description', type: 'textarea' },
    { label: 'Keywords (comma-separated)', name: 'keywords', type: 'text', placeholder: 'e.g. furniture, home, design' },
  ];

  // ── Loading ──
  if (loading) return <div className="blog-loading"><div className="spinner" /><p>Loading blogs...</p></div>;

  return (
    <div className="project-manage">
      <div className="project-header">
        <div className="header-actions">
          {hasMore && <button className="load-more-btn" onClick={handleLoadMore}>Load More</button>}
          <button className="add-btn" onClick={() => setShowForm(true)}><FiPlus /> Write Blog</button>
        </div>
      </div>

      <div className="project-grid">
        {visibleBlogs.map(b => <BlogCard key={b.id} blog={b} confirmDeleteId={confirmDeleteId} onEdit={handleEdit} onDelete={handleDelete} />)}
      </div>

      {!visibleBlogs.length && <div className="no-projects"><p>No blog posts yet. Click "Write Blog" to create one.</p></div>}

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Blog' : 'Write Blog'}</h3>
              <button className="close-modal" onClick={handleCancel}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {formFields.map(({ label, name, type = 'text', placeholder = '' }) => (
                <div className="form-group" key={name}>
                  <label>{label}</label>
                  {type === 'textarea' ? (
                    <textarea name={name} value={formData[name] || ''} onChange={handleChange} rows="5" required />
                  ) : (
                    <input type={type} name={name} value={formData[name] || ''} onChange={handleChange} placeholder={placeholder} required={name !== 'keywords'} />
                  )}
                </div>
              ))}

              <div className="form-group">
                <label>Blog Image</label>
                <div className="file-upload-wrapper">
                  <input type="file" id="image-upload" className="file-upload-input" accept="image/*" onChange={handleFileChange} />
                  <label htmlFor="image-upload" className="file-upload-label"><FiPlus /> Choose Image</label>
                  {formData.image && <span className="file-name">{formData.image.name}</span>}
                  {!formData.image && previewUrl && !editingId && <span className="file-name">Image selected</span>}
                  {editingId && previewUrl && !formData.image && <span className="file-name">Current image (replace)</span>}
                </div>
                {previewUrl && <div className="image-preview"><img src={previewUrl} alt="Preview" /></div>}
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                <button type="submit" className="save-btn">{editingId ? 'Update' : 'Publish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManage;