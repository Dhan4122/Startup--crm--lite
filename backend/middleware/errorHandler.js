/**
 * @fileoverview Global Express error-handling middleware.
 *
 * This must be registered as the LAST middleware in server.js using
 * `app.use(errorHandler)` so that it catches every error forwarded via
 * `next(err)` from any route or earlier middleware.
 *
 * Error categories handled:
 *   - Mongoose ValidationError  → 400 Bad Request  (field-level details)
 *   - Mongoose CastError        → 404 Not Found     (invalid ObjectId)
 *   - MongoDB duplicate key     → 409 Conflict       (email already exists)
 *   - JWT JsonWebTokenError     → 401 Unauthorized
 *   - JWT TokenExpiredError     → 401 Unauthorized
 *   - Everything else           → 500 Internal Server Error
 *
 * Stack traces are included in responses ONLY in the `development` environment
 * to avoid leaking implementation details in production.
 */

import { errorResponse } from '../utils/apiResponse.js';

/**
 * Express global error handler.
 *
 * Must have exactly four parameters so Express recognises it as an
 * error-handling middleware (as opposed to a regular route handler).
 *
 * @param {Error}                      err  - The error object forwarded via next(err).
 * @param {import('express').Request}  req  - Express request object.
 * @param {import('express').Response} res  - Express response object.
 * @param {import('express').NextFunction} next - Express next function (required by signature).
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // ── Determine whether to expose the stack trace ───────────────────────────
  // Only include err.stack in development so production responses stay clean.
  const isDevelopment = process.env.NODE_ENV === 'development';
  const stack = isDevelopment ? err.stack : undefined;

  // ── Log every error server-side for observability ─────────────────────────
  console.error('🔴 Error:', err);

  // ── Mongoose Validation Error ─────────────────────────────────────────────
  // Triggered when a document fails schema validation (required fields,
  // enum values, custom validators, etc.).
  // Returns 400 with a field→message map so clients can highlight bad inputs.
  if (err.name === 'ValidationError') {
    // Build a plain object keyed by field name for easy frontend consumption.
    const fieldErrors = Object.values(err.errors).reduce((acc, e) => {
      acc[e.path] = e.message;
      return acc;
    }, {});

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: fieldErrors,
      ...(stack && { stack }), // conditionally spread stack in dev mode
    });
  }

  // ── Mongoose CastError (invalid ObjectId) ─────────────────────────────────
  // Triggered when a route param like `/:id` cannot be cast to a valid
  // MongoDB ObjectId (e.g., the string "abc" instead of a 24-hex-char ID).
  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
      errors: null,
      ...(stack && { stack }),
    });
  }

  // ── MongoDB Duplicate Key Error (code 11000) ──────────────────────────────
  // Triggered when an insert/update violates a unique index.
  // In this project the most common unique field is `email`.
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Email already exists',
      errors: null,
      ...(stack && { stack }),
    });
  }

  // ── JWT – Invalid token ───────────────────────────────────────────────────
  // Triggered when the token signature is wrong, the token is malformed,
  // or the secret used to sign it does not match.
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.',
      errors: null,
      ...(stack && { stack }),
    });
  }

  // ── JWT – Expired token ───────────────────────────────────────────────────
  // Triggered when the `exp` claim in the JWT payload is in the past.
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please log in again.',
      errors: null,
      ...(stack && { stack }),
    });
  }

  // ── Fallback – Unexpected / Unclassified Errors ───────────────────────────
  // Catch-all for any error not handled above.
  // Uses statusCode from the error object if set (e.g., http-errors library),
  // otherwise defaults to 500 Internal Server Error.
  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Server error',
    errors: null,
    ...(stack && { stack }),
  });
};

export default errorHandler;
