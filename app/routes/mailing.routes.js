const express = require('express');
const router = express.Router();
const mailingController = require('../controllers/mailing.controller');

router.post('/subscribe', mailingController.subscribe);

module.exports = router;