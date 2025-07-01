const mongoose = require('mongoose');

const additionalThingSchema = new mongoose.Schema({
  additionalThings: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const AdditionalThing = mongoose.model('AdditionalThing', additionalThingSchema);
module.exports = AdditionalThing;
