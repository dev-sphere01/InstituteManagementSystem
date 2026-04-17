const express = require('express');
const router = express.Router();

const { isAuthenticatedUser } = require('../../../middlewares/auth');
const { runEscalations } = require('../../../controllers/jobController');

router.use(isAuthenticatedUser);

router.post('/escalations', runEscalations);

module.exports = router;
