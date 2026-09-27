import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import '../css/TestimonialsManage.css';

// ── Constants ──
const INITIAL_VISIBLE = 3;
const LOAD_MORE = 3;
const INITIAL_FORM = { name: '', location: '', text: '' };

// ── Testimonial Card ──
const TestimonialCard = ({ testimonial, onEdit, onDelete }) => {
  const { id, name, location, text } = testimonial;
  return (
    <div className="testimonial-card">
      <div className="testimonial-content">
        <p className="testimonial-text">"{text}"</p>
        <div className="testimonial-author">
          <h4>{name}</h4>
          {location && <span className="testimonial-location">{location}</span>}
        </div>
      </div>
      <div className="testimonial-actions">
        <button className="edit-btn" onClick={() => onEdit(testimonial)}><FiEdit /> Edit</button>
        <button className="delete-btn" onClick={() => onDelete(id)}><FiTrash2 /> Delete</button>
      </div>
    </div>
  );
};

// ── Main Component ──
const TestimonialsManage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // ── Fetch ──
  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch('/api/testimonials', { credentials: 'include' });
      const data = res.ok ? await res.json() : [];
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (e) { setTestimonials([]) } finally { setLoading(false) }
  }, []);

  useEffect(() => { fetchTestimonials() }, [fetchTestimonials]);

  // ── Memoized ──
  const visibleTestimonials = useMemo(() => testimonials.slice(0, visibleCount), [testimonials, visibleCount]);
  const hasMore = useMemo(() => visibleCount < testimonials.length, [visibleCount, testimonials.length]);

  // ── Handlers ──
  const handleChange = useCallback((e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  }, []);

  const resetForm = useCallback(() => setFormData(INITIAL_FORM), []);
  const handleCancel = useCallback(() => { setShowForm(false); setEditingId(null); resetForm() }, [resetForm]);
  const handleLoadMore = useCallback(() => setVisibleCount(p => p + LOAD_MORE), []);

  // ── Submit ──
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/testimonials/${editingId}` : '/api/testimonials';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to save');
      await fetchTestimonials();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) { console.error('Save error:', err) }
  }, [editingId, formData, fetchTestimonials, resetForm]);

  // ── Delete ──
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) await fetchTestimonials();
    } catch (err) { console.error('Delete error:', err) }
  }, [fetchTestimonials]);

  // ── Edit ──
  const handleEdit = useCallback((testimonial) => {
    const { id, name, location, text } = testimonial;
    setEditingId(id);
    setFormData({ name, location: location || '', text });
    setShowForm(true);
  }, []);

  // ── Form fields config ──
  const formFields = [
    { label: 'Client Name', name: 'name', type: 'text', required: true },
    { label: 'Location (optional)', name: 'location', type: 'text', placeholder: 'e.g. Nairobi, Kenya' },
    { label: 'Testimonial Text', name: 'text', type: 'textarea', required: true },
  ];

  // ── Loading ──
  if (loading) return <div className="testimonials-loading"><div className="spinner" /><p>Loading testimonials...</p></div>;

  return (
    <div className="testimonials-manage">
      <div className="testimonials-header">
        <div className="header-actions">
          {hasMore && <button className="load-more-btn" onClick={handleLoadMore}>Load More</button>}
          <button className="add-btn" onClick={() => setShowForm(true)}><FiPlus /> Add Testimonial</button>
        </div>
      </div>

      <div className="testimonials-grid">
        {visibleTestimonials.map(t => <TestimonialCard key={t.id} testimonial={t} onEdit={handleEdit} onDelete={handleDelete} />)}
      </div>

      {!visibleTestimonials.length && <div className="no-testimonials"><p>No testimonials yet. Click "Add Testimonial" to create one.</p></div>}

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button className="close-modal" onClick={handleCancel}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
             {formFields.map((field) => (
                <div className="form-group" key={field.name}>
                  <label>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea 
                    name={field.name}
                    value={formData[field.name] || ''} 
                    onChange={handleChange} 
                    rows="4" 
                    required={field.required || false} />
                  ) : (
                    <input 
                    type={field.type || "text"}
                    name={field.name} 
                    value={formData[field.name] || ''} 
                    onChange={handleChange} 
                    placeholder={field.placeholder || ""} 
                    required={field.required} />
                  )}
                </div>
              ))}
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

export default TestimonialsManage;