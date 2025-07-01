const Goal = require('../models/goals');
const ErrorHandler = require('../utils/ErrorHandler');

// Create Goal
exports.createGoal = async (req, res, next) => {
  try {
    const goal = await Goal.create(req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// Get All Goals
exports.getAllGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find();
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

// Get Single Goal
exports.getGoalById = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return next(new ErrorHandler('Goal not found', 404));
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// Update Goal
exports.updateGoal = async (req, res, next) => {
  try {
    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedGoal) return next(new ErrorHandler('Goal not found', 404));
    res.status(200).json({ success: true, data: updatedGoal });
  } catch (error) {
    next(error);
  }
};

// Delete Goal
exports.deleteGoal = async (req, res, next) => {
  try {
    const deleted = await Goal.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler('Goal not found', 404));
    res.status(204).json({ success: true, message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
