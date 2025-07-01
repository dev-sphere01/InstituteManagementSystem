const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const logRoutes = require('./logRoutes');
const roleRoutes = require('./roleRoutes');
const enquiryRoutes = require('./enquiryRoutes');
const admissionRoutes = require('./admissionRoutes');
const centreCodeRoutes = require('./centreCodeRoutes');
const boardsRoutes = require('./boardsRoutes');
const universityRoutes = require('./universityRoutes');
const batchRoutes = require('./batchRoutes');
const goalsRoutes = require('./goalsRoutes');
const stateAndCityRoutes = require('./stateAndCitiesRoutes');
const sessionRoutes = require('./sessionRoutes');
const coursesRoutes  = require('./coursesRoutes')
const additionalThingsRoutes = require('./additionalThingsRoute');

// Mount routes
router.use('/users', userRoutes);
router.use('/logs', logRoutes);
router.use('/roles', roleRoutes);
router.use('/enquiry', enquiryRoutes);
router.use('/admissions', admissionRoutes);
router.use('/centre-codes', centreCodeRoutes);
router.use('/boards', boardsRoutes);
router.use('/universities', universityRoutes);
router.use('/batches', batchRoutes);
router.use('/goals', goalsRoutes);
router.use('/state-and-city', stateAndCityRoutes);
router.use('/sessions', sessionRoutes);
router.use('/courses', coursesRoutes);
router.use('/additional-things', additionalThingsRoutes);

module.exports = router;
