// centreCode.model.js

const mongoose = require('mongoose');

const centreCodeSchema = new mongoose.Schema({
  centreCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  State: {
    type: String,
    required: true,
    trim: true
  },
  City: {
    type: String,
    required: true,
    trim: true
  },
  name:{
    type: String,
    required: true,
    trim: true
  },
  address:{
    type: String,
    unique: true,
    trim: true
  },
  phone:{
    type: Number,
    unique: true,
    trim: true
  },
  email:{
    type: String,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

const CentreCode = mongoose.model('CentreCode', centreCodeSchema);

module.exports = CentreCode;
