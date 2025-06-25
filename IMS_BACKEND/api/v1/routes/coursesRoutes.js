const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} = require('./../../../controllers/coursesController');

// @route   POST /courses
// @desc    Create a new course
router.post('/', createCourse);

// @route   GET /courses
// @desc    Get all courses (with search/filter/pagination)
router.get('/', getAllCourses);

// @route   GET /courses/:id
// @desc    Get a single course by ID
router.get('/:id', getCourseById);

// @route   PUT /courses/:id
// @desc    Update a course by ID
router.put('/:id', updateCourse);

// @route   DELETE /courses/:id
// @desc    Delete a course by ID
router.delete('/:id', deleteCourse);

module.exports = router;
