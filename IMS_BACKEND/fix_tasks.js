const mongoose = require('mongoose');
const Task = require('./models/task');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log("Connected to DB. Fixing legacy tasks...");
  try {
    const result = await Task.updateMany(
      { taskName: 'Fee Collection', status: { $ne: 'completed' }, isCurrent: { $ne: true } },
      { $set: { isCurrent: true } }
    );
    console.log(`Updated ${result.modifiedCount} legacy Fee Collection tasks to isCurrent: true`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}).catch(err => {
  console.error(err);
});
