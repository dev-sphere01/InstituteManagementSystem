const express = require('express');
const router = express.Router();
const {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch
} = require('./../../../controllers/branchController');

// @desc    Create a new branch
// @route   POST /api/v1/branches
router.post('/', createBranch);

// @desc    Get all branches
// @route   GET /api/v1/branches
router.get('/', getAllBranches);

// @desc    Get branch by ID
// @route   GET /api/v1/branches/:id
router.get('/:id', getBranchById);

// @desc    Update branch
// @route   PUT /api/v1/branches/:id
router.put('/:id', updateBranch);

// @desc    Delete branch
// @route   DELETE /api/v1/branches/:id
router.delete('/:id', deleteBranch);

module.exports = router;
