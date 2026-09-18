const { errorResponse } = require('../utils/responseHelper');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, `User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route`, 403);
    }
    next();
  };
};

module.exports = { authorize };
