import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { addToCart } from '../../../utils/CartUtil';
import SEO from '../../SEO/Seo';
import '../css/Products.css';

const PRODUCTS_PER_LOAD = 6;

const CategoryPage = ({ filterType = 'category', filterValue = '', title = 'Products' }) => {
  const { cart, setCart } = useOutletContext();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD);
  const [loading, setLoading] = useState(true);
  const loadMoreRef = useRef(null);

  // ── Fetch products ──
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/inventory');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        console.log('Fetched products:', data.length);
        setAllProducts(data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ── Filter products ──
  const filteredProducts = useMemo(() => {
    console.log('Filtering by:', filterType, filterValue);
    console.log('Total products:', allProducts.length);
    
    const filtered = allProducts.filter((p) => {
      if (filterType === 'room') {
        return p.room === filterValue;
      }
      return p.category === filterValue;
    });
    
    console.log('Filtered products:', filtered.length);
    return filtered;
  }, [allProducts, filterType, filterValue]);

  // ── Visible slice ──
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  // ── Handlers ──
  const handleAddToCart = useCallback(
    (product) => setCart((prev) => addToCart(prev, product)),
    [setCart]
  );

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PRODUCTS_PER_LOAD);
  }, []);

  const handleProductClick = useCallback((productId) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  // ── Reset visible count when filter changes ──
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_LOAD);
  }, [filterType, filterValue]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="products-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${title} | FurniHaven - Quality Furniture`}
        description={`Explore our ${title.toLowerCase()} collection.`}
        keywords={`${title}, furniture, Nairobi, Kenya`}
      />
      <div className="products-page products-full">
        <div className="products-header">
          <h2>{title}</h2>
          <p>Browse our curated selection of {title.toLowerCase()} — crafted for comfort, built to last.</p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found in this category. Check back soon!</p>
          </div>
        ) : (
          <div className="products-grid">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onDoubleClick={() => handleProductClick(product.id)}
              >
                {product.status === 'offer' && (
                  <span className="offer-badge">Offer</span>
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
                  <p className="product-description">{product.description}</p>
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
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="load-more-wrapper">
            <button className="load-more-btn" onClick={handleLoadMore}>
              Load More
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryPage;