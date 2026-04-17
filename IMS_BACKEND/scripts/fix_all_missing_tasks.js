const mongoose = require('mongoose');
require('dotenv').config({ path: 'config/config.env' });
const AdmissionDetails = require('../models/admission');
const { createLifecycleForAdmission } = require('../services/studentWorkflowService');

const fix = async () => {
  try {
    const dbUri = process.env.DB_URI_LOCAL || process.env.DB_URI;
    await mongoose.connect(dbUri);
    console.log('Connected to DB');

    const admissions = await AdmissionDetails.find({});
    console.log(`Found ${admissions.length} admissions.`);

    let createdCount = 0;
    for (const admission of admissions) {
      const result = await createLifecycleForAdmission({ admission, userId: null });
      if (result.created) createdCount++;
    }

    console.log(`Created tasks for ${createdCount} admissions that were missing them.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fix();
