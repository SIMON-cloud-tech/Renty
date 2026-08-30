const crypto = require('crypto');
const Bot = require('../models/Bot');
const { parseAndReply } = require('../utils/chatBotParser');
const { asyncHandler, AppError } = require('../utils/errorHandler');

// ═══════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════

// ─── PUBLIC: handle chat message ───
const handleChat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    throw new AppError('Message is required', 400);
  }

  console.log('GET Chatbot api successfully called');
  
  const result = await parseAndReply(message);
  
  if (result.isUnanswered) {
    const existingUnanswered = await Bot.findOne({ 
      question: message.toLowerCase().trim(),
      isAnswered: false 
    });
    
    if (existingUnanswered) {
      existingUnanswered.frequency += 1;
      await existingUnanswered.save();
    } else {
      const newUnanswered = new Bot({
        id: crypto.randomUUID(),
        keywords: [],
        reply: '',
        question: message,
        askedBy: 'anonymous',
        isAnswered: false,
        status: 'pending',
        frequency: 1,
        category: 'general'
      });
      await newUnanswered.save();
    }
  }
  
  res.json({ reply: result.reply });
});

// ═══════════════════════════════════════
// PROTECTED ROUTES (ADMIN DASHBOARD)
// ═══════════════════════════════════════

// ─── PROTECTED: get all bot knowledge ───
const getBotKnowledge = asyncHandler(async (req, res) => {
  const entries = await Bot.find().sort({ createdAt: -1 });
  res.json(entries);
});

// ─── PROTECTED: get unanswered questions only ───
const getUnansweredQuestions = asyncHandler(async (req, res) => {
  const questions = await Bot.find({ 
    isAnswered: false,
    status: 'pending'
  }).sort({ frequency: -1, createdAt: -1 });
  
  res.json(questions);
});

// ─── PROTECTED: add new bot knowledge ───
const addBotKnowledge = asyncHandler(async (req, res) => {
  const { keywords, reply, category, context } = req.body;
  
  if (!reply) {
    throw new AppError('Reply is required', 400);
  }
  
  let keywordsArray = [];
  if (keywords) {
    keywordsArray = Array.isArray(keywords) 
      ? keywords 
      : keywords.split(',').map(k => k.trim()).filter(Boolean);
  }
  
  const newEntry = new Bot({
    id: crypto.randomUUID(),
    keywords: keywordsArray,
    reply,
    category: category || 'general',
    context: context || {},
    isAnswered: true,
    status: 'answered',
  });
  
  await newEntry.save();
  res.status(201).json(newEntry);
});

// ─── PROTECTED: answer an unanswered question ───
const answerQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { keywords, reply, category, context } = req.body;
  
  const question = await Bot.findOne({ id, isAnswered: false });
  if (!question) {
    throw new AppError('Question not found or already answered', 404);
  }
  
  let keywordsArray = [];
  if (keywords) {
    keywordsArray = Array.isArray(keywords) 
      ? keywords 
      : keywords.split(',').map(k => k.trim()).filter(Boolean);
  }
  
  question.keywords = keywordsArray;
  question.reply = reply;
  question.category = category || 'general';
  question.context = context || {};
  question.isAnswered = true;
  question.status = 'answered';
  question.answeredBy = req.user.id;
  question.answeredAt = new Date();
  
  await question.save();
  res.json(question);
});

// ─── PROTECTED: update bot knowledge ───
const updateBotKnowledge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { keywords, reply, category, context } = req.body;
  
  const entry = await Bot.findOne({ id });
  if (!entry) {
    throw new AppError('Entry not found', 404);
  }
  
  if (reply) entry.reply = reply;
  if (category) entry.category = category;
  if (context) entry.context = context;
  
  if (keywords !== undefined) {
    entry.keywords = Array.isArray(keywords) 
      ? keywords 
      : keywords.split(',').map(k => k.trim()).filter(Boolean);
  }
  
  await entry.save();
  res.json(entry);
});

// ─── PROTECTED: delete bot knowledge ───
const deleteBotKnowledge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await Bot.deleteOne({ id });
  if (result.deletedCount === 0) {
    throw new AppError('Entry not found', 404);
  }
  
  res.json({ message: 'Entry deleted successfully' });
});

// ─── PROTECTED: ignore unanswered question ───
const ignoreQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const question = await Bot.findOne({ id, isAnswered: false });
  if (!question) {
    throw new AppError('Question not found', 404);
  }
  
  question.status = 'ignored';
  await question.save();
  
  res.json({ message: 'Question ignored' });
});

module.exports = {
  handleChat,
  getBotKnowledge,
  getUnansweredQuestions,
  addBotKnowledge,
  answerQuestion,
  updateBotKnowledge,
  deleteBotKnowledge,
  ignoreQuestion,
};