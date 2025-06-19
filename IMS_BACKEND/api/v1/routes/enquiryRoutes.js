const express = require('express');
const router = express.Router();
const enquiryController = require('../../../controllers/enquirycontroller');
const { validateEnquiry } = require('../../../middlewares/validateEnquiry');

router.post('/', validateEnquiry, enquiryController.createEnquiry);
router.get('/', enquiryController.getAllEnquiries);
router.get('/:id', enquiryController.getEnquiryById);
router.delete('/:id', enquiryController.deleteEnquiry);

module.exports = router;
