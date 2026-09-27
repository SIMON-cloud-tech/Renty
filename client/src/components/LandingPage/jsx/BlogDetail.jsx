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

        // Guard 1: only accept an object
        setBlog(data && typeof data === 'object' && !Array.isArray(data) ? data : null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(true);
        setBlog(null); // Guard 2: never leave state in a bad shape
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  // ── Increment view count ──
  useEffect(() => {
    const incrementView = async () => {
      try {
        await fetch(`/api/blogs/${id}/view`, { method: 'POST' });
      } catch (err) {
        console.error('Failed to increment view:', err);
      }
    };
    incrementView();
  }, [id]);

  // ── Handlers ──
  const handleNavigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleNavigateContact = useCallback(() => {
    navigate('/contact');
  }, [navigate]);

  // ── Parse keywords safely ──
  const tags = (() => {
    if (!blog) return [];
    const k = blog.keywords;
    if (typeof k === 'string' && k.trim().length > 0) {
      return k.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (Array.isArray(k)) {
      return k.filter(Boolean);
    }
    return [];
  })();

  // ── Loading ──
  if (loading) {
    return (
      <div className="blog-detail-loading">
        <div className="spinner"></div>
        <p>Loading article...</p>
      </div>
    );
  }

  // ── Error ──
  if (error || !blog) {
    return (
      <div className="blog-detail-notfound">
        <h2>Article Not Found</h2>
        <p>Sorry, the article you are looking for does not exist or has been removed.</p>
        <button className="back-home-btn" onClick={handleNavigateBack}>
          ← Back to Blog
        </button>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={blog.title ?? 'Article'}
        description={blog.description ?? 'Renting tips, house hunting advice, and moving guidance from Renty.'}
        ogImage={blog.image ?? ''}
        keywords={blog.keywords ?? 'renting tips, house hunting Kenya, moving advice'}
      />

      <div className="blog-detail">
        {/* Hero image */}
        {blog.image && (
          <div className="blog-detail-hero">
            <img src={blog.image} alt={blog.title ?? 'Article'} loading="lazy" />
          </div>
        )}

        <div className="blog-detail-content">
          <h1>{blog.title ?? 'Untitled Article'}</h1>

          {tags.length > 0 && (
            <div className="blog-detail-tags">
              {tags.map((tag, i) => (
                <span key={`${tag}-${i}`} className="detail-tag">#{tag}</span>
              ))}
            </div>
          )}

          <div className="blog-detail-body">
            <p>{blog.description ?? ''}</p>
          </div>

          <div className="blog-detail-actions">
            <button className="back-home-btn" onClick={handleNavigateContact}>
              Get in Touch 🏠
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