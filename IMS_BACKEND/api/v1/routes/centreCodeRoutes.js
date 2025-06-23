const express = require('express');
const router = express.Router();
const centreCodeController = require('./../../../controllers/centreCodeController');
// const { validateCentreCode } = require('../../../middlewares/validateCentreCode'); // Optional validation middleware

router.post('/', /* validateCentreCode, */ centreCodeController.createCentreCode);
router.get('/', centreCodeController.getAllCentreCodes);
router.get('/:id', centreCodeController.getCentreCodeById);
router.put('/:id', centreCodeController.updateCentreCode);
router.delete('/:id', centreCodeController.deleteCentreCode);

module.exports = router;
