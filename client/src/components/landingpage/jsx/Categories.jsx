import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import categoriesData from '../../../data/categories.json';
import { cacheUtil } from '../../../utils/cacheUtils';
import '../css/Categories.css';

// ===== Memoized Category Card Component =====
const CategoryCard = memo(({ category, onNavigate, productCount }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => setImageLoaded(true);
  
  const handleImageError = () => {
    setImageError(true);
    console.error(`Failed to load image: ${category.image}`);
  };

  const handleCardClick = useCallback(() => {
    onNavigate(category.path);
  }, [category.path, onNavigate]);

  const getImagePath = (path) => {
    if (path && !path.startsWith('/') && !path.startsWith('http')) {
      return `/${path}`;
    }
    return path;
  };

  return (
    <div 
      className="category-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View ${category.name} collection`}
      style={{ cursor: 'pointer' }}
    >
      <div className="category-image-wrapper">
        {/* Skeleton loader while image loads */}
        {!imageLoaded && !imageError && (
          <div className="category-image-skeleton" />
        )}
        
        {/* Image */}
        <img
          src={getImagePath(category.image)}
          alt={category.name}
          className={`category-image ${imageLoaded ? 'loaded' : ''}`}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Fallback if image fails */}
        {imageError && (
          <div className="category-image-fallback">
            <span>{category.name}</span>
          </div>
        )}
      </div>
      
      <div className="category-info">
        <h3 className="category-name">{category.name}</h3>
        <p className="category-description">{category.description}</p>
        <span className="category-count">
          <FiPackage size={14} /> {productCount} items
        </span>
      </div>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

// ===== Main Categories Component =====
const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Load categories and fetch real product counts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Set categories from JSON
        setCategories(categoriesData.categories);

        // Fetch products to calculate real counts
        const cacheKey = 'furnihaven_products';
        let products = cacheUtil.get(cacheKey);
        
        if (!products) {
          const res = await fetch('/api/inventory');
          if (!res.ok) throw new Error('Failed to fetch products');
          products = await res.json();
          cacheUtil.set(cacheKey, products);
        }

        // Calculate real counts per category
        const counts = {};
        categoriesData.categories.forEach(cat => {
          counts[cat.id] = products.filter(p => 
            p.room === cat.slug || p.category === cat.slug
          ).length;
        });

        setProductCounts(counts);
        console.log('Product counts:', counts);
      } catch (err) {
        console.error('Fetch error:', err);
        // Still show categories even if count fetch fails
        setCategories(categoriesData.categories);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="categories-loading">
        <div className="spinner" />
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <section className="categories-section">
      <div className="categories-container">
        <div className="categories-header">
          <h2 className="categories-title">Shop by Category</h2>
          <p className="categories-subtitle">
            Explore our curated collections designed for every room in your home
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onNavigate={handleNavigation}
              productCount={productCounts[category.id] || 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;