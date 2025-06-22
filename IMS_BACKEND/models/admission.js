const mongoose = require('mongoose');

const admissionDetailsSchema = new mongoose.Schema({
  // Basic Info
  timestamp: { type: Date, default: Date.now },
  formNo: { type: String, required: true }, // F + Branch + Unique Number
  centerCode: { type: String, required: true },
  employeeId: { type: String, required: true }, // E + Branch + Unique Number
  otherInfo: { type: String },
  generatedRegNo: { type: String, required: true }, // R + Branch + Month + Year + ID
  fullName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  category: { type: String, required: true },
  aadharNo: { type: String, required: true },
  religion: { type: String, required: true },

  // Documents
  aadharPhoto: { type: String }, // URL or base64 string
  candidatePhoto: { type: String },
  candidateSignature: { type: String },
  candidateLeftThumbImpression: { type: String },
  apaarId: { type: String },
  tenthMarksheet: { type: String },
  twelfthMarksheet: { type: String },
  exServicemen: { type: String },
  speciallyAbled: { type: String },
  speciallyAbledOther: { type: String },

  // Contact Details
  contactNumber: { type: String, required: true },
  alternateContactNumber: { type: String },
  emailAddress: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  address: { type: String, required: true },
  pinCode: { type: String, required: true },
  fathersName: { type: String, required: true },
  fathersOccupation: { type: String, required: true },
  fathersJobRole: { type: String },
  departmentOrCompany: { type: String },
  mothersName: { type: String, required: true },
  guardianName: { type: String },
  guardianRelation: { type: String },
  guardianContactNumber: { type: String },

  // Education & Course
  highestEducationalQualification: { type: String, required: true },
  boardOrUniversity: { type: String, required: true },
  yearOfPassing: { type: String, required: true },
  subjectsStudied: { type: String, required: true },
  courseApplied: { type: String, required: true },
  preferredModeOfLearning: { type: String, required: true },

  // Course Options
  tShirt: { type: Boolean, default: false },
  itTools: { type: Boolean, default: false },
  webDesigning: { type: Boolean, default: false },
  tally: { type: Boolean, default: false },
  gfxDtp: { type: Boolean, default: false },
  python: { type: Boolean, default: false },
  iot: { type: Boolean, default: false },

  // Referral Information
  referralSource: { type: String },
  referralSourceOther: { type: String },
  referalName: { type: String },

  // Computer Access
  computerAccess: { type: String },
  computerAccessOther: { type: String },


  // Status and Registration
  status: { type: String, default: 'Pending' },
  regNo: { type: String, required: true },
  month: { type: String, required: true },

  // Monthly fee tracking (if needed)
  january: { type: Number, default: 0 },
  february: { type: Number, default: 0 },
  march: { type: Number, default: 0 },
  april: { type: Number, default: 0 },
  may: { type: Number, default: 0 },
  june: { type: Number, default: 0 },
  july: { type: Number, default: 0 },
  august: { type: Number, default: 0 },
  september: { type: Number, default: 0 },
  october: { type: Number, default: 0 },
  november: { type: Number, default: 0 },
  december: { type: Number, default: 0 }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('AdmissionDetails', admissionDetailsSchema);
