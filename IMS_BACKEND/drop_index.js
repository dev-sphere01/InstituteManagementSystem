const mongoose = require('mongoose');
require('dotenv').config({ path: 'config/config.env' });
const Task = require('./models/task');
mongoose.connect(process.env.DB_URI_LOCAL).then(async ()=>{ 
  try {
    const indexes = await mongoose.connection.db.collection('tasks').indexes();
    console.log('Indexes:', indexes);
    // drop all except _id
    for(let idx of indexes) {
      if(idx.name !== '_id_') {
         await mongoose.connection.db.collection('tasks').dropIndex(idx.name);
         console.log('Dropped:', idx.name);
      }
    }
  } catch(e) {
    console.log(e.message);
  }
  process.exit(0); 
});
