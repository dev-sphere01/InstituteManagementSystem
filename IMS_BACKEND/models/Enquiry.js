const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  registrationInfo: {
    // centerCode: { type: String, required: true },
    // employeeId: { type: String, required: true },
    otherInfo: { type: String }
  },
  personalInfo: {
    fullName: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    category: { type: String, enum: ['GEN', 'OBC', 'ST', 'SC', 'OTHER'] },
    exServicemen: { type: Boolean, default: false },
    speciallyAbled: { type: Boolean, default: false }
  },
  contactInfo: {
    contactNumber: { type: String, match: /^[6-9]\d{9}$/, required: true },
    alternateContactNumber: { type: String, match: /^[6-9]\d{9}$/ },
    email: { type: String, required: true },
    address: { type: String },
    pinCode: { type: String }
  },
  educationInfo: {
    qualification: { type: String },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    yearOfPassing: { type: Number },
    subjectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }]
  },
  coursePreferences: {
    interestedCourses: [{ type: String }],
    mode: { type: String, enum: ['online', 'offline'] },
    courseLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] }
  },
  schedulePreferences: {
    preferredBatchTime: { type: String }
  },
  referralInfo: {
    referralSource: { type: String, enum: ['friend', 'institution', 'other'] },
    sourceName: { type: String },
    referralCode: { type: String }
  },
  goalsRequirements: {
    courseGoal: { type: String },
    futureGoals: [{ type: String }],
    hasComputerAccess: { type: String, enum: ['yes', 'no'] }
  }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
