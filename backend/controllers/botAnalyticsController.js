const Bot = require('../models/Bot');
const { asyncHandler } = require('../utils/errorHandler');

// ─── PROTECTED: get bot analytics ───
const getBotAnalytics = asyncHandler(async (req, res) => {
  // ── Fetch all bot entries ──
  const botEntries = await Bot.find();

  // ── Total conversations (answered + unanswered) ──
  const totalConversations = botEntries.length;

  // ── Answered ──
  const answered = botEntries.filter(b => b.isAnswered).length;

  // ── Unanswered ──
  const unanswered = botEntries.filter(b => !b.isAnswered).length;

  // ── Answer rate ──
  const answerRate = totalConversations > 0 
    ? Math.round((answered / totalConversations) * 100) 
    : 0;

  // ── Most asked questions (by frequency) ──
  const mostAskedQuestions = botEntries
    .filter(b => b.frequency > 1 || !b.isAnswered)
    .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
    .slice(0, 5)
    .map(entry => ({
      question: entry.question || entry.reply?.substring(0, 50) || 'Unknown',
      frequency: entry.frequency || 1,
    }));

  // ── By category ──
  const byCategory = {};
  botEntries.forEach(b => {
    const cat = b.category || 'general';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });

  // ── Peak hours (based on createdAt) ──
  const peakHours = {
    'Morning (6AM-12PM)': 0,
    'Afternoon (12PM-5PM)': 0,
    'Evening (5PM-10PM)': 0,
    'Night (10PM-6AM)': 0,
  };

  botEntries.forEach(b => {
    if (!b.createdAt) return;
    const hour = new Date(b.createdAt).getHours();
    if (hour >= 6 && hour < 12) peakHours['Morning (6AM-12PM)']++;
    else if (hour >= 12 && hour < 17) peakHours['Afternoon (12PM-5PM)']++;
    else if (hour >= 17 && hour < 22) peakHours['Evening (5PM-10PM)']++;
    else peakHours['Night (10PM-6AM)']++;
  });

  res.json({
    totalConversations,
    answered,
    unanswered,
    answerRate,
    mostAskedQuestions,
    byCategory,
    peakHours,
  });
});

module.exports = { getBotAnalytics };