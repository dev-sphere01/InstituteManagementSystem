const Enquiry = require('./../models/enquiry');

// Create Enquiry
exports.createEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    res.status(201).json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};

// Get All Enquiries
exports.getAllEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find();
    res.status(200).json({ success: true, data: enquiries });
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
