const mongoose = require('mongoose');

const stateAndCitySchema = new mongoose.Schema({
  stateName: {
    type: String,
    required: true,
    trim: true
  },
  cityNames: [{
    type: String,
    required: true,
    trim: true
  }]
}, {
  timestamps: true
});

const StateAndCity = mongoose.model('StateAndCity', stateAndCitySchema);
module.exports = StateAndCity;
