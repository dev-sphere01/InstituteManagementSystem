const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../../../middlewares/auth');
const { requireModulePermission } = require('../../../middlewares/permission');
const { 
  getAllStudents, 
  getStudentProfile, 
  updateDocumentStatus, 
  updateStudentProfile,
  changeStudentStatus,
  changeStudentBatch,
  getStudentHistory
} = require('./../../../controllers/studentController');

router.use(isAuthenticatedUser);

router.get('/', requireModulePermission('student', 'view'), getAllStudents);
router.get('/:id', requireModulePermission('student', 'view'), getStudentProfile);
router.get('/:id/history', requireModulePermission('student', 'view'), getStudentHistory);
router.put('/:id', requireModulePermission('student', 'edit'), updateStudentProfile);
router.put('/:id/documents', requireModulePermission('student', 'edit'), updateDocumentStatus);
router.post('/:id/status', requireModulePermission('student', 'edit'), changeStudentStatus);
router.post('/:id/batch', requireModulePermission('student', 'edit'), changeStudentBatch);


module.exports = router;
