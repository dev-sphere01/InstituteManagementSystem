const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../../../middlewares/auth');
const {
  createDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument
} = require('../../../controllers/documentMasterController');

router.route('/')
  .get(isAuthenticatedUser, getAllDocuments)
  .post(isAuthenticatedUser, authorizeRoles('Admin', 'Superadmin'), createDocument);

router.route('/:id')
  .put(isAuthenticatedUser, authorizeRoles('Admin', 'Superadmin'), updateDocument)
  .delete(isAuthenticatedUser, authorizeRoles('Admin', 'Superadmin'), deleteDocument);

module.exports = router;
