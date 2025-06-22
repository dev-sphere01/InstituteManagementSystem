const { body, validationResult } = require('express-validator');

exports.validateEnquiry = [
  // body('registrationInfo.centerCode').notEmpty().withMessage('Center Code is required'),
  // body('registrationInfo.employeeId').notEmpty().withMessage('Employee ID is required'),
  body('personalInfo.fullName').notEmpty().withMessage('Full Name is required'),
  body('contactInfo.contactNumber').matches(/^[6-9]\d{9}$/).withMessage('Contact number must be 10 digits'),
  // body('contactInfo.email').isEmail().withMessage('Valid email required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }
];
