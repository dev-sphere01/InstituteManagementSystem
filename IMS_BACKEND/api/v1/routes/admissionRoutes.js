const express = require('express');
const router = express.Router();
const admissionController = require('../../../controllers/admissioncontroller');
const { validateAdmission } = require('../../../middlewares/validateAdmission');

// CREATE
router.post('/', validateAdmission, admissionController.createAdmission);

// READ
router.get('/', admissionController.getAllAdmissions);
router.get('/search/query', admissionController.searchAdmission);
router.get('/:id', admissionController.getAdmissionById);

// UPDATE
router.put('/:id', validateAdmission, admissionController.updateAdmission);

// DELETE
router.delete('/:id', admissionController.deleteAdmission);

module.exports = router;
