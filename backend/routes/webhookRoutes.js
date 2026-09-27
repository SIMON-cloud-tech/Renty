const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Public route — no auth. Daraja calls this.
router.post('/daraja', webhookController.handleDarajaWebhook);

module.exports = router;