const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const logRoutes = require('./logRoutes');
const roleRoutes = require('./roleRoutes');
const enquiryRoutes = require("./enquiryRoutes");

// Mount routes
router.use('/users', userRoutes);
router.use('/logs', logRoutes);
router.use('/roles', roleRoutes);
router.use("/enquiries", enquiryRoutes);

module.exports = router;
