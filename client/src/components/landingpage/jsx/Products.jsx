import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { addToCart } from '../../../utils/CartUtil';
import SEO from '../../SEO/Seo';
import '../css/Products.css';
import { cacheUtil } from '../../../utils/cacheUtils';
import { 
  FiPackage, FiHome, FiLayers, FiGrid, 
  FiSun, FiBriefcase, FiShoppingCart, FiArrowRight, FiSearch 
} from 'react-icons/fi';

const PRODUCTS_PER_LOAD = 6;
const LIGHT_PRODUCTS_COUNT = 3;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: FiGrid },
  { id: 'sofas', label: 'Sofas', icon: FiHome },
  { id: 'beds', label: 'Beds', icon: FiLayers },
  { id: 'tables', label: 'Tables', icon: FiGrid },
  { id: 'outdoor', label: 'Outdoor', icon: FiSun },
  { id: 'office', label: 'Office', icon: FiBriefcase },
];

const Products = ({ variant = 'full' }) => {
  const { cart, setCart } = useOutletContext();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(
    variant === 'light' ? LIGHT_PRODUCTS_COUNT : PRODUCTS_PER_LOAD
  );
  const [loading, setLoading] = useState(true);
  const loadMoreRef = useRef(null);

  const isLight = variant === 'light';
  const isFull = variant === 'full';

  // ── Fetch products ──
  useEffect(() => {
    const fetchProducts = async () => {
      const cacheKey = 'furnihaven_products';

      // Check cache first
      const cached = cacheUtil.get(cacheKey);
      if (cached) {
        setAllProducts(cached);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/inventory');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        cacheUtil.set(cacheKey, data);
        setAllProducts(data);
        // Set default category to first non-'all' category for light variant
        if (isLight) {
          const firstCategory = CATEGORIES.find(c => c.id !== 'all');
          setSelectedCategory(firstCategory?.id || 'all');
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [isLight]);

  // ── Filter products by category & search ──
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return allProducts.filter((p) => {
      const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
      const searchMatch = !term || p.name.toLowerCase().includes(term);
      return categoryMatch && searchMatch;
    });
  }, [searchTerm, allProducts, selectedCategory]);

  // ── Visible slice ──
  const visibleProducts = useMemo(() => {
    const limit = isLight ? LIGHT_PRODUCTS_COUNT : visibleCount;
    return filteredProducts.slice(0, limit);
  }, [filteredProducts, visibleCount, isLight]);

  const hasMore = isFull && visibleCount < filteredProducts.length;

  // ── Handlers ──
  const handleAddToCart = useCallback(
    (product) => setCart((prev) => addToCart(prev, product)),
    [setCart]
  );

  const handleCategoryClick = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    if (isFull) {
      setVisibleCount(PRODUCTS_PER_LOAD);
    }
  }, [isFull]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    if (isFull) {
      setVisibleCount(PRODUCTS_PER_LOAD);
    }
  }, [isFull]);

  const handleLoadMore = useCallback(() => {
    if (isFull) {
      setVisibleCount((prev) => prev + PRODUCTS_PER_LOAD);
    }
  }, [isFull]);

  const handleProductClick = useCallback((productId) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  const handleViewAll = useCallback(() => {
    navigate('/products');
  }, [navigate]);

  // ── IntersectionObserver for infinite scroll (Full variant only) ──
  useEffect(() => {
    if (!isFull || !loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [isFull, hasMore, handleLoadMore]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="products-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  // ── No products ──
  if (allProducts.length === 0) {
    return (
      <div className={`products-page ${isLight ? 'products-light' : 'products-full'}`}>
        <div className="products-header">
          <h2>{isLight ? 'Featured Furniture' : 'Our Collection'}</h2>
          <p>No products available at the moment. Check back soon!</p>
        </div>
      </div>
    );
  }

  // ── Get display categories (exclude 'all' for light variant) ──
  const displayCategories = isLight
    ? CATEGORIES.filter(c => c.id !== 'all')
    : CATEGORIES;

  return (
    <>
      {isFull && (
        <SEO
          title="Furniture Store Nairobi | Quality Home & Office Furniture"
          description="Explore our collection of quality furniture — office seating, beds, wardrobes, living room sets, and more. Built for durability and delivered across Nairobi."
          keywords="furniture Nairobi, office furniture Kenya, home furniture, wardrobes, beds, living room sets"
        />
      )}
      <div className={`products-page ${isLight ? 'products-light' : 'products-full'}`}>
        <div className="products-header">
          <h2>{isLight ? 'Featured Furniture' : 'Our Collection'}</h2>
          {isLight ? (
            <p>Browse our curated selection of quality pieces</p>
          ) : (
            <p>
              From executive office chairs and spacious wardrobes to elegant
              living room sets and durable kitchen cabinets — our furniture is
              crafted for comfort, built to last, and priced for value.
            </p>
          )}
          {isFull && (
            <h4>Quality craftsmanship. 2-year warranty. Free delivery in Nairobi.</h4>
          )}

          {/* ── Categories ── */}
          <div className="categories-wrapper">
            {displayCategories.map((cat) => {
              const CategoryIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat.id)}
                  aria-label={`Filter by ${cat.label}`}
                >
                  <span className="category-icon"><CategoryIcon size={16} /></span>
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* ── Search & Load More (Full variant only) ── */}
          {isFull && (
            <div className="search-loadmore-wrapper">
              <div className="searchbar">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search furniture..."
                  value={searchTerm}
                  onChange={handleSearch}
                  aria-label="Search products"
                />
              </div>
              {hasMore && (
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Load More
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Products Grid ── */}
        <div className="products-grid">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onDoubleClick={() => handleProductClick(product.id)}
            >
              {product.status === 'offer' && (
                <span className="offer-badge">
                  <FiPackage size={12} /> Offer
                </span>
              )}
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} loading="lazy" />
                ) : (
                  <div className="placeholder-image">No Image</div>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                {isFull && (
                  <p className="product-description">{product.description}</p>
                )}
                <p className="product-price">
                  KSH {Number(product.price).toLocaleString('en-KE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="product-actions">
                <button
                  className="add-to-cart-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  <FiShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Intersection Observer Trigger (Full variant only) ── */}
        {isFull && hasMore && (
          <div ref={loadMoreRef} className="load-more-trigger">
            <div className="spinner small"></div>
          </div>
        )}

        {visibleProducts.length === 0 && (
          <div className="no-products">
            <p>No products found. Try a different search or category.</p>
          </div>
        )}

        {/* ── CTA to Full Variant (Light variant only) ── */}
        {isLight && (
          <div className="home-cta-wrapper">
            <button className="home-view-all-btn" onClick={handleViewAll}>
              View All Products <FiArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Products;