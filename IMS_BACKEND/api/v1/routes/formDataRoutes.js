const express = require('express');
const router = express.Router();
const { submitPublicForm } = require('../../../controllers/formDataController');

router.post('/public/submit', submitPublicForm);

module.exports = router;
