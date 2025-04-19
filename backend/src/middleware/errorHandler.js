module.exports = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  const errorResponse = {
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString(),
    },
  };

  if (process.env.NODE_ENV !== "production") {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};
