const express = require('express');
const router = express.Router();

const { isAuthenticatedUser } = require('../../../middlewares/auth');
const { requireModulePermission } = require('../../../middlewares/permission');
const {
  getFeeSummary,
  createFeePlan,
  addInstallments,
  payInstallment,
  directPay,
  setupFee,
  getFeePlan
} = require('../../../controllers/feeController');

router.use(isAuthenticatedUser);

router.get('/', requireModulePermission('fee', 'view'), getFeeSummary);
router.get('/plan/:targetId', getFeePlan);
router.post('/setup', setupFee);
router.post('/', requireModulePermission('fee', 'update'), createFeePlan);
router.post('/:financeId/installments', requireModulePermission('fee', 'update'), addInstallments);
router.patch('/installments/:id/pay', requireModulePermission('fee', 'update'), payInstallment);
router.post('/direct-pay', requireModulePermission('fee', 'update'), directPay);

module.exports = router;
