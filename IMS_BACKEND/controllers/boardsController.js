const Board = require('../models/boards');
const ErrorHandler = require('../utils/ErrorHandler');

// Create Board
exports.createBoard = async (req, res, next) => {
  try {
    const board = await Board.create(req.body);
    res.status(201).json({ success: true, data: board });
  } catch (error) {
    next(error);
  }
};

// Get All Boards
exports.getAllBoards = async (req, res, next) => {
  try {
    const boards = await Board.find();
    res.status(200).json({ success: true, data: boards });
  } catch (error) {
    next(error);
  }
};

// Get Single Board
exports.getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return next(new ErrorHandler('Board not found', 404));
    res.status(200).json({ success: true, data: board });
  } catch (error) {
    next(error);
  }
};

// Update Board
exports.updateBoard = async (req, res, next) => {
  try {
    const updatedBoard = await Board.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedBoard) return next(new ErrorHandler('Board not found', 404));
    res.status(200).json({ success: true, data: updatedBoard });
  } catch (error) {
    next(error);
  }
};

// Delete Board
exports.deleteBoard = async (req, res, next) => {
  try {
    const deleted = await Board.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler('Board not found', 404));
    res.status(204).json({ success: true, message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
