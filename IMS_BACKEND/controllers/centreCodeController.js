const CentreCode = require('../models/centreCode');
const ErrorHandler = require('../utils/ErrorHandler');
const mongoose = require('mongoose');

// Create CentreCode
exports.createCentreCode = async (req, res, next) => {
  try {
    const { centreCode, State, City, name, address, phone, email } = req.body;

    // Validation
    if (!centreCode || !State || !City || !name) {
      return next(new ErrorHandler('Centre code, State, City, and name are required fields', 400));
    }

    // Check if centre code already exists
    const existingCentre = await CentreCode.findOne({ centreCode });
    if (existingCentre) {
      return next(new ErrorHandler('Centre code already exists', 409));
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return next(new ErrorHandler('Invalid email format', 400));
    }

    // Validate phone number if provided
    if (phone && (typeof phone !== 'number' || phone.toString().length < 10)) {
      return next(new ErrorHandler('Phone number must be at least 10 digits', 400));
    }

    const centre = await CentreCode.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Centre code created successfully',
      data: centre
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new ErrorHandler(`${field} already exists`, 409));
    }
    next(error);
  }
};

// Get All CentreCodes with optional pagination and filtering
exports.getAllCentreCodes = async (req, res, next) => {
  try {
    const { page, limit, State, City, search } = req.query;

    /* ---------- build dynamic filter ---------- */
    const filter = {};
    if (State) filter.State = new RegExp(State, 'i');
    if (City) filter.City = new RegExp(City, 'i');
    if (search) {
      filter.$or = [
        { centreCode: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') },
        { State: new RegExp(search, 'i') },
        { City: new RegExp(search, 'i') }
      ];
    }

    /* ---------- choose paginated vs. full fetch ---------- */
    let centres, total;

    if (page && limit) {
      // ▸ paginated
      const p = parseInt(page);
      const l = parseInt(limit);
      centres = await CentreCode.find(filter)
        .sort({ createdAt: -1 })
        .limit(l)
        .skip((p - 1) * l);

      total = await CentreCode.countDocuments(filter);

      return res.status(200).json({
        success: true,
        data: centres,
        pagination: {
          currentPage: p,
          totalPages: Math.ceil(total / l),
          totalRecords: total,
          hasNextPage: p < Math.ceil(total / l),
          hasPrevPage: p > 1
        }
      });
    }

    // ▸ no page/limit → return *all* matching centres
    centres = await CentreCode.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: centres,
      totalRecords: centres.length
    });
  } catch (error) {
    next(error);
  }
};


// Get Single CentreCode
exports.getCentreCodeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler('Invalid centre code ID', 400));
    }

    const centre = await CentreCode.findById(id);
    if (!centre) {
      return next(new ErrorHandler('Centre code not found', 404));
    }

    res.status(200).json({
      success: true,
      data: centre
    });
  } catch (error) {
    next(error);
  }
};

// Get CentreCode by centre code
exports.getCentreByCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    const centre = await CentreCode.findOne({ centreCode: code });
    if (!centre) {
      return next(new ErrorHandler('Centre code not found', 404));
    }

    res.status(200).json({
      success: true,
      data: centre
    });
  } catch (error) {
    next(error);
  }
};

// Update CentreCode
exports.updateCentreCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, phone } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler('Invalid centre code ID', 400));
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return next(new ErrorHandler('Invalid email format', 400));
    }

    // Validate phone number if provided
    if (phone && (typeof phone !== 'number' || phone.toString().length < 10)) {
      return next(new ErrorHandler('Phone number must be at least 10 digits', 400));
    }

    const updatedCentre = await CentreCode.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!updatedCentre) {
      return next(new ErrorHandler('Centre code not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Centre code updated successfully',
      data: updatedCentre
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new ErrorHandler(`${field} already exists`, 409));
    }
    next(error);
  }
};

// Delete CentreCode
exports.deleteCentreCode = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler('Invalid centre code ID', 400));
    }

    const deleted = await CentreCode.findByIdAndDelete(id);
    if (!deleted) {
      return next(new ErrorHandler('Centre code not found', 404));
    }

    res.status(200).json({
      success: true,
      message: "Centre code deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Get centres by state
exports.getCentresByState = async (req, res, next) => {
  try {
    const { state } = req.params;

    const centres = await CentreCode.find({
      State: new RegExp(state, 'i')
    }).sort({ City: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: centres,
      count: centres.length
    });
  } catch (error) {
    next(error);
  }
};

// Get centres by city
exports.getCentresByCity = async (req, res, next) => {
  try {
    const { city } = req.params;

    const centres = await CentreCode.find({
      City: new RegExp(city, 'i')
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: centres,
      count: centres.length
    });
  } catch (error) {
    next(error);
  }
};

// Get statistics
exports.getCentreStats = async (req, res, next) => {
  try {
    const totalCentres = await CentreCode.countDocuments();

    const stateStats = await CentreCode.aggregate([
      { $group: { _id: '$State', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const cityStats = await CentreCode.aggregate([
      { $group: { _id: '$City', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCentres,
        stateStats,
        topCities: cityStats
      }
    });
  } catch (error) {
    next(error);
  }
};