/**
 * @fileoverview express-validator middleware factory for Startup CRM Lite.
 *
 * `validate(validations)` accepts an array of express-validator chain objects,
 * runs them all sequentially, then:
 *   • Returns 400 with a structured error array if any check failed.
 *   • Calls next() to continue the middleware chain if all checks passed.
 *
 * @example
 * import { body } from 'express-validator';
 * import validate from '../middleware/validate.js';
 *
 * router.post(
 *   '/register',
 *   validate([
 *     body('email').isEmail().withMessage('Valid email required'),
 *     body('password').isLength({ min: 6 }).withMessage('Min 6 chars'),
 *   ]),
 *   registerController,
 * );
 */

import { validationResult } from 'express-validator';

/* ──────────────────────────  Validate Middleware  ────────────────────────── */

/**
 * Higher-order function that returns an Express middleware chain.
 *
 * Each element of `validations` is an express-validator `ValidationChain` or
 * any middleware that populates the validation result bag. They are run in
 * parallel via `Promise.all` for maximum throughput.
 *
 * Response shape on failure (HTTP 400):
 * ```json
 * {
 *   "success": false,
 *   "errors": [
 *     { "field": "email",    "message": "Must be a valid email address" },
 *     { "field": "password", "message": "Password must be at least 6 characters" }
 *   ]
 * }
 * ```
 *
 * @param {import('express-validator').ValidationChain[]} validations
 *   Array of express-validator validation chains to execute.
 *
 * @returns {import('express').RequestHandler} Express middleware function.
 */
const validate = (validations) => async (req, res, next) => {
  try {
    // Run every validation chain in parallel for efficiency.
    await Promise.all(validations.map((v) => v.run(req)));

    // Collect all accumulated errors from the request bag.
    const result = validationResult(req);

    if (!result.isEmpty()) {
      // Normalise errors to a consistent { field, message } shape so the
      // frontend can map them directly onto form fields without extra parsing.
      const errors = result.array().map((err) => ({
        field: err.path ?? err.param, // express-validator v7 uses `path`
        message: err.msg,
      }));

      return res.status(400).json({
        success: false,
        errors,
      });
    }

    // All validations passed – continue to the next handler.
    return next();
  } catch (error) {
    return next(error);
  }
};

export { validate };
export default validate;
