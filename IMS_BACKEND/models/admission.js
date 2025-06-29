const mongoose = require('mongoose');

const admissionDetailsSchema = new mongoose.Schema({
  // Basic Info
  timestamp: { type: Date, default: Date.now },//automatically created when submitted
  formNo: { type: String, required: true }, // combination of (F + Branch + Unique Number) 
  centerCode: { type: String, required: true },//alpha numeric allowed 
  employeeId: { type: String, required: true }, //combination of  (E + Branch + Unique Number)
  otherInfo: { type: String },//just a normal text
  generatedRegNo: { type: String, required: true }, //comination of ( R + Branch + Month + Year + ID)
  fullName: { type: String, required: true },//text data
  dob: { type: Date, required: true },//date format - dd/mm/yyyy
  gender: { type: String, required: true },//Male/Female/Others only
  category: { type: String, required: true },//GEN/ST/SC/OBC only
  aadharNo: { type: String, required: true },//max 16 digit numeric data only
  religion: { type: String, required: true },//text data

  // Contact Details
  contactNumber: { type: String, required: true },//requried 10 digit numeric data
  alternateContactNumber: { type: String },//optinal 10 digit numeric data
  emailAddress: { type: String, required: true },//email address data
  state: { type: String, required: true },//text data
  district: { type: String, required: true },//text data
  address: { type: String, required: true },//long text data
  pinCode: { type: String, required: true },//numeric data 
  fathersName: { type: String, required: true },//text data
  fathersOccupation: { type: String, required: true },//text data
  fathersJobRole: { type: String },//text data
  departmentOrCompany: { type: String },//text data
  mothersName: { type: String, required: true },//text data
  guardianName: { type: String },//text data
  guardianRelation: { type: String },//text data
  guardianContactNumber: { type: String },//optinal 10 digit numeric data

  // Documents
  aadharPhoto: { type: String }, // for now base64 , later url
  candidatePhoto: { type: String },// for now base64 , later url
  candidateSignature: { type: String },// for now base64 , later url
  candidateLeftThumbImpression: { type: String },// for now base64 , later url
  apaarId: { type: String },//text data
  tenthMarksheet: { type: String },// for now base64 , later url
  twelfthMarksheet: { type: String },// for now base64 , later url
  exServicemen: { type: Boolean, default: false },//only Yes or No
  speciallyAbled: { type: Boolean, default: false},//only Yes or No
  speciallyAbledOther: { type: String },//text data

  // Education & Course
  highestEducationalQualification: { type: String, required: true },//text data
  boardOrUniversity: { type: String, required: true },//text data
  yearOfPassing: { type: Number, required: true },//numeric data
  subjectsStudied: { type: String, required: true },//json but in string
  courseApplied: { type: String, required: true },//text data
  preferredModeOfLearning: { type: String, required: true },//either offline or online


  // ----Extras----------------------------------
  // Features Options
  tShirt: { type: Boolean, default: false },//yes or no
  itTools: { type: Boolean, default: false },//yes or no
  webDesigning: { type: Boolean, default: false },//yes or no
  tally: { type: Boolean, default: false },//yes or no
  gfxDtp: { type: Boolean, default: false },//yes or no
  python: { type: Boolean, default: false },//yes or no
  iot: { type: Boolean, default: false },//yes or no

  // Referral Information
  referralSource: { type: String },//text data
  referralSourceOther: { type: String },//text data
  referalName: { type: String },//text data

  // Computer Access
  computerAccess: { type: Boolean, default: false},//yes or no
  computerAccessOther: { type: String },//text data

  // Status and Registration
  status: { type: String, default: 'Pending' },
  regNo: { type: String, required: true },
  month: { type: String, required: true },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('AdmissionDetails', admissionDetailsSchema);
