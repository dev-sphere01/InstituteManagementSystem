const express = require('express');
const router = express.Router();
const goalsController = require('../../../controllers/goalsController');

// Create Goal
router.post('/', goalsController.createGoal);

// Get All Goals
router.get('/', goalsController.getAllGoals);

// Get Single Goal
router.get('/:id', goalsController.getGoalById);

// Update Goal
router.put('/:id', goalsController.updateGoal);

// Delete Goal
router.delete('/:id', goalsController.deleteGoal);

module.exports = router;
