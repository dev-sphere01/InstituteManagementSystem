const express = require('express');
const router = express.Router();
const examDetailsController = require('../../../controllers/examDetailsController');

// Create ExamDetail
router.post('/', examDetailsController.createExamDetail);

// Get All ExamDetails
router.get('/', examDetailsController.getAllExamDetails);

// Get Single ExamDetail by ID
router.get('/:id', examDetailsController.getExamDetailById);

// Update ExamDetail
router.put('/:id', examDetailsController.updateExamDetail);

// Delete ExamDetail
router.delete('/:id', examDetailsController.deleteExamDetail);

module.exports = router;
