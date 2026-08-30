import { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
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
const ROOM_OPTIONS = [
  { value: 'living-room', label: 'Living Room' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'home-office', label: 'Home Office' },
  { value: 'outdoor-spaces', label: 'Outdoor Spaces' },
];

const INITIAL_FORM = { 
  name: '', price: '', description: '', status: 'normal', 
  category: 'tables', room: 'living-room', features: '', image: null 
};

// ── Form Reducer ──
const formReducer = (state, action) => {
  const actions = {
    SET_FIELD: { ...state, [action.field]: action.value },
    SET_IMAGE: { ...state, image: action.file },
    RESET: INITIAL_FORM,
    SET_FORM: { ...action.data, image: null },
  };
  return actions[action.type] || state;
};

// ── Product Card ──
const ProductCard = ({ product, confirmDeleteId, onEdit, onDelete }) => {
  const { id, name, price, description, status, category, room, image } = product;

  return (
    <div className="product-card">
      <div className="product-image">
        {image ? <img src={image} alt={name || 'Product'} loading="lazy" /> : <div className="placeholder-image">No Image</div>}
        <span className={`product-status ${status}`}>{status === 'offer' ? '🔥 Offer' : 'Normal'}</span>
      </div>
      <div className="product-info">
        <h3>{name || 'Untitled'}</h3>
        <p className="product-price">KSH {Number(price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p>
        <p className="product-description">{description}</p>
        {category && <span className="product-category">📂 {category}</span>}
        {room && <span className="product-room">🏠 {room}</span>}
      </div>
      <div className="product-actions">
        <button className="edit-btn" onClick={() => onEdit(product)}><FiEdit /> Edit</button>
        <button className="delete-btn" onClick={() => onDelete(id)}>
          <FiTrash2 /> {confirmDeleteId === id ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

// ── Main Component ──
const ProductManage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, dispatchForm] = useReducer(formReducer, INITIAL_FORM);
  const [previewUrl, setPreviewUrl] = useState('');

  // ── Fetch ──
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory', { credentials: 'include' });
      const data = res.ok ? await res.json() : [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) { setProducts([]) } finally { setLoading(false) }
  }, []);

  useEffect(() => { fetchProducts() }, [fetchProducts]);

  // ── Memoized ──
  const visibleProducts = useMemo(() => products.slice(0, visibleCount), [products, visibleCount]);
  const hasMore = useMemo(() => visibleCount < products.length, [visibleCount, products.length]);

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
      const url = editingId ? `/api/inventory/${editingId}` : '/api/inventory';
      const form = new FormData();
      ['name', 'price', 'description', 'status', 'category', 'room', 'features'].forEach(f => form.append(f, formData[f] || ''));
      if (formData.image) form.append('image', formData.image);
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', credentials: 'include', body: form });
      if (!res.ok) throw new Error('Failed to save');
      await fetchProducts();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) { console.error('Save error:', err) }
  }, [editingId, formData, fetchProducts, resetForm]);

  // ── Delete ──
  const handleDelete = useCallback(async (id) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return }
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) await fetchProducts();
    } catch (err) { console.error('Delete error:', err) }
  }, [confirmDeleteId, fetchProducts]);

  // ── Edit ──
  const handleEdit = useCallback((product) => {
    const { id, name, price, description, status, category, room, features } = product;
    setEditingId(id);
    dispatchForm({ type: 'SET_FORM', data: { 
      name, price: price.toString(), description, 
      status: status || 'normal', category: category || 'tables', 
      room: room || 'living-room', features: features || '' 
    } });
    setPreviewUrl(product.image || '');
    setShowForm(true);
  }, []);

  // ── Form fields config ──
  const formFields = [
    { label: 'Product Name', name: 'name' },
    { label: 'Price (KES)', name: 'price', type: 'number' },
    { label: 'Description', name: 'description', type: 'textarea' },
    { label: 'Status', name: 'status', type: 'select', options: STATUS_OPTIONS },
    { label: 'Category', name: 'category', type: 'select', options: CATEGORY_OPTIONS },
    { label: 'Room', name: 'room', type: 'select', options: ROOM_OPTIONS },
    { label: 'Features (comma separated)', name: 'features' },
  ];

  // ── Loading ──
  if (loading) return <div className="product-loading"><div className="spinner" /><p>Loading products...</p></div>;

  return (
    <div className="product-manage">
      <div className="product-header">
        <div className="header-actions">
          {hasMore && <button className="load-more-btn" onClick={handleLoadMore}>Load More</button>}
          <button className="add-btn" onClick={() => setShowForm(true)}><FiPlus /> Add Product</button>
        </div>
      </div>

      <div className="product-grid">
        {visibleProducts.map(product => <ProductCard key={product.id} product={product} confirmDeleteId={confirmDeleteId} onEdit={handleEdit} onDelete={handleDelete} />)}
      </div>

      {!visibleProducts.length && <div className="no-products"><p>No products yet. Click "Add Product" to create one.</p></div>}

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
              <button className="close-modal" onClick={handleCancel}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {formFields.map(({ label, name, type = 'text', options = [] }) => (
                <div className="form-group" key={name}>
                  <label>{label}</label>
                  {type === 'textarea' ? (
                    <textarea name={name} value={formData[name] || ''} onChange={handleChange} rows="3" required />
                  ) : type === 'select' ? (
                    <select name={name} value={formData[name] || ''} onChange={handleChange}>
                      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input type={type} name={name} value={formData[name] || ''} onChange={handleChange} required />
                  )}
                  {name === 'price' && <small>Price in KES</small>}
                </div>
              ))}

              <div className="form-group">
                <label>Product Image</label>
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
                <button type="submit" className="save-btn">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManage;