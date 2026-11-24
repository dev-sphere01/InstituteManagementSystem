const express = require('express');
const router = express.Router();

const { isAuthenticatedUser } = require('../../../middlewares/auth');
const { requirePermission } = require('../../../middlewares/permission');
const { getDashboardStats } = require('../../../controllers/dashboardController');

// Get dashboard stats
router.get('/stats', isAuthenticatedUser, requirePermission('dashboard.read'), getDashboardStats);

module.exports = router;
