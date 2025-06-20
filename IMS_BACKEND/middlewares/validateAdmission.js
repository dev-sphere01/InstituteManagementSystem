const { body, validationResult } = require('express-validator');

exports.validateAdmission = [
  body('formNo').notEmpty().withMessage('formNo is required'),
  body('centerCode').notEmpty().withMessage('centerCode is required'),
  body('employeeId').notEmpty().withMessage('employeeId is required'),
  body('generatedRegNo').notEmpty().withMessage('generatedRegNo is required'),
  body('fullName').notEmpty().withMessage('fullName is required'),
  body('dob').isISO8601().toDate().withMessage('Valid dob is required'),
  body('gender').notEmpty().withMessage('gender is required'),
  body('category').notEmpty().withMessage('category is required'),
  body('aadharNo').notEmpty().withMessage('aadharNo is required'),
  body('emailAddress').isEmail().withMessage('Valid email is required'),
  body('regNo').notEmpty().withMessage('regNo is required'),
  body('month').notEmpty().withMessage('month is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  }
];
