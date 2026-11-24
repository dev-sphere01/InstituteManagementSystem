const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../../../controllers/departmentController');

router.route('/')
  .get(getAllDepartments)
  .post(createDepartment);

router.route('/:id')
  .put(updateDepartment)
  .delete(deleteDepartment);

module.exports = router;
