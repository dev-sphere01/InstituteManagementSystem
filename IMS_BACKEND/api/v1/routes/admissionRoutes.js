const express = require('express');
const router = express.Router();
const admissionController = require('../../../controllers/admissioncontroller');
const { validateAdmission } = require('../../../middlewares/validateAdmission');
const upload = require('./../../../middlewares/upload');
// const AdmissionDetails = require('./../../../models/admissionDetails');

// CREATE a new admission
router.post('/', validateAdmission, admissionController.createAdmission);

// GET all admissions
router.get('/', admissionController.getAllAdmissions);

// SEARCH by query - no need as in all data also allowed to search
// router.get('/search/query', admissionController.searchAdmission);

// GET admission by ID
router.get('/:id', admissionController.getAdmissionById);

// UPDATE an admission fully by ID
router.put('/:id', validateAdmission, admissionController.updateAdmission);

// PATCH admission (step update) by ID — ✅ FIXED PATH
router.patch('/:id', admissionController.patchAdmission);

// PATCH manual lifecycle status update by ID
router.patch('/:id/lifecycle', admissionController.updateAdmissionLifecycle);

// DELETE admission by ID
router.delete('/:id', admissionController.deleteAdmission);

// admissionRoutes.js or wherever your multer upload route is
router.post('/upload/:id/:field', upload.single('file'), admissionController.uploadAdmissionFile);

module.exports = router;
