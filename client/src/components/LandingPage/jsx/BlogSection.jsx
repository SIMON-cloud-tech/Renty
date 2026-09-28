import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../../SEO/Seo';
import '../css/BlogSection.css';

const BLOGS_PER_LOAD = 3;
const LIGHT_COUNT = 3;

const BlogSection = ({ variant = 'full' }) => {
  const [allBlogs, setAllBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [visibleCount, setVisibleCount] = useState(
    variant === 'light' ? LIGHT_COUNT : BLOGS_PER_LOAD
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isFull = variant === 'full';

  // ── Fetch blogs ──
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blogs');
        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();

        // Guard 1: force an array
        setAllBlogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch error:', err);
        setAllBlogs([]); // Guard 2: never leave state in an undefined shape
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // ── Filter blogs — full variant only; light just shows the latest ones ──
  const filteredBlogs = useMemo(() => {
    if (!isFull) return allBlogs;

    const term = searchTerm.toLowerCase().trim();
    return allBlogs.filter((blog) => {
      if (!blog) return false; // Guard 3: skip nulls

      const titleMatch = (blog.title ?? '').toLowerCase().includes(term);

      let dateMatch = true;
      if (filterDate && blog.createdAt) {
        const blogDate = new Date(blog.createdAt).toISOString().split('T')[0];
        dateMatch = blogDate === filterDate;
      }

      return titleMatch && dateMatch;
    });
  }, [searchTerm, filterDate, allBlogs, isFull]);

  const visibleBlogs = useMemo(() => {
    const limit = isFull ? visibleCount : LIGHT_COUNT;
    return filteredBlogs.slice(0, limit);
  }, [filteredBlogs, visibleCount, isFull]);

  const hasMore = isFull && visibleCount < filteredBlogs.length;

  // ── Handlers ──
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setVisibleCount(BLOGS_PER_LOAD);
  }, []);

  const handleDateFilter = useCallback((e) => {
    setFilterDate(e.target.value);
    setVisibleCount(BLOGS_PER_LOAD);
  }, []);

  const handleClearDate = useCallback(() => {
    setFilterDate('');
    setVisibleCount(BLOGS_PER_LOAD);
  }, []);

  const handleLoadMore = useCallback(
    () => setVisibleCount((prev) => prev + BLOGS_PER_LOAD),
    []
  );

  // ── Loading ──
  if (loading) {
    return (
      <div className="blog-loading">
        <div className="spinner"></div>
        <p>Loading articles...</p>
      </div>
    );
  }

  // ── Empty ──
  if (allBlogs.length === 0) {
    return (
      <section className="blog-section">
        <div className="blog-header">
          <h2>Renting Tips & Insights</h2>
        </div>
        <div className="no-blogs">
          <p>No articles available. Check back soon for tips on renting and finding your next home!</p>
        </div>
      </section>
    );
  }

  return (
    <>
      {isFull && (
        <SEO
          title="Renting Tips & Insights"
          description="Read our latest articles on finding a house, moving tips, budgeting for rent, and making the most of your rental in Nairobi."
          keywords="renting tips, house hunting Kenya, moving tips Nairobi, rental budgeting, tenant advice Kenya"
        />
      )}
      <section className="blog-section">
        <div className="blog-header">
          <div className="blog-head">
            <h2>{isFull ? 'Get it right the first time' : 'What renters are reading'}</h2>
          </div>
          {isFull && hasMore && (
            <div className="loadmore">
              <button className="load-more-btn" onClick={handleLoadMore}>
                Load More
              </button>
            </div>
          )}
        </div>

        {isFull && (
          <div className="blog-filters">
            <div className="filter-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={handleSearch}
                aria-label="Search blog posts"
              />
              <input
                type="date"
                className="date-input"
                value={filterDate}
                onChange={handleDateFilter}
                aria-label="Filter by date"
              />
              {filterDate && (
                <button
                  className="clear-filter"
                  onClick={handleClearDate}
                  aria-label="Clear date filter"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {isFull && filteredBlogs.length === 0 ? (
          <div className="no-blogs">
            <p>No articles match your search. Try a different keyword.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {visibleBlogs.map((blog, index) => (
              <div key={blog.id ?? blog._id ?? index} className="blog-card">
                <div className="blog-image">
                  {blog.image ? (
                    <img src={blog.image} alt={blog.title ?? 'Blog'} loading="lazy" />
                  ) : (
                    <div className="placeholder-image">No Image</div>
                  )}
                </div>

                <div className="blog-info">
                  <h3>{blog.title ?? 'Untitled'}</h3>
                  <p className="blog-excerpt">
                    {(blog.description ?? '').length > 120
                      ? `${blog.description.substring(0, 120)}...`
                      : (blog.description ?? '')}
                  </p>

                  {typeof blog.keywords === 'string' && blog.keywords.length > 0 && (
                    <div className="blog-tags">
                      {blog.keywords.split(',').slice(0, 3).map((kw, i) => (
                        <span key={`${kw}-${i}`} className="tag">
                          #{kw.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="blog-actions">
                  <Link to={`/blogs/${blog.id}`} className="read-more-btn">
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </section>
    </>
  );
};

export default BlogSection;