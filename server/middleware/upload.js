const multer = require('multer');
const { errorResponse } = require('../utils/responseHelper');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File too large. Maximum size is 10MB', 400);
    }
    return errorResponse(res, err.message, 400);
  } else if (err) {
    return errorResponse(res, err.message, 400);
  }
  next();
};

module.exports = { upload, handleUploadError };
