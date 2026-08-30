const Lead = require('../models/Lead');
const { asyncHandler } = require('../utils/errorHandler');

// ─── PROTECTED: get lead analytics ───
const getLeadAnalytics = asyncHandler(async (req, res) => {
  // ── Fetch all leads ──
  const leads = await Lead.find();

  // ── Total leads ──
  const totalLeads = leads.length;

  // ── By status ──
  const byStatus = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    closed: leads.filter(l => l.status === 'closed').length,
  };

  // ── Conversion rate ──
  const conversionRate = totalLeads > 0 
    ? Math.round((byStatus.converted / totalLeads) * 100) 
    : 0;

  // ── By source ──
  const bySource = {};
  leads.forEach(l => {
    const source = l.source || 'unknown';
    bySource[source] = (bySource[source] || 0) + 1;
  });

  // ── By product interest (extract from message keywords) ──
  const byProductInterest = {};
  const productKeywords = {
    'Sofas': ['sofa', 'couch', 'seat', 'living room', 'lounge'],
    'Beds': ['bed', 'mattress', 'bedroom'],
    'Tables': ['table', 'dining', 'coffee table', 'desk'],
    'Wardrobes': ['wardrobe', 'closet', 'storage'],
    'Office': ['office', 'chair', 'workstation', 'desk'],
    'TV Stands': ['tv stand', 'tv', 'entertainment'],
    'Other': [],
  };

  leads.forEach(lead => {
    const message = (lead.message || '').toLowerCase();
    let matched = false;
    
    for (const [product, keywords] of Object.entries(productKeywords)) {
      if (product === 'Other') continue;
      if (keywords.some(kw => message.includes(kw))) {
        byProductInterest[product] = (byProductInterest[product] || 0) + 1;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      byProductInterest['Other'] = (byProductInterest['Other'] || 0) + 1;
    }
  });

  // ── By location ──
  const byLocation = {};
  const nairobiAreas = ['karen', 'kilimani', 'umoja', 'westlands', 'donholm', 'kitengela', 'kasarani', 'runda', 'langata', 'south b', 'south c', 'eastleigh', 'parklands', 'lavington', 'kileleshwa'];
  
  leads.forEach(lead => {
    const message = (lead.message || '').toLowerCase();
    const phone = (lead.phone || '').toLowerCase();
    let matched = false;
    
    for (const area of nairobiAreas) {
      if (message.includes(area) || phone.includes(area)) {
        const areaLabel = area.charAt(0).toUpperCase() + area.slice(1);
        byLocation[areaLabel] = (byLocation[areaLabel] || 0) + 1;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      byLocation['Other'] = (byLocation['Other'] || 0) + 1;
    }
  });

  // ── Monthly trend (last 6 months) ──
  const monthlyTrend = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const monthLeads = leads.filter(l => {
      const date = new Date(l.createdAt);
      return date >= monthStart && date < monthEnd;
    }).length;
    
    monthlyTrend.push({
      month: monthStart.toLocaleString('en-KE', { month: 'short' }),
      leads: monthLeads,
    });
  }

  res.json({
    totalLeads,
    byStatus,
    conversionRate,
    bySource,
    byProductInterest,
    byLocation,
    monthlyTrend,
  });
});

module.exports = { getLeadAnalytics };