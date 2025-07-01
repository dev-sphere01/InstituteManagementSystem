const express = require('express');
const router = express.Router();
const admissionController = require('../../../controllers/admissioncontroller');
const { validateAdmission } = require('../../../middlewares/validateAdmission');
const upload = require('./../../../middlewares/upload');

// CREATE a new admission
router.post('/', validateAdmission, admissionController.createAdmission);

// GET all admissions
router.get('/', admissionController.getAllAdmissions);

// SEARCH by query
router.get('/search/query', admissionController.searchAdmission);

// GET admission by ID
router.get('/:id', admissionController.getAdmissionById);

// UPDATE an admission fully by ID
router.put('/:id', validateAdmission, admissionController.updateAdmission);

// PATCH admission (step update) by ID — ✅ FIXED PATH
router.patch('/:id', admissionController.patchAdmission);

// DELETE admission by ID
router.delete('/:id', admissionController.deleteAdmission);


// admissionRoutes.js or wherever your multer upload route is
router.post('/upload/:id/:field', upload.single('file'), async (req, res) => {
  try {
    const { id, field } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = `/uploads/${req.file.filename}`;

    console.log('Uploading field:', field);
    console.log('Generated filePath:', filePath);

    const updated = await AdmissionDetails.findByIdAndUpdate(
      id,
      { [field]: filePath },
      { new: true }
    );

    if (!updated) {
      console.log('Document not found for ID:', id);
      return res.status(404).json({ message: 'Admission not found' });
    }

    console.log('Successfully updated admission with new path for', field);
    res.status(200).json({
      message: `${field} uploaded successfully`,
      path: filePath,
      data: updated,
    });
  } catch (error) {
    console.error('[UPLOAD ERROR]', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});




module.exports = router;
