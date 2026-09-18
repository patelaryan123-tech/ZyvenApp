const express = require('express');
const router = express.Router();
const { uploadReport, getReports, getReportById, deleteReport, reanalyzeReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { reportValidation } = require('../utils/validators');
const { validate } = require('../middleware/validate');

router.use(protect);

router.route('/')
  .post(upload.single('report'), handleUploadError, reportValidation, validate, uploadReport)
  .get(getReports);

router.route('/:id')
  .get(getReportById)
  .delete(deleteReport);

router.post('/:id/reanalyze', reanalyzeReport);

module.exports = router;
