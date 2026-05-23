const DocumentMaster = require('../models/documentMaster');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

exports.createDocument = catchAsyncErrors(async (req, res, next) => {
  const { key, label, isRequired, isActive } = req.body;

  if (!key || !label) {
    return next(new ErrorHandler('Please provide both key and label for the document.', 400));
  }

  const existing = await DocumentMaster.findOne({ key });
  if (existing) {
    return next(new ErrorHandler('A document with this key already exists.', 400));
  }

  const doc = await DocumentMaster.create({ key, label, isRequired, isActive });

  res.status(201).json({
    success: true,
    data: doc
  });
});

exports.getAllDocuments = catchAsyncErrors(async (req, res, next) => {
  const docs = await DocumentMaster.find().sort({ createdAt: 1 });
  
  // If the collection is empty, seed some default documents
  if (docs.length === 0) {
    const defaultDocs = [
      { key: "candidatePhoto", label: "Candidate Photo", isRequired: true, isActive: true },
      { key: "candidateSignature", label: "Signature", isRequired: false, isActive: true },
      { key: "aadharPhoto", label: "Aadhar Card", isRequired: true, isActive: true },
      { key: "tenthMarksheet", label: "10th Marksheet", isRequired: false, isActive: true }
    ];
    await DocumentMaster.insertMany(defaultDocs);
    const newDocs = await DocumentMaster.find().sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: newDocs });
  }

  res.status(200).json({
    success: true,
    data: docs
  });
});

exports.updateDocument = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const doc = await DocumentMaster.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!doc) {
    return next(new ErrorHandler('Document not found', 404));
  }

  res.status(200).json({
    success: true,
    data: doc
  });
});

exports.deleteDocument = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const doc = await DocumentMaster.findByIdAndDelete(id);

  if (!doc) {
    return next(new ErrorHandler('Document not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Document deleted successfully'
  });
});
