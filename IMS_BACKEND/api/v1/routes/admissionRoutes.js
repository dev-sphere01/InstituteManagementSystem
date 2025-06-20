const express = require('express');
const router = express.Router();
const admissionController = require('../../../controllers/admissioncontroller');
const { validateAdmission } = require('../../../middlewares/validateAdmission');

// Create
router.post('/', validateAdmission, admissionController.createAdmission);

// Read
router.get('/', admissionController.getAllAdmissions);
router.get('/:id', admissionController.getAdmissionById);

// Update
router.put('/:id', validateAdmission, admissionController.updateAdmission);

// Delete
router.delete('/:id', admissionController.deleteAdmission);

module.exports = router;
