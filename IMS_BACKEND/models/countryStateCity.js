const mongoose = require('mongoose');

const countryStateCitySchema = new mongoose.Schema(
  {
    countryName: {
      type: String,
      required: [true, 'Country name is required'],
      trim: true,
      maxlength: 100,
    },
    phoneCode:{
      type:Number,
      required:[true,'Phone Code is requied']
    },
    region:{
      type:String,
      required:[true,'Region is requied'],
      maxlength: 100,
    },
    nationality:{
      type:String,
      required:[true,'Nationality is requied'],
      maxlength: 100,
    },

    // Each country has an array of states
    states: [
      {
        stateName: {
          type: String,
          required: [true, 'State name is required'],
          trim: true,
          maxlength: 100,
        },
        cityNames: [
          {
            type: String,
            required: [true, 'City name is required'],
            trim: true,
            maxlength: 100,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Optional index for faster country lookups
countryStateCitySchema.index({ countryName: 1 });

module.exports = mongoose.model(
  'countryStateCity',
  countryStateCitySchema
);
