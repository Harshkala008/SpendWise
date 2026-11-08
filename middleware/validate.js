const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validate = (request, response, next) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return next(new AppError('Request validation failed', 400, errors.array()));
  }

  next();
};

module.exports = validate;
