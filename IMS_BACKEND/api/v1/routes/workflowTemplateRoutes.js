const express = require('express');
const router = express.Router();

const {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  setTemplateActive
} = require('../../../controllers/workflowTemplateController');

router.post('/', createTemplate);
router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.put('/:id', updateTemplate);
router.patch('/:id/active', setTemplateActive);

module.exports = router;
