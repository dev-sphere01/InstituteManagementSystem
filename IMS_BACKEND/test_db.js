const mongoose = require('mongoose');
require('dotenv').config({ path: 'config/config.env' });
const Task = require('./models/task');
const User = require('./models/userModel');

const test = async () => {
  try {
    await mongoose.connect(process.env.DB_URI_LOCAL);
    console.log('Connected to DB');

    const tasks = await Task.find({ taskName: 'Fee Collection', isCurrent: true });
    console.log('Tasks with isCurrent=true count:', tasks.length);
    
    // Check old tasks
    const oldTasks = await Task.find({ taskName: 'Fee Collection', isCurrent: { $exists: false } });
    console.log('Tasks with no isCurrent count:', oldTasks.length);

    // Let's also check an admin user
    const admin = await User.findOne({}).populate('role');
    if (admin) {
       console.log('First user role:', admin.role?.RoleName);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};
test();
