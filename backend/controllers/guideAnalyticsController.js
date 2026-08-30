const Guide = require('../models/Guides');
const { asyncHandler } = require('../utils/errorHandler');

// ─── PROTECTED: get guide analytics ───
const getGuideAnalytics = asyncHandler(async (req, res) => {
  // ── Fetch all guides ──
  const guides = await Guide.find();

  // ── Total guides ──
  const totalGuides = guides.length;

  // ── With features ──
  const withFeatures = guides.filter(g => g.features && g.features.length > 0).length;

  // ── With images ──
  const withImages = guides.filter(g => g.image).length;

  // ── By room/category ──
  const byRoom = {};
  guides.forEach(g => {
    const room = g.room || g.category || 'general';
    byRoom[room] = (byRoom[room] || 0) + 1;
  });

  // ── Recent guides ──
  const recentGuides = guides
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(guide => ({
      title: guide.title || 'Untitled',
      createdAt: new Date(guide.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' }),
    }));

  res.json({
    totalGuides,
    withFeatures,
    withImages,
    byRoom,
    recentGuides,
  });
});

module.exports = { getGuideAnalytics };