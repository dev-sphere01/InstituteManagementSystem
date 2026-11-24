const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    DeptID: {
      type: Number,
      index: true,
    },
    DeptName: {
      type: String,
      required: [true, 'Please provide department name'],
      trim: true,
      unique: true,
    },
    Description: {
      type: String,
      default: '',
      trim: true,
    },
    IsActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'departments',
  }
);

// Auto-increment DeptID before save if not present
departmentSchema.pre('save', async function (next) {
  if (!this.DeptID) {
    const count = await mongoose.model('Department').countDocuments();
    this.DeptID = count + 1;
  }
  next();
});

module.exports = mongoose.model('Department', departmentSchema);
