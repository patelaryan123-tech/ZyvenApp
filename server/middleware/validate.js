const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseHelper');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({ [err.path || err.param]: err.msg }));
    return errorResponse(res, 'Validation failed', 400, extractedErrors);
  }
  next();
};

module.exports = { validate };
