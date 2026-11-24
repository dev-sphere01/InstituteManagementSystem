const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', 'config', 'config.env') });

const CountryStateCity = require('../models/countryStateCity');

const india = {
  countryName: 'India',
  phoneCode: 91,
  region: 'Asia',
  nationality: 'Indian',
  states: [
    { stateName: 'Andhra Pradesh', cityNames: ['Visakhapatnam', 'Vijayawada', 'Guntur'] },
    { stateName: 'Arunachal Pradesh', cityNames: ['Itanagar', 'Tawang', 'Naharlagun'] },
    { stateName: 'Assam', cityNames: ['Guwahati', 'Silchar', 'Dibrugarh'] },
    { stateName: 'Bihar', cityNames: ['Patna', 'Gaya', 'Bhagalpur'] },
    { stateName: 'Chhattisgarh', cityNames: ['Raipur', 'Bhilai', 'Bilaspur'] },
    { stateName: 'Goa', cityNames: ['Panaji', 'Margao', 'Vasco da Gama'] },
    { stateName: 'Gujarat', cityNames: ['Ahmedabad', 'Surat', 'Vadodara'] },
    { stateName: 'Haryana', cityNames: ['Gurugram', 'Faridabad', 'Panipat'] },
    { stateName: 'Himachal Pradesh', cityNames: ['Shimla', 'Dharamshala', 'Solan'] },
    { stateName: 'Jharkhand', cityNames: ['Ranchi', 'Jamshedpur', 'Dhanbad'] },
    { stateName: 'Karnataka', cityNames: ['Bengaluru', 'Mysuru', 'Mangaluru'] },
    { stateName: 'Kerala', cityNames: ['Thiruvananthapuram', 'Kochi', 'Kozhikode'] },
    { stateName: 'Madhya Pradesh', cityNames: ['Bhopal', 'Indore', 'Jabalpur'] },
    { stateName: 'Maharashtra', cityNames: ['Mumbai', 'Pune', 'Nagpur'] },
    { stateName: 'Manipur', cityNames: ['Imphal', 'Thoubal', 'Churachandpur'] },
    { stateName: 'Meghalaya', cityNames: ['Shillong', 'Tura', 'Jowai'] },
    { stateName: 'Mizoram', cityNames: ['Aizawl', 'Lunglei', 'Saiha'] },
    { stateName: 'Nagaland', cityNames: ['Kohima', 'Dimapur', 'Mokokchung'] },
    { stateName: 'Odisha', cityNames: ['Bhubaneswar', 'Cuttack', 'Rourkela'] },
    { stateName: 'Punjab', cityNames: ['Ludhiana', 'Amritsar', 'Jalandhar'] },
    { stateName: 'Rajasthan', cityNames: ['Jaipur', 'Jodhpur', 'Udaipur'] },
    { stateName: 'Sikkim', cityNames: ['Gangtok', 'Namchi', 'Gyalshing'] },
    { stateName: 'Tamil Nadu', cityNames: ['Chennai', 'Coimbatore', 'Madurai'] },
    { stateName: 'Telangana', cityNames: ['Hyderabad', 'Warangal', 'Nizamabad'] },
    { stateName: 'Tripura', cityNames: ['Agartala', 'Udaipur', 'Dharmanagar'] },
    { stateName: 'Uttar Pradesh', cityNames: [
      'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh',
      'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti',
      'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah',
      'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar (Noida)', 'Ghaziabad',
      'Ghazipur', 'Gonda', 'Gorakhpur', 'Greater Noida', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras',
      'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj',
      'Kaushambi', 'Kushinagar', 'Lakhimpur Kheri', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba',
      'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit',
      'Pratapgarh', 'Prayagraj (Allahabad)', 'Rae Bareli', 'Rampur', 'Saharanpur', 'Sambhal',
      'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur',
      'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
    ] },
    { stateName: 'Uttarakhand', cityNames: ['Dehradun', 'Haridwar', 'Haldwani'] },
    { stateName: 'West Bengal', cityNames: ['Kolkata', 'Howrah', 'Siliguri'] },
    { stateName: 'Andaman and Nicobar Islands', cityNames: ['Port Blair'] },
    { stateName: 'Chandigarh', cityNames: ['Chandigarh'] },
    { stateName: 'Dadra and Nagar Haveli and Daman and Diu', cityNames: ['Daman', 'Silvassa'] },
    { stateName: 'Delhi', cityNames: ['New Delhi', 'Delhi'] },
    { stateName: 'Jammu and Kashmir', cityNames: ['Srinagar', 'Jammu'] },
    { stateName: 'Ladakh', cityNames: ['Leh', 'Kargil'] },
    { stateName: 'Lakshadweep', cityNames: ['Kavaratti'] },
    { stateName: 'Puducherry', cityNames: ['Puducherry', 'Karaikal'] }
  ]
};

const run = async () => {
  try {
    const localUri = process.env.DB_URI_LOCAL || 'mongodb://localhost:27017/IMS';
    await mongoose.connect(localUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const existing = await CountryStateCity.findOne({ countryName: india.countryName });
    if (existing) {
      existing.phoneCode = india.phoneCode;
      existing.region = india.region;
      existing.nationality = india.nationality;
      existing.states = india.states;
      await existing.save();
      console.log('Updated India states/cities (local)');
    } else {
      await CountryStateCity.create(india);
      console.log('Inserted India states/cities (local)');
    }

    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

run();
