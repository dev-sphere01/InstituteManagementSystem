const express = require('express');
const router = express.Router();
const {
  getAllEmployeeTypes,
  getEmployeeTypeById,
  createEmployeeType,
  updateEmployeeType,
  deleteEmployeeType
} = require('../../../controllers/employeeTypeController');

router.get('/', getAllEmployeeTypes);
router.get('/:id', getEmployeeTypeById);
router.post('/', createEmployeeType);
router.put('/:id', updateEmployeeType);
router.delete('/:id', deleteEmployeeType);

module.exports = router;
