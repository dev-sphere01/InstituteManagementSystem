const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const AdmissionDetails = require('../models/admission');
const ApplicationFinance = require('../models/applicationFinance');
const Installment = require('../models/installment');

// Load env
dotenv.config({ path: path.join(__dirname, '..', 'config', 'config.env') });

const DB = process.env.NODE_ENV === 'production' ? process.env.DB_URI : process.env.DB_URI_LOCAL || process.env.DB_URI;

const students = [
  {
    formNo: 'F-ADM-0001',
    centerCode: 'C-001',
    employeeId: 'E-001',
    otherInfo: 'Seeded record',
    generatedRegNo: 'R-APR-2026-0001',
    fullName: 'Aarav Sharma',
    dob: new Date('2004-08-12'),
    gender: 'Male',
    category: 'GEN',
    aadharNo: '123456789012',
    religion: 'Hindu',
    contactNumber: '9876543210',
    alternateContactNumber: '9876543211',
    emailAddress: 'aarav.sharma@example.com',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    address: 'Hazratganj, Lucknow',
    pinCode: '226001',
    fathersName: 'Rajesh Sharma',
    mothersName: 'Meena Sharma',
    highestEducationalQualification: '12th',
    boardOrUniversity: 'CBSE',
    yearOfPassing: 2022,
    courseApplied: 'BBA',
    subjectsStudied: ['Business Studies', 'Economics', 'English'],
    preferredModeOfLearning: 'offline',
    month: 'April'
  },
  {
    formNo: 'F-ADM-0002',
    centerCode: 'C-001',
    employeeId: 'E-002',
    otherInfo: 'Seeded record',
    generatedRegNo: 'R-APR-2026-0002',
    fullName: 'Isha Verma',
    dob: new Date('2005-02-18'),
    gender: 'Female',
    category: 'OBC',
    aadharNo: '234567890123',
    religion: 'Hindu',
    contactNumber: '9876501234',
    alternateContactNumber: '9876501235',
    emailAddress: 'isha.verma@example.com',
    state: 'Maharashtra',
    district: 'Pune',
    address: 'Kothrud, Pune',
    pinCode: '411038',
    fathersName: 'Amit Verma',
    mothersName: 'Neha Verma',
    highestEducationalQualification: '12th',
    boardOrUniversity: 'State Board',
    yearOfPassing: 2023,
    courseApplied: 'BCA',
    subjectsStudied: ['Mathematics', 'Computer Science', 'English'],
    preferredModeOfLearning: 'online',
    month: 'April'
  },
  {
    formNo: 'F-ADM-0003',
    centerCode: 'C-002',
    employeeId: 'E-003',
    otherInfo: 'Seeded record',
    generatedRegNo: 'R-APR-2026-0003',
    fullName: 'Kabir Singh',
    dob: new Date('2004-11-05'),
    gender: 'Male',
    category: 'SC',
    aadharNo: '345678901234',
    religion: 'Sikh',
    contactNumber: '9876512345',
    alternateContactNumber: '9876512346',
    emailAddress: 'kabir.singh@example.com',
    state: 'Punjab',
    district: 'Ludhiana',
    address: 'Model Town, Ludhiana',
    pinCode: '141002',
    fathersName: 'Gurpreet Singh',
    mothersName: 'Harpreet Singh',
    highestEducationalQualification: '12th',
    boardOrUniversity: 'PSEB',
    yearOfPassing: 2022,
    courseApplied: 'BCom',
    subjectsStudied: ['Accounts', 'Business Studies', 'English'],
    preferredModeOfLearning: 'offline',
    month: 'April'
  }
];

const seedAdmissions = async () => {
  const created = [];
  for (const student of students) {
    const admission = await AdmissionDetails.findOneAndUpdate(
      { formNo: student.formNo },
      { ...student },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    created.push(admission);
  }
  return created;
};

const seedFinance = async (admissions) => {
  for (const admission of admissions) {
    const finance = await ApplicationFinance.findOneAndUpdate(
      { targetType: 'admission', targetId: admission._id },
      { targetType: 'admission', targetId: admission._id, totalFee: 15000, totalPaid: 0, currency: 'INR' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const installments = [
      { installmentNo: 1, amount: 5000, dueDate: new Date('2026-04-10') },
      { installmentNo: 2, amount: 5000, dueDate: new Date('2026-04-20') },
      { installmentNo: 3, amount: 5000, dueDate: new Date('2026-05-05') }
    ];

    await Installment.deleteMany({ financeId: finance._id });
    await Installment.insertMany(installments.map((inst) => ({
      financeId: finance._id,
      ...inst,
      paidAmount: 0,
      status: 'Pending'
    })));
  }
};

const run = async () => {
  if (!DB) {
    console.error('Missing DB connection string. Set DB_URI_LOCAL or DB_URI in config.env');
    process.exit(1);
  }

  await mongoose.connect(DB);
  const admissions = await seedAdmissions();
  await seedFinance(admissions);
  console.log('Admissions and finance seeded successfully.');
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
