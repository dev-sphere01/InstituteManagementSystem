const express = require('express');
const router = express.Router();
const universityController = require('../../../controllers/universityController');

// Create University
router.post('/', universityController.createUniversity);

// Get All Universities
router.get('/', universityController.getAllUniversities);

// Get Single University
router.get('/:id', universityController.getUniversityById);

// Update University
router.put('/:id', universityController.updateUniversity);

// Delete University
router.delete('/:id', universityController.deleteUniversity);

module.exports = router;
