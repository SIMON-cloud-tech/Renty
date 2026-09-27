import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../../utils/CartUtil';
import SEO from '../../SEO/Seo';
import '../css/NewArrivals.css';

const PRODUCTS_PER_LOAD = 3;

const NewArrivals = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── Fetch products ──
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/inventory');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        // Sort by newest first
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllProducts(sorted);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ── Filter products (memoized) ──
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return allProducts.filter((product) => {
      // Name search
      const nameMatch = product.name.toLowerCase().includes(term);

      // Category filter
      const categoryMatch = !filterCategory || product.category === filterCategory;

      return nameMatch && categoryMatch;
    });
  }, [searchTerm, filterCategory, allProducts]);

  // ── Visible slice (memoized) ──
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const hasMore = visibleCount < filteredProducts.length;

  // ── Handlers (memoized) ──
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setVisibleCount(PRODUCTS_PER_LOAD);
  }, []);

  const handleCategoryFilter = useCallback((e) => {
    setFilterCategory(e.target.value);
    setVisibleCount(PRODUCTS_PER_LOAD);
  }, []);

  const handleClearFilter = useCallback(() => {
    setFilterCategory('');
    setVisibleCount(PRODUCTS_PER_LOAD);
  }, []);

  const handleLoadMore = useCallback(
    () => setVisibleCount((prev) => prev + PRODUCTS_PER_LOAD),
    []
  );

  const handleProductClick = useCallback((productId) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="newarrivals-loading">
        <div className="spinner"></div>
        <p>Loading new arrivals...</p>
      </div>
    );
  }

  // ── No products ──
  if (allProducts.length === 0) {
    return (
      <section className="newarrivals-section">
        <div className="newarrivals-header">
          <h2>New Arrivals</h2>
        </div>
        <div className="no-products">
          <p>No new products available. Check back soon!</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <SEO
        title="New Arrivals | FurniHaven - Fresh Furniture Collection"
        description="Discover our latest furniture arrivals. New sofas, beds, tables, office furniture, and more — fresh from our workshop."
        keywords="new furniture, latest furniture, new arrivals, furniture Nairobi, fresh collection"
      />
      <section className="newarrivals-section">
        {/* HEADER + LOAD MORE */}
        <div className="newarrivals-header">
          <div className="newarrivals-head">
            <h2>New Arrivals</h2>
            <p>Fresh from our workshop — the latest pieces for your home and office</p>
          </div>
          {hasMore && (
            <div className="loadmore">
              <button className="load-more-btn" onClick={handleLoadMore}>
                Load More
              </button>
            </div>
          )}
        </div>

        {/* FILTERS */}
        <div className="newarrivals-filters">
          <div className="filter-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              aria-label="Search products"
            />
            <select
              className="category-select"
              value={filterCategory}
              onChange={handleCategoryFilter}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              <option value="sofas">Sofas</option>
              <option value="beds">Beds</option>
              <option value="tables">Tables</option>
              <option value="outdoor">Outdoor</option>
              <option value="office">Office</option>
            </select>
            {filterCategory && (
              <button className="clear-filter" onClick={handleClearFilter} aria-label="Clear category filter">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products match your search. Try a different keyword.</p>
          </div>
        ) : (
          <div className="newarrivals-grid">
            {visibleProducts.map((product) => (
              <div 
                key={product.id} 
                className="newarrival-card"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="newarrival-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} loading="lazy" />
                  ) : (
                    <div className="placeholder-image">No Image</div>
                  )}
                  {product.status === 'offer' && (
                    <span className="offer-badge">🔥 Offer</span>
                  )}
                </div>
                <div className="newarrival-info">
                  <h3>{product.name}</h3>
                  <p className="newarrival-excerpt">
                    {product.description && product.description.length > 100
                      ? `${product.description.substring(0, 100)}...`
                      : product.description}
                  </p>
                  <p className="newarrival-price">
                    KSH {Number(product.price).toLocaleString('en-KE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  {product.room && (
                    <span className="room-tag">🏠 {product.room}</span>
                  )}
                </div>
                <div className="newarrival-actions">
                  <button 
                    className="view-product-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product.id);
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default NewArrivals;