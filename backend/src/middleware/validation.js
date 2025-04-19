const { validationResult } = require("express-validator");

module.exports = (validators) => {
  return [
    ...validators,
    (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        error.validationErrors = errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        }));

        return next(error);
      }

      next();
    },
  ];
};
