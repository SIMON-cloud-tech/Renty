const { parseAndReply } = require('../utils/chatBotParser');
const { asyncHandler, AppError } = require('../utils/errorHandler');

const handleChat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    throw new AppError('Message is required', 400);
  }

  console.log('GET Chatbot api successfully called');
  const reply = parseAndReply(message);
  res.json({ reply });
});

module.exports = { handleChat };