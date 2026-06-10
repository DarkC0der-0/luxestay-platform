// server/middleware/validate.js
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      next(error); // Forwards ZodError to the global errorHandler
    }
  };
};

module.exports = validate;
