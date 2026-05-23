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
  aadharNo: { type: String, required: true },//12 digit numeric data
  religion: { type: String, required: true },//text data

  // Contact Details
  contactNumber: { type: String, required: true },//requried 10 digit numeric data
  alternateContactNumber: { type: String },//optional 10 digit numeric data
  emailAddress: { type: String },//optional email address text data
  state: { type: String, required: true },//text data
  district: { type: String, required: true },//text data
  address: { type: String, required: true },//long text data
  pinCode: { type: String, required: true },//max 6 digit numeric data 
  fathersName: { type: String, required: true },//text data
  fathersOccupation: { type: String },//optional text data
  fathersJobRole: { type: String },//optional text data
  fathersDepartmentOrCompany: { type: String },//optional text data
  mothersName: { type: String, required: true },//text data
  mothersOccupation: { type: String },//optional text data
  mothersJobRole: { type: String },//optional text data
  mothersDepartmentOrCompany: { type: String },//optional text data
  guardianName: { type: String },//optional text data
  guardianRelation: { type: String },//optional text data
  guardianContactNumber: { type: Number },//optinal 10 digit numeric data

  // Documents
  aadharPhoto: { type: String }, //   url , to be stored in root folder
  candidatePhoto: { type: String },//   url , to be stored in root folder
  candidateSignature: { type: String },// url , to be stored in root folder
  candidateLeftThumbImpression: { type: String },// for now base64 , later url
  apaarId: { type: Number },//12 digit optional numeric data
  tenthMarksheet: { type: String },// for now base64 , later url
  twelfthMarksheet: { type: String },// for now base64 , later url
  exServicemen: { type: String },//url , to be stored in root folder
  speciallyAbled: { type: String },//url , to be stored in root folder
  incomeCertificate: { type: String },//add income certificate url if EWS enabled

  // Education & Course
  highestEducationalQualification: { type: String, required: true },//text data
  boardOrUniversity: { type: String, required: true },//text data
  yearOfPassing: { type: Number, required: true },//numeric data
  courseApplied: { type: String, required: true },//text data  => Review this
  subjectsStudied: { type: [String], required: true },//array of subject names
  preferredModeOfLearning: { type: String, required: true },//either offline or online


  // ----Extras----------------------------------
  // Features Options //maintain masters first , passed in array
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
  computerAccess: { type: Boolean, default: false },//yes or no
  computerAccessOther: { type: String },//optional description text data

  // Status and Registration
  status: { type: String, default: 'Pending' },
  lifecycleStatus: {
    type: String,
    enum: ['Prospect', 'Applied', 'Admitted', 'Active', 'Inactive', 'Dropped', 'Completed'],
    default: 'Applied',
    index: true
  },
  // regNo: { type: String, required: true },//not sure about this one
  month: { type: String, required: true },

  //Track Step wise data and completed status
  currentStep: { type: String, default: 'basic' }, // values: 'basic', 'contact', 'education', 'extras', 'review', 'submitted'
  isCompleted: { type: Boolean, default: false }



}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('AdmissionDetails', admissionDetailsSchema);
