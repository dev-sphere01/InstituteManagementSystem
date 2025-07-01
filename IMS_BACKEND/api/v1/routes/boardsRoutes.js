const express = require('express');
const router = express.Router();
const boardsController = require('../../../controllers/boardsController');

// Create Board
router.post('/', boardsController.createBoard);

// Get All Boards
router.get('/', boardsController.getAllBoards);

// Get Single Board
router.get('/:id', boardsController.getBoardById);

// Update Board
router.put('/:id', boardsController.updateBoard);

// Delete Board
router.delete('/:id', boardsController.deleteBoard);

module.exports = router;
