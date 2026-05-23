const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../../../middlewares/auth');
const {
  getTemplates,
  getTemplateById,
  getDefaultTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  setDefaultTemplate
} = require('../../../controllers/callingFormController');

router.use(isAuthenticatedUser);

router.get('/', getTemplates);
router.get('/default', getDefaultTemplate);
router.get('/:id', getTemplateById);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
router.patch('/:id/set-default', setDefaultTemplate);

module.exports = router;
