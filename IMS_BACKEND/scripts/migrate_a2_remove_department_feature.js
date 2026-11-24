/**
 * Migration script: Remove unused 'department' feature from AdditionalFeatures collection
 * Run: node scripts/migrate_a2_remove_department_feature.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

const AdditionalFeatures = require('../models/additionalFeatures');

async function migrate() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.DB_URI || 'mongodb://localhost:27017/ims';
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const result = await AdditionalFeatures.deleteMany({
      additionalFeatures: { $regex: /^department$/i }
    });

    console.log(`Deleted ${result.deletedCount} unused 'department' additional feature(s).`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
