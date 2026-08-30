const Product = require('../models/Products');
const Lead = require('../models/Lead');
const Blog = require('../models/Blogs');
const Guide = require('../models/Guides');
const Bot = require('../models/Bot');
const Testimonial = require('../models/Testimonials');
const { asyncHandler } = require('../utils/errorHandler');

// ─── PROTECTED: get analytics overview ───
const getOverview = asyncHandler(async (req, res) => {
  // ── Fetch counts from all models ──
  const [
    totalProducts,
    totalLeads,
    totalBlogs,
    totalGuides,
    totalBotConversations,
    totalTestimonials,
    newLeads,
    convertedLeads,
    pendingBotQuestions,
    recentLeads,
    recentProducts,
    recentBlogs,
    recentGuides,
  ] = await Promise.all([
    Product.countDocuments(),
    Lead.countDocuments(),
    Blog.countDocuments(),
    Guide.countDocuments(),
    Bot.countDocuments({ status: 'answered' }),
    Testimonial.countDocuments(),
    Lead.countDocuments({ status: 'new' }),
    Lead.countDocuments({ status: 'converted' }),
    Bot.countDocuments({ isAnswered: false, status: 'pending' }),
    Lead.find().sort({ createdAt: -1 }).limit(5),
    Product.find().sort({ createdAt: -1 }).limit(5),
    Blog.find().sort({ createdAt: -1 }).limit(5),
    Guide.find().sort({ createdAt: -1 }).limit(5),
  ]);

  // ── Calculate total revenue (from products) ──
  const allProducts = await Product.find();
  const totalRevenue = allProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  // ── Build recent activity feed ──
  const recentActivity = [];

  recentLeads.forEach(lead => {
    recentActivity.push({
      type: '🔴 Lead',
      message: `New lead from ${lead.name}`,
      time: lead.createdAt,
    });
  });

  recentProducts.forEach(product => {
    recentActivity.push({
      type: '📦 Product',
      message: `Product added: ${product.name}`,
      time: product.createdAt,
    });
  });

  recentBlogs.forEach(blog => {
    recentActivity.push({
      type: '📝 Blog',
      message: `Blog published: ${blog.title}`,
      time: blog.createdAt,
    });
  });

  recentGuides.forEach(guide => {
    recentActivity.push({
      type: '📚 Guide',
      message: `Guide added: ${guide.title}`,
      time: guide.createdAt,
    });
  });

  // Sort activity by most recent
  recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

  // ── Format activity times ──
  const formattedActivity = recentActivity.slice(0, 10).map(activity => ({
    ...activity,
    time: formatTime(activity.time),
  }));

  // ── Monthly trends (last 6 months) ──
  const monthlyTrend = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const monthLeads = await Lead.countDocuments({
      createdAt: { $gte: monthStart, $lt: monthEnd }
    });
    
    const monthConversions = await Lead.countDocuments({
      convertedAt: { $gte: monthStart, $lt: monthEnd }
    });
    
    monthlyTrend.push({
      month: monthStart.toLocaleString('en-KE', { month: 'short' }),
      leads: monthLeads,
      conversions: monthConversions,
    });
  }

  res.json({
    summary: {
      totalRevenue,
      totalProducts,
      totalLeads,
      totalBlogs,
      totalGuides,
      totalBotConversations,
      totalTestimonials,
      newLeads,
      convertedLeads,
      pendingBotQuestions,
    },
    monthlyTrend,
    recentActivity: formattedActivity,
  });
});

// ─── Helper: format time ───
const formatTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = now - new Date(date);
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  
  return new Date(date).toLocaleDateString('en-KE', { dateStyle: 'medium' });
};

module.exports = {
  getOverview,
};