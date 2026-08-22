import { useReducer, useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import '../css/ProductManage.css';

// ── Constants ──
const INITIAL_VISIBLE = 3;
const LOAD_MORE = 3;
const STATUS_OPTIONS = [{ value: 'normal', label: 'Normal' }, { value: 'offer', label: 'Offer' }];
const CATEGORY_OPTIONS = [
  { value: 'tables', label: 'Tables' }, { value: 'seats', label: 'Seats' },
  { value: 'beds', label: 'Beds' }, { value: 'tv-stands', label: 'TV Stands' },
  { value: 'stools', label: 'Stools' }, { value: 'wardrobes', label: 'Wardrobes' },
];
const FORM_FIELDS = [
  { label: 'Product Name', name: 'name' },
  { label: 'Price (KES)', name: 'price', type: 'number' },
  { label: 'Description', name: 'description', type: 'textarea' },
  { label: 'Status', name: 'status', type: 'select', options: STATUS_OPTIONS },
  { label: 'Category', name: 'category', type: 'select', options: CATEGORY_OPTIONS },
  { label: 'Features (comma separated)', name: 'features' },
];

const initialState = {
  products: [], loading: true, showForm: false, editingId: null,
  visibleCount: INITIAL_VISIBLE, confirmDeleteId: null,
  formData: { name: '', price: '', description: '', status: 'normal', category: 'tables', features: '', image: null },
  previewUrl: '',
};

// ── Reducer ──
const reducer = (s, a) => ({
  SET_PRODUCTS: { ...s, products: a.payload, loading: false },
  SET_LOADING: { ...s, loading: a.payload },
  TOGGLE_FORM: { ...s, showForm: !s.showForm },
  SET_EDITING: { ...s, editingId: a.payload, showForm: !!a.payload },
  SET_VISIBLE: { ...s, visibleCount: a.payload },
  SET_CONFIRM_DELETE: { ...s, confirmDeleteId: a.payload },
  RESET_FORM: { ...s, editingId: null, showForm: false, formData: initialState.formData, previewUrl: '' },
  UPDATE_FORM: { ...s, formData: { ...s.formData, ...a.payload } },
  SET_PREVIEW: { ...s, previewUrl: a.payload },
  SET_FORM_WITH_DATA: { ...s, formData: { ...a.payload, image: null }, previewUrl: a.payload.image || '', showForm: true },
}[a.type] || s);

// ── Stats calculator ──
const calcStats = (products) => ({
  total: products.length,
  offerCount: products.filter(p => p.status === 'offer').length,
  totalValue: products.reduce((sum, p) => sum + Number(p.price), 0),
});

// ── Product Card ──
const ProductCard = ({ product, confirmDeleteId, onEdit, onDelete }) => (
  <div className="product-card">
    <div className="product-image">
      {product.image ? <img src={product.image} alt={product.name} loading="lazy" /> : <div className="placeholder-image">No Image</div>}
      <span className={`product-status ${product.status}`}>{product.status === 'offer' ? '🔥 Offer' : 'Normal'}</span>
    </div>
    <div className="product-info">
      <h3>{product.name}</h3>
      <p className="product-price">KSH {Number(product.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p>
      <p className="product-description">{product.description}</p>
      {product.category && <span className="product-category">📂 {product.category}</span>}
    </div>
    <div className="product-actions">
      <button className="edit-btn" onClick={() => onEdit(product)}><FiEdit /> Edit</button>
      <button className="delete-btn" onClick={() => onDelete(product.id)}>
        <FiTrash2 /> {confirmDeleteId === product.id ? 'Confirm?' : 'Delete'}
      </button>
    </div>
  </div>
);

// ── Main ──
const ProductManage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const loadMoreRef = useRef(null);
  const [stats, setStats] = useState({ total: 0, offerCount: 0, totalValue: 0 });

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory?t=' + Date.now(), { credentials: 'include' });
      const data = res.ok ? await res.json() : [];
      dispatch({ type: 'SET_PRODUCTS', payload: Array.isArray(data) ? data : [] });
      setStats(calcStats(data));
    } catch (e) { dispatch({ type: 'SET_LOADING', payload: false }) }
  }, []);

  useEffect(() => { fetchProducts() }, [fetchProducts]);

  const visibleProducts = useMemo(() => state.products.slice(0, state.visibleCount), [state.products, state.visibleCount]);
  const hasMore = state.visibleCount < state.products.length;

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
  const handleFileChange = useCallback(e => {
    const file = e.target.files[0];
    if (file) {
      dispatch({ type: 'UPDATE_FORM', payload: { image: file } });
      dispatch({ type: 'SET_PREVIEW', payload: URL.createObjectURL(file) });
    }
  }, []);
  const resetForm = useCallback(() => dispatch({ type: 'RESET_FORM' }), []);
  const handleCancel = useCallback(() => { dispatch({ type: 'RESET_FORM' }) }, []);
  const handleLoadMore = useCallback(() => dispatch({ type: 'SET_VISIBLE', payload: state.visibleCount + LOAD_MORE }), [state.visibleCount]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { formData, editingId } = state;
    try {
      const form = new FormData();
      ['name', 'price', 'description', 'status', 'category', 'features'].forEach(f => form.append(f, formData[f] || ''));
      if (formData.image) form.append('image', formData.image);
      const res = await fetch(editingId ? `/api/inventory/${editingId}` : '/api/inventory', {
        method: editingId ? 'PUT' : 'POST',
        credentials: 'include',
        body: form,
      });
      if (res.ok) { await fetchProducts(); resetForm() }
    } catch (e) { console.error('Save error:', e) }
  }, [state, fetchProducts, resetForm]);

  const handleDelete = useCallback(async (id) => {
    if (state.confirmDeleteId !== id) { dispatch({ type: 'SET_CONFIRM_DELETE', payload: id }); return }
    dispatch({ type: 'SET_CONFIRM_DELETE', payload: null });
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) await fetchProducts();
    } catch (e) { console.error('Delete error:', e) }
  }, [state.confirmDeleteId, fetchProducts]);

  const handleEdit = useCallback((p) => {
    const { id, name, price, description, status, category, features, image } = p;
    dispatch({ type: 'SET_FORM_WITH_DATA', payload: { name, price: price.toString(), description, status, category, features, image } });
    dispatch({ type: 'SET_EDITING', payload: id });
  }, []);

  if (state.loading) return <div className="product-loading"><div className="spinner" /><p>Loading products...</p></div>;

  const renderField = ({ label, name, type = 'text', options = [] }) => (
    <div className="form-group" key={name}>
      <label>{label}</label>
      {type === 'textarea' ? (
        <textarea name={name} value={state.formData[name] || ''} onChange={handleChange} rows="3" required />
      ) : type === 'select' ? (
        <select name={name} value={state.formData[name] || ''} onChange={handleChange}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'file' ? (
        <div className="file-upload-wrapper">
          <input type="file" id="image-upload" className="file-upload-input" accept="image/*" onChange={handleFileChange} />
          <label htmlFor="image-upload" className="file-upload-label"><FiPlus /> Choose Image</label>
          {state.formData.image && <span className="file-name">{state.formData.image.name}</span>}
          {!state.formData.image && state.previewUrl && !state.editingId && <span className="file-name">Image selected</span>}
          {state.editingId && state.previewUrl && !state.formData.image && <span className="file-name">Current image (replace)</span>}
        </div>
      ) : (
        <input type={type} name={name} value={state.formData[name] || ''} onChange={handleChange} required />
      )}
      {name === 'price' && <small>Price in KES</small>}
    </div>
  );

  return (
    <div className="product-manage">
      <div className="stats-bar">
        <span>📦 Total: {stats.total}</span>
        <span>🔥 Offers: {stats.offerCount}</span>
        <span>💰 Total Value: KSH {stats.totalValue.toLocaleString()}</span>
      </div>

      <div className="product-header">
        <div className="header-actions">
          {hasMore && <button className="load-more-btn" onClick={handleLoadMore}>Load More</button>}
          <button className="add-btn" onClick={() => dispatch({ type: 'TOGGLE_FORM' })}><FiPlus /> Add Product</button>
        </div>
      </div>

      <div className="product-grid">
        {visibleProducts.map(p => <ProductCard key={p.id} product={p} confirmDeleteId={state.confirmDeleteId} onEdit={handleEdit} onDelete={handleDelete} />)}
      </div>

      {!visibleProducts.length && <div className="no-products"><p>No products yet. Click "Add Product" to create one.</p></div>}

      {hasMore && <div ref={loadMoreRef} className="load-more-trigger"><div className="spinner small" /></div>}

      {state.showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{state.editingId ? 'Edit Product' : 'Add Product'}</h3>
              <button className="close-modal" onClick={handleCancel}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {FORM_FIELDS.map(renderField)}
              {renderField({ name: 'image', label: 'Product Image', type: 'file' })}
              {state.previewUrl && <div className="image-preview"><img src={state.previewUrl} alt="Preview" /></div>}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                <button type="submit" className="save-btn">{state.editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManage;