import { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX, FiMapPin } from 'react-icons/fi';
import '../../Business/css/BlogManage.css'; // keep this file: it supplies the card grid and modal styles reused here
import '../../Business/css/Unit.css'; // keep this file: it supplies the form styles reused here

// ── Constants ──
const INITIAL_VISIBLE = 6;
const LOAD_MORE = 6;
const MAX_IMAGES = 4;
// Must match the houseType enum in models/Unit.js exactly
const HOUSE_TYPES = ['single room', 'bedsitter', '1 bedroom', '2 bedroom', '3 bedroom'];
const INITIAL_FORM = {
  houseType: HOUSE_TYPES[0],
  rent: '',
  deposit: '',
  location: '',
  description: '',
  images: [],
  latitude: null,
  longitude: null,
};

// ── Reducer ──
const formReducer = (state, action) => {
  const actions = {
    SET_FIELD: { ...state, [action.field]: action.value },
    SET_IMAGES: { ...state, images: action.files },
    RESET: INITIAL_FORM,
    SET_FORM: { ...INITIAL_FORM, ...action.data, images: [] },
  };
  return actions[action.type] || state;
};

// ── Unit Card ──
const UnitCard = ({ unit, confirmDeleteId, onEdit, onDelete }) => {
  const { id, houseType, rent, location, images, status, latitude } = unit;
  const cover = images?.[0];
  const canDelete = status === 'vacant';
  const hasPin = latitude != null;

  return (
    <div className="project-card">
      <div className="project-image">
        {cover ? <img src={cover} alt={houseType || 'Unit'} loading="lazy" /> : <div className="placeholder-image">No Image</div>}
      </div>
      <div className="project-info">
        <h3>{houseType || 'Unit'}</h3>
        <p className="project-short">
          {location || 'No location'}
          {hasPin && <span className="pin-badge" title="Location pinned"> 📍</span>}
        </p>
        <div className="unit-meta">
          <span className="unit-rent">KES {rent != null ? Number(rent).toLocaleString() : '—'} / month</span>
          <span className={`unit-status ${status || ''}`}>{status || ''}</span>
        </div>
      </div>
      <div className="project-actions">
        <button className="edit-btn" onClick={() => onEdit(unit)}><FiEdit /> Edit</button>
        <button
          className="delete-btn"
          onClick={() => onDelete(id)}
          disabled={!canDelete}
          title={canDelete ? '' : 'Only vacant units can be deleted'}
        >
          <FiTrash2 /> {confirmDeleteId === id ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

// ── Main Component ──
const LandlordUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, dispatchForm] = useReducer(formReducer, INITIAL_FORM);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [formError, setFormError] = useState('');
  const [pinStatus, setPinStatus] = useState('');

  // ── Fetch ──
  const fetchUnits = useCallback(async () => {
    try {
      const res = await fetch('/api/landlord/units', { credentials: 'include' });
      const data = res.ok ? await res.json() : [];
      setUnits(Array.isArray(data) ? data : []);
    } catch (e) { setUnits([]) } finally { setLoading(false) }
  }, []);

  useEffect(() => { fetchUnits() }, [fetchUnits]);

  // ── Memoized ──
  const visibleUnits = useMemo(() => units.slice(0, visibleCount), [units, visibleCount]);
  const hasMore = useMemo(() => visibleCount < units.length, [visibleCount, units.length]);

  // ── Handlers ──
  const handleChange = useCallback((e) => {
    dispatchForm({ type: 'SET_FIELD', field: e.target.name, value: e.target.value });
  }, []);
  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files).slice(0, MAX_IMAGES);
    if (files.length) {
      dispatchForm({ type: 'SET_IMAGES', files });
      setPreviewUrls(files.map(f => URL.createObjectURL(f)));
    }
  }, []);

  // ── Pin location (uses the device's GPS, no paid API) ──
  const handlePinLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPinStatus('Location is not supported on this device.');
      return;
    }
    setPinStatus('Getting your location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        dispatchForm({ type: 'SET_FIELD', field: 'latitude', value: latitude });
        dispatchForm({ type: 'SET_FIELD', field: 'longitude', value: longitude });
        setPinStatus(`Pinned: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      },
      (err) => {
        setPinStatus(
          err.code === err.PERMISSION_DENIED
            ? 'Permission denied. You can still list without a pin.'
            : 'Could not get location. Try again outdoors.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const clearPin = useCallback(() => {
    dispatchForm({ type: 'SET_FIELD', field: 'latitude', value: null });
    dispatchForm({ type: 'SET_FIELD', field: 'longitude', value: null });
    setPinStatus('');
  }, []);

  const resetForm = useCallback(() => {
    dispatchForm({ type: 'RESET' });
    setPreviewUrls([]);
    setFormError('');
    setPinStatus('');
  }, []);
  const handleCancel = useCallback(() => { setShowForm(false); setEditingId(null); resetForm() }, [resetForm]);
  const handleLoadMore = useCallback(() => setVisibleCount(p => p + LOAD_MORE), []);

  // ── Submit ──
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const url = editingId ? `/api/landlord/units/${editingId}` : '/api/landlord/units';
      const form = new FormData();
      ['houseType', 'rent', 'deposit', 'location', 'description'].forEach(f =>
        form.append(f, formData[f] ?? '')
      );
      // Coords are optional — only append if captured
      if (formData.latitude != null) form.append('latitude', formData.latitude);
      if (formData.longitude != null) form.append('longitude', formData.longitude);
      formData.images.forEach(file => form.append('images', file));

      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', credentials: 'include', body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save');
      }
      await fetchUnits();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      console.error('Save error:', err);
      setFormError(err.message || 'Failed to save');
    }
  }, [editingId, formData, fetchUnits, resetForm]);

  // ── Delete ──
  const handleDelete = useCallback(async (id) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return }
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/landlord/units/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) await fetchUnits();
    } catch (err) { console.error('Delete error:', err) }
  }, [confirmDeleteId, fetchUnits]);

  // ── Edit ──
  const handleEdit = useCallback((unit) => {
    const { id, houseType, rent, deposit, location, description, latitude, longitude } = unit;
    setEditingId(id);
    dispatchForm({
      type: 'SET_FORM',
      data: {
        houseType,
        rent,
        deposit: deposit ?? '',
        location,
        description: description || '',
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    });
    setPreviewUrls(unit.images || []);
    setFormError('');
    setPinStatus(
      latitude != null
        ? `Pinned: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
        : ''
    );
    setShowForm(true);
  }, []);

  // ── Loading ──
  if (loading) return <div className="blog-loading"><div className="spinner" /><p>Loading units...</p></div>;

  return (
    <div className="project-manage">
      <div className="project-header">
        <div className="header-actions">
          {hasMore && <button className="load-more-btn" onClick={handleLoadMore}>Load More</button>}
          <button className="add-btn" onClick={() => setShowForm(true)}><FiPlus /> Add Unit</button>
        </div>
      </div>

      <div className="project-grid">
        {visibleUnits.map(u => <UnitCard key={u.id} unit={u} confirmDeleteId={confirmDeleteId} onEdit={handleEdit} onDelete={handleDelete} />)}
      </div>

      {!visibleUnits.length && <div className="no-projects"><p>No units yet. Click "Add Unit" to list one.</p></div>}

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Unit' : 'Add Unit'}</h3>
              <button className="close-modal" onClick={handleCancel}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="form-group">
                <label>House Type</label>
                <select name="houseType" value={formData.houseType} onChange={handleChange} required>
                  {HOUSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Rent (KES / month)</label>
                <input type="number" name="rent" min="1" value={formData.rent} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Deposit (KES)</label>
                <input type="number" name="deposit" min="0" value={formData.deposit} onChange={handleChange} placeholder="0" />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Kitengela" required />
              </div>

              {/* ── Pin location ── */}
              <div className="form-group">
                <label>Pin the house location</label>
                <div className="pin-actions">
                  <button
                    type="button"
                    className="pin-location-btn"
                    onClick={handlePinLocation}
                  >
                    <FiMapPin /> Use my current location
                  </button>
                  {formData.latitude != null && formData.longitude != null && (
                    <button type="button" className="clear-pin-btn" onClick={clearPin}>
                      Clear pin
                    </button>
                  )}
                </div>
                {pinStatus && <p className="pin-status">{pinStatus}</p>}
                <p className="pin-hint">
                  Stand at the house when you tap this so the pin is accurate. Optional — but listings with a pin appear in "near me" searches.
                </p>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" />
              </div>

              <div className="form-group">
                <label>Photos (up to {MAX_IMAGES})</label>
                <div className="file-upload-wrapper">
                  <input type="file" id="unit-images" className="file-upload-input" accept="image/*" multiple onChange={handleFileChange} />
                  <label htmlFor="unit-images" className="file-upload-label"><FiPlus /> Choose Images</label>
                  {formData.images.length > 0 && <span className="file-name">{formData.images.length} selected</span>}
                  {editingId && previewUrls.length > 0 && formData.images.length === 0 && <span className="file-name">Current images (choose new ones to replace)</span>}
                </div>
                {previewUrls.length > 0 && (
                  <div className="image-preview-list">
                    {previewUrls.map((src, i) => <img key={i} src={src} alt={`Preview ${i + 1}`} />)}
                  </div>
                )}
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                <button type="submit" className="save-btn">{editingId ? 'Update' : 'Add Unit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordUnits;