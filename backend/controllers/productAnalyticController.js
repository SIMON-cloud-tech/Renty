const Product = require('../models/Products');
const { asyncHandler } = require('../utils/errorHandler');

// ─── PROTECTED: get product analytics ───
const getProductAnalytics = asyncHandler(async (req, res) => {
  // ── Fetch all products ──
  const products = await Product.find();

  // ── Total products ──
  const totalProducts = products.length;

  // ── By category ──
  const byCategory = {};
  products.forEach(p => {
    const cat = p.category || 'uncategorized';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });

  // ── By room ──
  const byRoom = {};
  products.forEach(p => {
    const room = p.room || 'unspecified';
    byRoom[room] = (byRoom[room] || 0) + 1;
  });

  // ── By status ──
  const byStatus = {
    normal: products.filter(p => p.status === 'normal').length,
    offer: products.filter(p => p.status === 'offer').length,
  };

  // ── Price ranges ──
  const priceRange = {
    'Under 50K': products.filter(p => p.price < 50000).length,
    '50K - 100K': products.filter(p => p.price >= 50000 && p.price < 100000).length,
    '100K - 200K': products.filter(p => p.price >= 100000 && p.price < 200000).length,
    'Over 200K': products.filter(p => p.price >= 200000).length,
  };

  // ── Average price ──
  const avgPrice = totalProducts > 0 
    ? products.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / totalProducts 
    : 0;

  res.json({
    totalProducts,
    byCategory,
    byRoom,
    byStatus,
    priceRange,
    avgPrice: Math.round(avgPrice),
  });
});

module.exports = { getProductAnalytics };