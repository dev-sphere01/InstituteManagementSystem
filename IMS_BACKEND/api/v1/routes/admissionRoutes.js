const express = require('express');
const router = express.Router();
const admissionController = require('../../../controllers/admissioncontroller');
const { validateAdmission } = require('../../../middlewares/validateAdmission');

// CREATE a new admission
router.post('/', validateAdmission, admissionController.createAdmission);

// GET all admissions
router.get('/', admissionController.getAllAdmissions);

// SEARCH by query
router.get('/search/query', admissionController.searchAdmission);

// GET admission by ID
router.get('/:id', admissionController.getAdmissionById);

// UPDATE an admission
router.put('/:id', validateAdmission, admissionController.updateAdmission);

// DELETE an admission
router.delete('/:id', admissionController.deleteAdmission);

module.exports = router;
