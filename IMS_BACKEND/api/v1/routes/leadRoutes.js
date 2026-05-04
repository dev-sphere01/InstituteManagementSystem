const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuthenticatedUser } = require('../../../middlewares/auth');
const {
  createLead, getLeads, getLeadById, updateLead, deleteLead,
  addInteraction, reassignLead, bulkImport, getPipelineStats, runEscalationCheck
} = require('../../../controllers/leadController');

const upload = multer({ storage: multer.memoryStorage() });

router.use(isAuthenticatedUser);

router.get('/stats/pipeline', getPipelineStats);
router.post('/escalation/run', runEscalationCheck);
router.post('/import', upload.single('file'), bulkImport);

router.get('/', getLeads);
router.post('/', createLead);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/interactions', addInteraction);
router.put('/:id/reassign', reassignLead);

module.exports = router;
