import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../../SEO/Seo';
import '../css/BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ── Fetch blog ──
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  // ── Handlers (memoized) ──
  const handleNavigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleNavigateContact = useCallback(() => {
    navigate('/contact');
  }, [navigate]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="blog-detail-loading">
        <div className="spinner"></div>
        <p>Loading article...</p>
      </div>
    );
  }

  // ── Error state ──
  if (error || !blog) {
    return (
      <div className="blog-detail-notfound">
        <h2>Article Not Found</h2>
        <p>Sorry, the article you're looking for doesn't exist or has been removed.</p>
        <button className="back-home-btn" onClick={handleNavigateBack}>
          ← Back to Blog
        </button>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${blog.title} | FurniHaven Blog`}
        description={blog.description || 'Furniture tips, home styling ideas, and interior design inspiration from FurniHaven.'}
        ogImage={blog.image}
        keywords={blog.keywords || 'furniture tips, home styling, interior design Kenya'}
      />
      <div className="blog-detail">
        {/* Hero / Image */}
        {blog.image && (
          <div className="blog-detail-hero">
            <img src={blog.image} alt={blog.title} loading="lazy" />
          </div>
        )}

        <div className="blog-detail-content">
          <h1>{blog.title}</h1>

          {blog.keywords && (
            <div className="blog-detail-tags">
              {blog.keywords.split(',').map((kw) => (
                <span key={kw} className="detail-tag">#{kw.trim()}</span>
              ))}
            </div>
          )}

          <div className="blog-detail-body">
            <p>{blog.description}</p>
          </div>

          {/* CTA Buttons */}
          <div className="blog-detail-actions">
            <button className="back-home-btn" onClick={handleNavigateContact}>
              Get a Free Consultation 🪑
            </button>
            <button className="back-blog-btn" onClick={handleNavigateBack}>
              ← Back to Articles
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetail;