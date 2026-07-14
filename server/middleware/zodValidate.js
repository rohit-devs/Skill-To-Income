
const { ZodError } = require('zod');

/**
 * zodValidate accepts an object: { body, query, params } where each is a Zod schema
 * It validates and attaches parsed data to req.validated
 */
const zodValidate = (schemas = {}) => async (req, res, next) => {
  try {
    req.validated = req.validated || {};
    if (schemas.body) req.validated.body = await schemas.body.parseAsync(req.body);
    if (schemas.query) req.validated.query = await schemas.query.parseAsync(req.query);
    if (schemas.params) req.validated.params = await schemas.params.parseAsync(req.params);
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors });
    }
    return next(err);
  }
};

module.exports = zodValidate;
