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
const additionalFeaturesRoutes = require('./additionalFeaturesRoute');
const emailVerificationRoutes = require('./emailVerificationRoutes');
const studentRoutes = require('./studentRoutes');
const callingFormRoutes = require('./callingFormRoutes');
const formDataRoutes = require('./formDataRoutes');
const workflowTemplateRoutes = require('./workflowTemplateRoutes');
const workflowRoutes = require('./workflowRoutes');
const taskRoutes = require('./taskRoutes');
const feeRoutes = require('./feeRoutes');
const jobRoutes = require('./jobRoutes');
const documentMasterRoutes = require('./documentMasterRoutes');
//const otpRoutes = require('./otpRoutes');
// Mount routes
router.use('/users', userRoutes);
router.use('/logs', logRoutes);
router.use('/roles', roleRoutes);
router.use('/enquiry', enquiryRoutes);
router.use('/admissions', admissionRoutes);
router.use('/email', emailVerificationRoutes);
router.use('/centre-codes', centreCodeRoutes);
router.use('/boards', boardsRoutes);
router.use('/universities', universityRoutes);
router.use('/batches', batchRoutes);
router.use('/goals', goalsRoutes);
router.use('/country-state-city', stateAndCityRoutes);
router.use('/sessions', sessionRoutes);
router.use('/courses', coursesRoutes);
router.use('/additional-Features', additionalFeaturesRoutes);
router.use('/students', studentRoutes);
router.use('/calling-forms', callingFormRoutes);
router.use('/form-data', formDataRoutes);
router.use('/workflow-templates', workflowTemplateRoutes);
router.use('/workflows', workflowRoutes);
router.use('/tasks', taskRoutes);
router.use('/fees', feeRoutes);
router.use('/jobs', jobRoutes);
router.use('/document-master', documentMasterRoutes);


module.exports = router;
