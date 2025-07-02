// middlewares/upload.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Get student id from params
      const id = req.params.id;
      if (!id || id.length < 8) return cb(new Error('Invalid student id'));
      const folderName = id.slice(-8);
      const uploadPath = path.join('uploads', folderName);
      // Create folder if not exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const id = req.params.id;
    const field = req.params.field;
    const ext = path.extname(file.originalname);
    const folderName = id.slice(-8);
    const fileName = `${folderName}_${field}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

module.exports = upload;
