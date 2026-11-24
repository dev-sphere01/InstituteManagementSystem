const Course = require("../models/courses");
const ErrorHandler = require("../utils/ErrorHandler");

// Create Course
exports.createCourse = async (req, res, next) => {
  try {
    // Convert subjects string to array if necessary
    if (typeof req.body.subjects === "string") {
      req.body.subjects = req.body.subjects
        .split(",")
        .map((sub) => sub.trim())
        .filter(Boolean);
      req.body.fee = Number(req.body.fee);
    }
    if (req.body.maxEmiInstallments) req.body.maxEmiInstallments = Number(req.body.maxEmiInstallments);
    if (req.body.emiAmount) req.body.emiAmount = Number(req.body.emiAmount);
    if (req.body.enableEmi !== undefined) req.body.enableEmi = Boolean(req.body.enableEmi);
    console.log(req.body);
    // Verify centreCode exists
    const centre = await require('../models/centreCode').findById(req.body.centreCode);
    if (!centre) {
      return next(new ErrorHandler("Invalid Centre Code", 400));
    }

    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get All Courses (Search, Filter, Pagination, Sort)
exports.getAllCourses = async (req, res, next) => {
  try {
    const {
      search = "",
      level = "",
      isActive = "",
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: "i" } },
        { courseCode: { $regex: search, $options: "i" } },
      ];
    }

    if (level) query.level = level;
    if (isActive !== "") query.isActive = isActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('centreCode') // Populate centreCode with all centre data
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: courses,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// Get Course by ID
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new ErrorHandler("Course not found", 404));
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// Update Course
exports.updateCourse = async (req, res, next) => {
  try {
    if (typeof req.body.subjects === "string") {
      req.body.subjects = req.body.subjects
        .split(",")
        .map((sub) => sub.trim())
        .filter(Boolean);
    }
    req.body.fee = Number(req.body.fee);
    if (req.body.maxEmiInstallments) req.body.maxEmiInstallments = Number(req.body.maxEmiInstallments);
    if (req.body.emiAmount) req.body.emiAmount = Number(req.body.emiAmount);
    if (req.body.enableEmi !== undefined) req.body.enableEmi = Boolean(req.body.enableEmi);

    // Verify centreCode exists
    if (req.body.centreCode) {
      const centre = await require('../models/centreCode').findById(req.body.centreCode);
      if (!centre) {
        return next(new ErrorHandler("Invalid Centre Code", 400));
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCourse) return next(new ErrorHandler("Course not found", 404));
    res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    next(error);
  }
};

// Delete Course
exports.deleteCourse = async (req, res, next) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ErrorHandler("Course not found", 404));
    res.status(204).json({ success: true, message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
