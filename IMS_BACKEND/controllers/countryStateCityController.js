const CountryStateCity = require('../models/countryStateCity');
const ErrorHandler = require('../utils/ErrorHandler');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ───────────── CREATE Country (with states & cities)
exports.createCountry = async (req, res, next) => {
  try {
    const country = await CountryStateCity.create(req.body);
    res.status(201).json({ success: true, data: country });
  } catch (err) {
    next(err);
  }
};

const defaultIndia = {
  countryName: 'India',
  phoneCode: 91,
  region: 'Asia',
  nationality: 'Indian',
  states: [
    { stateName: 'Andhra Pradesh', cityNames: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa'] },
    { stateName: 'Arunachal Pradesh', cityNames: ['Itanagar', 'Tawang', 'Naharlagun', 'Pasighat', 'Ziro', 'Bomdila'] },
    { stateName: 'Assam', cityNames: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'] },
    { stateName: 'Bihar', cityNames: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'] },
    { stateName: 'Chhattisgarh', cityNames: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur'] },
    { stateName: 'Goa', cityNames: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'] },
    { stateName: 'Gujarat', cityNames: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Navsari'] },
    { stateName: 'Haryana', cityNames: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'] },
    { stateName: 'Himachal Pradesh', cityNames: ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali', 'Bilaspur', 'Hamirpur'] },
    { stateName: 'Jharkhand', cityNames: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih'] },
    { stateName: 'Karnataka', cityNames: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Davangere', 'Ballari', 'Kalaburagi', 'Shivamogga'] },
    { stateName: 'Kerala', cityNames: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam'] },
    { stateName: 'Madhya Pradesh', cityNames: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'] },
    { stateName: 'Maharashtra', cityNames: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad', 'Navi Mumbai', 'Solapur', 'Kolhapur'] },
    { stateName: 'Manipur', cityNames: ['Imphal', 'Thoubal', 'Churachandpur', 'Bishnupur', 'Ukhrul'] },
    { stateName: 'Meghalaya', cityNames: ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Baghmara'] },
    { stateName: 'Mizoram', cityNames: ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib'] },
    { stateName: 'Nagaland', cityNames: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'] },
    { stateName: 'Odisha', cityNames: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak'] },
    { stateName: 'Punjab', cityNames: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot'] },
    { stateName: 'Rajasthan', cityNames: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar'] },
    { stateName: 'Sikkim', cityNames: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Singtam'] },
    { stateName: 'Tamil Nadu', cityNames: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukudi'] },
    { stateName: 'Telangana', cityNames: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda'] },
    { stateName: 'Tripura', cityNames: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia'] },
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
    { stateName: 'Uttarakhand', cityNames: ['Dehradun', 'Haridwar', 'Haldwani', 'Roorkee', 'Kashipur', 'Rishikesh', 'Rudrapur', 'Nainital'] },
    { stateName: 'West Bengal', cityNames: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol', 'Bardhaman', 'Malda', 'Kharagpur', 'Haldia'] },
    { stateName: 'Andaman and Nicobar Islands', cityNames: ['Port Blair'] },
    { stateName: 'Chandigarh', cityNames: ['Chandigarh'] },
    { stateName: 'Dadra and Nagar Haveli and Daman and Diu', cityNames: ['Daman', 'Diu', 'Silvassa'] },
    { stateName: 'Delhi', cityNames: ['New Delhi', 'Central Delhi', 'East Delhi', 'North Delhi', 'South Delhi', 'West Delhi', 'Delhi'] },
    { stateName: 'Jammu and Kashmir', cityNames: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Udhampur'] },
    { stateName: 'Ladakh', cityNames: ['Leh', 'Kargil'] },
    { stateName: 'Lakshadweep', cityNames: ['Kavaratti', 'Agatti', 'Andrott'] },
    { stateName: 'Puducherry', cityNames: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'] }
  ]
};

// ───────────── GET All Countries (supports filter if needed)
exports.getAllCountries = async (req, res, next) => {
  try {
    const { region, nationality } = req.query;
    const filter = {};
    if (region) filter.region = region;
    if (nationality) filter.nationality = nationality;

    let countries = await CountryStateCity.find(filter).sort({ countryName: 1 });
    if (!countries || countries.length === 0) {
      try {
        const seeded = await CountryStateCity.create(defaultIndia);
        countries = [seeded];
      } catch {
        countries = [defaultIndia];
      }
    }
    res.status(200).json({ success: true, data: countries });
  } catch (err) {
    next(err);
  }
};

// ───────────── GET States of First Country (Useful for frontend)
exports.getStates = async (req, res, next) => {
  try {
    let country = await CountryStateCity.findOne();
    if (!country) {
      try {
        country = await CountryStateCity.create(defaultIndia);
      } catch {
        country = defaultIndia;
      }
    }

    const states = country.states.map((s) => s.stateName);
    res.status(200).json({ success: true, data: states });
  } catch (err) {
    next(err);
  }
};

// ───────────── GET Cities by State Name
exports.getCitiesByState = async (req, res, next) => {
  const { stateName } = req.params;

  try {
    let country = await CountryStateCity.findOne();
    if (!country) {
      try {
        country = await CountryStateCity.create(defaultIndia);
      } catch {
        country = defaultIndia;
      }
    }

    const state = country.states.find((s) => s.stateName.toLowerCase() === (stateName || '').toLowerCase());
    if (!state) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, data: state.cityNames });
  } catch (err) {
    next(err);
  }
};

// ───────────── GET Single Country by ID
exports.getCountryById = async (req, res, next) => {
  if (!isValidId(req.params.id))
    return next(new ErrorHandler('Invalid ID format', 400));

  try {
    const country = await CountryStateCity.findById(req.params.id);
    if (!country) return next(new ErrorHandler('Country not found', 404));
    res.status(200).json({ success: true, data: country });
  } catch (err) {
    next(err);
  }
};

// ───────────── UPDATE Country
exports.updateCountry = async (req, res, next) => {
  if (!isValidId(req.params.id))
    return next(new ErrorHandler('Invalid ID format', 400));

  try {
    const updated = await CountryStateCity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return next(new ErrorHandler('Country not found', 404));
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ───────────── DELETE Country
exports.deleteCountry = async (req, res, next) => {
  if (!isValidId(req.params.id))
    return next(new ErrorHandler('Invalid ID format', 400));

  try {
    const deleted = await CountryStateCity.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler('Country not found', 404));
    res.status(204).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};
