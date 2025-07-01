const { body, validationResult } = require('express-validator');

exports.validateAdmission = [
  (req, res, next) => {
    const step = req.body.currentStep;

    switch (step) {
      case 'basic':
        body('formNo').notEmpty().withMessage('formNo is required')(req, res, () => {});
        body('centerCode').notEmpty().withMessage('centerCode is required')(req, res, () => {});
        body('employeeId').notEmpty().withMessage('employeeId is required')(req, res, () => {});
        body('generatedRegNo').notEmpty().withMessage('generatedRegNo is required')(req, res, () => {});
        body('fullName').notEmpty().withMessage('fullName is required')(req, res, () => {});
        body('dob').isISO8601().withMessage('Valid dob is required')(req, res, () => {});
        body('gender').notEmpty().withMessage('gender is required')(req, res, () => {});
        body('category').notEmpty().withMessage('category is required')(req, res, () => {});
        body('aadharNo').notEmpty().withMessage('aadharNo is required')(req, res, () => {});
        break;

      case 'contact':
        body('contactNumber').notEmpty().withMessage('contactNumber is required')(req, res, () => {});
        body('emailAddress').isEmail().withMessage('Valid email is required')(req, res, () => {});
        body('state').notEmpty().withMessage('state is required')(req, res, () => {});
        body('district').notEmpty().withMessage('district is required')(req, res, () => {});
        body('address').notEmpty().withMessage('address is required')(req, res, () => {});
        body('pinCode').notEmpty().withMessage('pinCode is required')(req, res, () => {});
        break;

      case 'education':
        body('highestEducationalQualification').notEmpty().withMessage('Qualification is required')(req, res, () => {});
        body('boardOrUniversity').notEmpty().withMessage('Board/University is required')(req, res, () => {});
        body('yearOfPassing').notEmpty().withMessage('Year of passing is required')(req, res, () => {});
        body('courseApplied').notEmpty().withMessage('Course Applied is required')(req, res, () => {});
        body('learningMode').notEmpty().withMessage('Learning Mode is required')(req, res, () => {});
        break;

      case 'extras':
        // You may optionally validate extras here if required
        break;

      case 'submitted':
        // For final submission, optionally validate all fields here
        // Or reuse validations above if needed
        break;

      default:
        // No step = no validation
        return next();
    }

    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    next();
  },
];
