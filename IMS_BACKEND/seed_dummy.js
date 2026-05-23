const mongoose = require('mongoose');
require('dotenv').config({ path: 'config/config.env' });
const AdmissionDetails = require('./models/admission');
const { createLifecycleForAdmission } = require('./services/studentWorkflowService');

const seed = async () => {
  try {
    await mongoose.connect(process.env.DB_URI_LOCAL);
    console.log('Connected to DB');

    const dummyStudents = [
      {
        formNo: 'F1001' + Math.floor(Math.random() * 1000),
        centerCode: 'C1',
        employeeId: 'E1001',
        generatedRegNo: 'R1001' + Math.floor(Math.random() * 1000),
        fullName: 'Rahul Sharma',
        dob: new Date('2000-01-01'),
        gender: 'Male',
        category: 'GEN',
        aadharNo: '123456789012',
        religion: 'Hindu',
        contactNumber: '9999999999',
        state: 'Delhi',
        district: 'New Delhi',
        address: '123 Test Street',
        pinCode: '110001',
        fathersName: 'Raj Sharma',
        mothersName: 'Sita Sharma',
        highestEducationalQualification: '12th',
        boardOrUniversity: 'CBSE',
        yearOfPassing: 2018,
        courseApplied: 'Computer Science',
        subjectsStudied: ['PCM'],
        preferredModeOfLearning: 'offline',
        month: 'April',
        studentStatus: 'Admitted',
        isCompleted: true
      },
      {
        formNo: 'F1002' + Math.floor(Math.random() * 1000),
        centerCode: 'C1',
        employeeId: 'E1001',
        generatedRegNo: 'R1002' + Math.floor(Math.random() * 1000),
        fullName: 'Priya Patel',
        dob: new Date('2001-05-15'),
        gender: 'Female',
        category: 'OBC',
        aadharNo: '987654321098',
        religion: 'Hindu',
        contactNumber: '8888888888',
        state: 'Gujarat',
        district: 'Ahmedabad',
        address: '456 Sample Rd',
        pinCode: '380001',
        fathersName: 'Anil Patel',
        mothersName: 'Geeta Patel',
        highestEducationalQualification: '12th',
        boardOrUniversity: 'GSEB',
        yearOfPassing: 2019,
        courseApplied: 'Web Development',
        subjectsStudied: ['Commerce'],
        preferredModeOfLearning: 'online',
        month: 'April',
        studentStatus: 'Admitted',
        isCompleted: true
      },
      {
        formNo: 'F1003' + Math.floor(Math.random() * 1000),
        centerCode: 'C2',
        employeeId: 'E1002',
        generatedRegNo: 'R1003' + Math.floor(Math.random() * 1000),
        fullName: 'Arjun Singh',
        dob: new Date('1999-11-20'),
        gender: 'Male',
        category: 'SC',
        aadharNo: '111122223333',
        religion: 'Hindu',
        contactNumber: '7777777777',
        state: 'Punjab',
        district: 'Amritsar',
        address: '789 Heritage St',
        pinCode: '143001',
        fathersName: 'Balwant Singh',
        mothersName: 'Kaur Singh',
        highestEducationalQualification: 'Graduate',
        boardOrUniversity: 'PU',
        yearOfPassing: 2021,
        courseApplied: 'Data Analytics',
        subjectsStudied: ['Maths'],
        preferredModeOfLearning: 'online',
        month: 'April',
        studentStatus: 'Admitted',
        isCompleted: true
      }
    ];

    for (const studentData of dummyStudents) {
      const admission = new AdmissionDetails(studentData);
      await admission.save();
      
      // Auto-create workflow tasks via service
      await createLifecycleForAdmission({ admission, userId: null });
      console.log(`Created student ${admission.fullName} and generated workflow tasks.`);
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
