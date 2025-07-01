const express = require('express');
const router = express.Router();
const sessionsController = require('../../../controllers/sessionsController');

// Create a new session
router.post('/', sessionsController.createSession);

// Get all sessions
router.get('/', sessionsController.getSessions);

// Get a single session by ID
router.get('/:id', sessionsController.getSessionById);

// Update a session by ID
router.put('/:id', sessionsController.updateSession);

// Delete a session by ID
router.delete('/:id', sessionsController.deleteSession);

module.exports = router; 