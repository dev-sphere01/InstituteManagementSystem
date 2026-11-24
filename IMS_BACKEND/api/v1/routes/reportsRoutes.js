const express = require('express');
const router = express.Router();

// Import middlewares
const { isAuthenticatedUser } = require('../../../middlewares/auth');
const { authorizePermissions } = require('../../../middlewares/permission');

// Import controllers
const {
  getLeadsReport,
  getBranchesReport,
  getTasksReport,
  getFeesReport,
  getSalesCompetitionReport
} = require('../../../controllers/reportsController');

// All reports routes are protected
router.use(isAuthenticatedUser);

router.get('/leads', authorizePermissions('reports.read'), getLeadsReport);
router.get('/branches', authorizePermissions('reports.read'), getBranchesReport);
router.get('/tasks', authorizePermissions('reports.read'), getTasksReport);
router.get('/fees', authorizePermissions('reports.read'), getFeesReport);
router.get('/sales-competition', authorizePermissions('reports.read'), getSalesCompetitionReport);

module.exports = router;
