const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../../../middlewares/auth');
const {
  createCampaign, getCampaigns, getCampaignById,
  updateCampaign, deleteCampaign, getCampaignROI, getOverallROI
} = require('../../../controllers/campaignController');

router.use(isAuthenticatedUser);

router.get('/roi/overall', getOverallROI);
router.get('/roi', getCampaignROI);
router.get('/', getCampaigns);
router.post('/', createCampaign);
router.get('/:id', getCampaignById);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

module.exports = router;
