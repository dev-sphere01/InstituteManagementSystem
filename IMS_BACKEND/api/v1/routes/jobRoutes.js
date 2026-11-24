const express = require('express');
const router = express.Router();

const { isAuthenticatedUser } = require('../../../middlewares/auth');
const { runEscalations, runOverdueCheck } = require('../../../controllers/jobController');

router.use(isAuthenticatedUser);

router.post('/escalations', runEscalations);
router.post('/check-overdue', runOverdueCheck);

module.exports = router;
