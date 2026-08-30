import { useState, useEffect, useMemo, useCallback } from 'react';
import '../css/Inventory.css';

const INITIAL_VISIBLE = 3;
const LOAD_MORE = 3;

// ─── Product Card Component (memoized) ───
const InventoryCard = ({ item = {} }) => {
  const { id, image, name, price, description, status } = item;

  // ── Safe image URL ──
  const imageUrl = image || '';

  return (
    <div key={id} className="inventory-card">
      <div className="inventory-image">
        {imageUrl ? (
          <img src={imageUrl} alt={name || 'Product'} loading="lazy" />
        ) : (
          <div className="placeholder-image">No Image</div>
        )}
        <span className={`product-status ${status || 'normal'}`}>
          {status === 'offer' ? '🔥 Offer' : 'Normal'}
        </span>
      </div>
      <div className="inventory-info">
        <h3>{name || 'Unnamed Product'}</h3>
        <p className="product-price">
          KSH {price ? Number(price).toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) : '0.00'}
        </p>
        <p className="product-description">{description || 'No description available'}</p>
      </div>
    </div>
  );
};

// ─── Main Component ───
const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  // ── Fetch products ──
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Memoized values ──
  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount]
  );

  const hasMore = useMemo(
    () => visibleCount < products.length,
    [visibleCount, products.length]
  );

  // ── Handlers ──
  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + LOAD_MORE);
  }, []);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="spinner"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  // ── No products ──
  if (products.length === 0) {
    return (
      <div className="inventory">
        <div className="no-inventory">
          <p>No products in inventory yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory">
      {/* ── Header ── */}
      <div className="inventory-header">
        {hasMore && (
          <button className="load-more-btn" onClick={handleLoadMore}>
            Load More
          </button>
        )}
      </div>

      {/* ── Grid ── */}
      <div className="inventory-grid">
        {visibleProducts.map((product) => (
          <InventoryCard key={product.id} item={product} />
        ))}
      </div>
    </div>
  );
};

export default Inventory;