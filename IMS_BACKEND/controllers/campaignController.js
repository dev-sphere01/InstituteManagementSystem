const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const campaignService = require('../services/campaignService');

exports.createCampaign = catchAsyncErrors(async (req, res) => {
  const campaign = await campaignService.createCampaign(req.body, req.user._id);
  res.status(201).json({ success: true, data: campaign });
});

exports.getCampaigns = catchAsyncErrors(async (req, res) => {
  const campaigns = await campaignService.getCampaigns(req.query);
  res.status(200).json({ success: true, data: campaigns });
});

exports.getCampaignById = catchAsyncErrors(async (req, res) => {
  const campaign = await campaignService.getCampaignById(req.params.id);
  res.status(200).json({ success: true, data: campaign });
});

exports.updateCampaign = catchAsyncErrors(async (req, res) => {
  const campaign = await campaignService.updateCampaign(req.params.id, req.body);
  res.status(200).json({ success: true, data: campaign });
});

exports.deleteCampaign = catchAsyncErrors(async (req, res) => {
  await campaignService.deleteCampaign(req.params.id);
  res.status(200).json({ success: true, message: 'Campaign deleted' });
});

exports.getCampaignROI = catchAsyncErrors(async (req, res) => {
  const data = await campaignService.getCampaignROI(req.query);
  res.status(200).json({ success: true, data });
});

exports.getOverallROI = catchAsyncErrors(async (req, res) => {
  const data = await campaignService.getOverallROI();
  res.status(200).json({ success: true, data });
});
