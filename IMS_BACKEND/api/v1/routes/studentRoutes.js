const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../../../middlewares/auth');
const { requireModulePermission } = require('../../../middlewares/permission');
const { getAllStudents, getStudentProfile, updateDocumentStatus } = require('./../../../controllers/studentController');

router.use(isAuthenticatedUser);

router.get('/', requireModulePermission('student', 'view'), getAllStudents);
router.get('/:id', requireModulePermission('student', 'view'), getStudentProfile);
router.put('/:id/documents', requireModulePermission('student', 'edit'), updateDocumentStatus);

module.exports = router;
