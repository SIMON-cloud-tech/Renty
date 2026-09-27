const express = require('express');
const {
  handleChat,
  getBotKnowledge,
  getUnansweredQuestions,
  addBotKnowledge,
  answerQuestion,
  updateBotKnowledge,
  deleteBotKnowledge,
  ignoreQuestion,
} = require('../controllers/chatBotController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public
router.post('/chat', handleChat);

// Protected (admin)
router.get('/', authMiddleware, getBotKnowledge);
router.get('/unanswered', authMiddleware, getUnansweredQuestions);
router.post('/', authMiddleware, addBotKnowledge);
router.put('/:id/answer', authMiddleware, answerQuestion);
router.put('/:id/ignore', authMiddleware, ignoreQuestion);
router.put('/:id', authMiddleware, updateBotKnowledge);
router.delete('/:id', authMiddleware, deleteBotKnowledge);

module.exports = router;