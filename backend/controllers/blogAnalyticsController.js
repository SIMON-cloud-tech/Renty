const Blog = require('../models/Blogs');
const { asyncHandler } = require('../utils/errorHandler');

// ─── PROTECTED: get blog analytics ───
const getBlogAnalytics = asyncHandler(async (req, res) => {
  // ── Fetch all blogs ──
  const blogs = await Blog.find();

  // ── Total blogs ──
  const totalBlogs = blogs.length;

  // ── Total views (if views field exists, otherwise 0) ──
  const totalViews = blogs.reduce((sum, b) => sum + (Number(b.views) || 0), 0);

  // ── Average read time ──
  const avgReadTime = totalBlogs > 0 ? '3 min' : '0 min';

  // ── By category (extract from keywords/tags) ──
  const byCategory = {};
  const categoryKeywords = {
    'Furniture': ['furniture', 'sofa', 'bed', 'table', 'chair'],
    'Design': ['design', 'style', 'decor', 'interior'],
    'Maintenance': ['maintenance', 'care', 'clean', 'repair'],
    'News': ['news', 'update', 'announcement', 'launch'],
  };

  blogs.forEach(blog => {
    const text = `${blog.title || ''} ${blog.keywords || ''}`.toLowerCase();
    let matched = false;
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        byCategory[category] = (byCategory[category] || 0) + 1;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      byCategory['Other'] = (byCategory['Other'] || 0) + 1;
    }
  });

  // ── Most viewed posts (sorted by views if available, otherwise recent) ──
  const mostViewed = blogs
    .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0) || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(blog => ({
      title: blog.title || 'Untitled',
      views: Number(blog.views) || 0,
    }));

  // ── Publishing frequency ──
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonthCount = blogs.filter(b => new Date(b.createdAt) >= thisMonth).length;
  const lastMonthCount = blogs.filter(b => {
    const date = new Date(b.createdAt);
    return date >= lastMonth && date < lastMonthEnd;
  }).length;

  // ── Monthly publishing trend (last 6 months) ──
  const monthlyPublishing = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const count = blogs.filter(b => {
      const date = new Date(b.createdAt);
      return date >= monthStart && date < monthEnd;
    }).length;
    
    monthlyPublishing.push({
      month: monthStart.toLocaleString('en-KE', { month: 'short' }),
      posts: count,
    });
  }

  res.json({
    totalBlogs,
    totalViews,
    averageReadTime: avgReadTime,
    byCategory,
    mostViewed,
    publishingFrequency: {
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      average: totalBlogs > 0 ? Math.round(totalBlogs / 6 * 10) / 10 : 0,
    },
    monthlyPublishing,
  });
});

module.exports = { getBlogAnalytics };