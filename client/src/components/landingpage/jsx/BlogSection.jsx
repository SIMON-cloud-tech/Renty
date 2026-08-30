import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../SEO/Seo';
import '../css/BlogSection.css';

const BLOGS_PER_LOAD = 3;

const BlogSection = () => {
  const [allBlogs, setAllBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [visibleCount, setVisibleCount] = useState(BLOGS_PER_LOAD);
  const [loading, setLoading] = useState(true);

  // ── Fetch blogs ──
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blogs');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setAllBlogs(data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // ── Filter blogs (memoized) ──
  const filteredBlogs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return allBlogs.filter((blog) => {
      // Title search
      const titleMatch = blog.title.toLowerCase().includes(term);

      // Date filter
      let dateMatch = true;
      if (filterDate) {
        const blogDate = new Date(blog.createdAt).toISOString().split('T')[0];
        dateMatch = blogDate === filterDate;
      }

      return titleMatch && dateMatch;
    });
  }, [searchTerm, filterDate, allBlogs]);

  // ── Visible slice (memoized) ──
  const visibleBlogs = useMemo(
    () => filteredBlogs.slice(0, visibleCount),
    [filteredBlogs, visibleCount]
  );

  const hasMore = visibleCount < filteredBlogs.length;

  // ── Handlers (memoized) ──
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

  // ── Loading state ──
  if (loading) {
    return (
      <div className="blog-loading">
        <div className="spinner"></div>
        <p>Loading articles...</p>
      </div>
    );
  }

  // ── No blogs ──
  if (allBlogs.length === 0) {
    return (
      <section className="blog-section">
        <div className="blog-header">
          <h2>Furniture Insights & Tips</h2>
        </div>
        <div className="no-blogs">
          <p>No articles available. Check back soon for furniture tips and inspiration!</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <SEO
        title="Furniture Tips & Inspiration | FurniHaven Blog"
        description="Read our latest articles on furniture selection, home styling tips, office setup ideas, and interior design inspiration for Nairobi homes and businesses."
        keywords="furniture blog, home styling, office furniture tips, interior design Kenya, furniture care"
      />
      <section className="blog-section">
        {/* HEADER + LOAD MORE */}
        <div className="blog-header">
          <div className="blog-head">
            <h2>Furniture Tips & Inspiration</h2>
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
              <button className="clear-filter" onClick={handleClearDate} aria-label="Clear date filter">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* BLOG GRID */}
        {filteredBlogs.length === 0 ? (
          <div className="no-blogs">
            <p>No articles match your search. Try a different keyword.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {visibleBlogs.map((blog) => (
              <div key={blog.id} className="blog-card">
                <div className="blog-image">
                  {blog.image ? (
                    <img src={blog.image} alt={blog.title} loading="lazy" />
                  ) : (
                    <div className="placeholder-image">No Image</div>
                  )}
                </div>
                <div className="blog-info">
                  <h3>{blog.title}</h3>
                  <p className="blog-excerpt">
                    {blog.description && blog.description.length > 120
                      ? `${blog.description.substring(0, 120)}...`
                      : blog.description}
                  </p>
                  {blog.keywords && (
                    <div className="blog-tags">
                      {blog.keywords.split(',').slice(0, 3).map((kw) => (
                        <span key={kw} className="tag">#{kw.trim()}</span>
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