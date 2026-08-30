const crypto = require('crypto');
const Lead = require('../models/Lead');
const { asyncHandler, AppError } = require('../utils/errorHandler');

// ─── PUBLIC: create a new lead (from contact form) ───
const createLead = asyncHandler(async (req, res) => {
  const { name, phone, email, message, source } = req.body;

  if (!name || !phone || !message) {
    throw new AppError('Name, phone, and message are required', 400);
  }

  const newLead = new Lead({
    id: crypto.randomUUID(),
    name,
    phone,
    email: email || '',
    message,
    source: source || 'contact_form',
    status: 'new',
  });

  await newLead.save();
  res.status(201).json(newLead);
});

// ─── PROTECTED: get all leads ───
const getLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
  res.json(leads);
});

// ─── PROTECTED: get single lead ───
const getLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lead = await Lead.findOne({ id });
  
  if (!lead) {
    throw new AppError('Lead not found', 404);
  }
  
  res.json(lead);
});

// ─── PROTECTED: update lead status ───
const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  const lead = await Lead.findOne({ id });
  if (!lead) {
    throw new AppError('Lead not found', 404);
  }
  
  if (status) {
    lead.status = status;
    
    // Set timestamps based on status
    if (status === 'contacted' && !lead.contactedAt) {
      lead.contactedAt = new Date();
    }
    if (status === 'converted' && !lead.convertedAt) {
      lead.convertedAt = new Date();
    }
  }
  
  if (notes !== undefined) {
    lead.notes = notes;
  }
  
  await lead.save();
  res.json(lead);
});

// ─── PROTECTED: delete lead ───
const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await Lead.deleteOne({ id });
  if (result.deletedCount === 0) {
    throw new AppError('Lead not found', 404);
  }
  
  res.json({ message: 'Lead deleted successfully' });
});

// ─── PROTECTED: get lead stats ───
const getLeadStats = asyncHandler(async (req, res) => {
  const total = await Lead.countDocuments();
  const newLeads = await Lead.countDocuments({ status: 'new' });
  const contacted = await Lead.countDocuments({ status: 'contacted' });
  const converted = await Lead.countDocuments({ status: 'converted' });
  const closed = await Lead.countDocuments({ status: 'closed' });
  
  res.json({ total, newLeads, contacted, converted, closed });
});

module.exports = {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  getLeadStats,
};