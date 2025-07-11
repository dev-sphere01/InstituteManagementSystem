const express = require('express');
const router = express.Router();
const emailVerificationController = require('../../../controllers/emailVerificationController');

// POST /api/v1/email/send-otp
router.post('/send-otp', emailVerificationController.sendOtp);

// POST /api/v1/email/verify-otp
router.post('/verify-otp', emailVerificationController.verifyOtp);

module.exports = router;