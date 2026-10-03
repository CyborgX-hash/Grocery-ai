function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: messages,
    });
  }

  // Handle Prisma known errors
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'The requested resource was not found.',
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'A record with this identifier or unique field already exists.',
    });
  }

  // Standard safe error response
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
