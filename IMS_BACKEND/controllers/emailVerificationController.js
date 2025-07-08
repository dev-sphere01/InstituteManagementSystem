// Handles OTP generation, storage, and verification for email verification
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory store for OTPs (for demo; use DB/Redis for production)
const otpStore = {};

// Configure your email transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send OTP to email
exports.sendOtp = async (req, res) => {
    const { email, admissionData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes
    otpStore[email] = { otp, expiresAt, admissionData };

    // Send email
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It is valid for 2 minutes.`
        });
        res.json({ message: 'OTP sent' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to send OTP', error: err.message });
    }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });
    const record = otpStore[email];
    if (!record) return res.status(400).json({ message: 'No OTP sent to this email' });
    if (Date.now() > record.expiresAt) return res.status(400).json({ message: 'OTP expired' });
    if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    delete otpStore[email];
    // Create admission record
    try {
      const AdmissionDetails = require('../models/admission');
      // Assuming admission data was stored in otpStore[email].admissionData
      // If not, you'll need to adjust how you're storing the data
      const admissionData = otpStore[email]?.admissionData;

      if (!admissionData) {
        return res.status(500).json({ message: 'Admission data not found' });
      }
      const admission = new AdmissionDetails(admissionData);
      await admission.save({ validateBeforeSave: false }); // Await the save operation
      res.status(201).json({ message: 'Email verified and admission created', admission });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to create admission', error: err.message });
    }
  }