import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { FaWhatsapp, FaArrowLeft } from 'react-icons/fa';
import { addToCart } from '../../../utils/CartUtil';
import SEO from '../../SEO/Seo';
import '../css/ProductDetail.css';
import { cacheUtil } from '../../../utils/cacheUtils';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, setCart } = useOutletContext();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ── Fetch product and all products ──
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        // Fetch product by ID and all products in parallel
        const [productRes, allRes] = await Promise.all([
          fetch(`/api/inventory/${id}`, { signal: controller.signal }),
          fetch('/api/inventory', { signal: controller.signal }),
        ]);

        if (!productRes.ok) throw new Error('Product not found');
        if (!allRes.ok) throw new Error('Failed to fetch products');

        const productData = await productRes.json();
        const allData = await allRes.json();

        setProduct(productData);
        setAllProducts(allData);

        // Cache all products for future use
        cacheUtil.set('furnihaven_products', allData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch error:', err);
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [id]);

  // ── Handlers ──
  const handleAddToCart = useCallback(() => {
    if (product) {
      setCart(prev => addToCart(prev, product));
    }
  }, [product, setCart]);

  const handleWhatsApp = useCallback(() => {
    if (!product) return;
    const message = [
      `🪑 *FurniHaven — Furniture Enquiry*`,
      '',
      `*Item:* ${product.name}`,
      `*Price:* KES ${Number(product.price).toLocaleString()}`,
      '',
      `*Description:* ${product.description}`,
      '',
      `I'm interested in this item. Please advise on availability and delivery.`,
    ].join('\n');

    const phone = import.meta.env.VITE_WHATSAPP_NUMBER || '254727713219';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }, [product]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // ── Related products (memoized) ──
  const relatedProducts = useMemo(() => {
    if (!product || allProducts.length === 0) return [];
    return allProducts
      .filter(p => p.id !== product.id)
      .slice(0, 4);
  }, [product, allProducts]);

  // ── Parse features from product ──
  const features = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.features)) return product.features;
    if (typeof product.features === 'string') {
      return product.features.split(',').map(f => f.trim());
    }
    return [];
  }, [product]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  // ── Error state ──
  if (error || !product) {
    return (
      <div className="product-detail-notfound">
        <h2>Product Not Found</h2>
        <p>Sorry, the product you're looking for doesn't exist or has been removed.</p>
        <button className="back-btn" onClick={handleGoBack}>
          ← Back to Shop
        </button>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${product.name} | FurniHaven`}
        description={product.description || 'Quality furniture from FurniHaven — crafted for comfort and built to last.'}
        ogImage={product.image}
        keywords={product.keywords || 'furniture, home decor, office furniture, Nairobi'}
      />
      <div className="product-detail">
        {/* ── Back Button ── */}
        <button className="back-btn" onClick={handleGoBack}>
          <FaArrowLeft /> Back to Shop
        </button>

        {/* ── Main Product ── */}
        <div className="product-detail-main">
          <div className="product-detail-image">
            {product.image ? (
              <img src={product.image} alt={product.name} loading="lazy" />
            ) : (
              <div className="placeholder-image">No Image</div>
            )}
            {product.status === 'offer' && (
              <span className="offer-badge">🔥 Offer</span>
            )}
          </div>

          <div className="product-detail-info">
            <h1>{product.name}</h1>

            <div className="product-detail-price">
              KES {Number(product.price).toLocaleString('en-KE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>

            <p className="product-detail-description">{product.description}</p>

            {features.length > 0 && (
              <div className="product-detail-features">
                <h3>Key Features</h3>
                <ul>
                  {features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="product-detail-actions">
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>
              <button className="whatsapp-btn" onClick={handleWhatsApp}>
                <FaWhatsapp /> Enquire on WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h3>You Might Also Like</h3>
            <div className="related-products-grid">
              {relatedProducts.map((related) => (
                <Link
                  to={`/products/${related.id}`}
                  key={related.id}
                  className="related-product-card"
                >
                  <div className="related-product-image">
                    {related.image ? (
                      <img src={related.image} alt={related.name} loading="lazy" />
                    ) : (
                      <div className="placeholder-image">No Image</div>
                    )}
                  </div>
                  <h4>{related.name}</h4>
                  <p>KES {Number(related.price).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default ProductDetail;