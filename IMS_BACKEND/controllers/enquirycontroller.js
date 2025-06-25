const Enquiry = require('./../models/Enquiry');

// Create Enquiry
exports.createEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    res.status(201).json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};

// Get All Enquiries with search, filters, pagination
exports.getAllEnquiries = async (req, res, next) => {
  try {
    const {
      search = '',
      course = '',
      dateFrom = '',
      dateTo = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};
    // Search by name or contact
    if (search) {
      query.$or = [
        { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
        { 'contactInfo.contactNumber': { $regex: search, $options: 'i' } },
      ];
    }
    // Filter by course
    if (course) {
      query['coursePreferences.interestedCourses'] = course;
    }
    // Filter by date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [enquiries, total] = await Promise.all([
      Enquiry.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Enquiry.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: enquiries,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Enquiry
exports.getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};

// Delete Enquiry
exports.deleteEnquiry = async (req, res, next) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.status(204).json({ success: true, message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
