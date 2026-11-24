const EmployeeType = require('../models/employeeType');

const defaultTypes = [
  { EmpTypeID: 1, EmpTypeName: 'Permanent', Description: 'Full-time regular staff' },
  { EmpTypeID: 2, EmpTypeName: 'Contract', Description: 'Fixed-term contract personnel' },
  { EmpTypeID: 3, EmpTypeName: 'Consultant', Description: 'External domain consultants and advisors' },
  { EmpTypeID: 4, EmpTypeName: 'Trainee/Intern', Description: 'Students and probationary trainees' },
  { EmpTypeID: 5, EmpTypeName: 'Part-Time', Description: 'Hourly or part-time staff' },
  { EmpTypeID: 6, EmpTypeName: 'Visiting Faculty', Description: 'Guest lecturers and visiting instructors' }
];

exports.getAllEmployeeTypes = async (req, res) => {
  try {
    let types = await EmployeeType.find({ isActive: true }).sort({ EmpTypeID: 1 }).lean();
    if (!types || types.length === 0) {
      await EmployeeType.insertMany(defaultTypes);
      types = await EmployeeType.find({ isActive: true }).sort({ EmpTypeID: 1 }).lean();
    }
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeTypeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const type = await EmployeeType.findOne({ EmpTypeID: id });
    if (!type) return res.status(404).json({ message: 'Employee type not found' });
    res.json(type);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEmployeeType = async (req, res) => {
  try {
    const { EmpTypeName, Description } = req.body;
    if (!EmpTypeName) {
      return res.status(400).json({ message: 'Employee type name is required' });
    }
    const maxItem = await EmployeeType.findOne().sort({ EmpTypeID: -1 }).lean();
    const nextId = (maxItem?.EmpTypeID || 0) + 1;

    const newType = new EmployeeType({
      EmpTypeID: nextId,
      EmpTypeName,
      Description: Description || ''
    });
    await newType.save();
    res.status(201).json(newType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEmployeeType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { EmpTypeName, Description } = req.body;
    const type = await EmployeeType.findOneAndUpdate(
      { EmpTypeID: id },
      { EmpTypeName, Description },
      { new: true }
    );
    if (!type) return res.status(404).json({ message: 'Employee type not found' });
    res.json(type);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEmployeeType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await EmployeeType.deleteOne({ EmpTypeID: id });
    res.json({ message: 'Employee type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
