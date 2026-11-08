const mongoose = require('mongoose');

const errorHandler = (error, request, response, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let errors = error.errors;

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(error.errors).map((validationError) => ({
      field: validationError.path,
      message: validationError.message
    }));
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    error: { code: error.code || 'INTERNAL_ERROR', message },
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV !== 'production' && !error.isOperational ? { stack: error.stack } : {})
  });
};

module.exports = errorHandler;
