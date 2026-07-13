/**
 * @fileoverview Standardised API response helpers.
 *
 * Centralising response formatting in one place guarantees that every
 * endpoint returns a consistent JSON envelope, which makes it easy for
 * frontend clients and API consumers to handle responses predictably.
 *
 * Three response types are supported:
 *   1. `successResponse`   – single resource or action confirmation.
 *   2. `errorResponse`     – validation / server errors.
 *   3. `paginatedResponse` – list endpoints with pagination metadata.
 */

/* ─────────────────────────  Success Response  ────────────────────────────── */

/**
 * Sends a successful JSON response.
 *
 * Shape:
 * ```json
 * {
 *   "success": true,
 *   "message": "Lead created successfully",
 *   "data": { ... }
 * }
 * ```
 *
 * @param {import('express').Response} res        - Express response object.
 * @param {*}                          data        - Payload to include (object, array, etc.).
 * @param {string}                     [message=''] - Human-readable success message.
 * @param {number}                     [statusCode=200] - HTTP status code (200, 201, …).
 * @returns {import('express').Response}
 *
 * @example
 * // In a controller
 * return successResponse(res, lead, 'Lead created successfully', 201);
 */
const successResponse = (res, data, message = '', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/* ──────────────────────────  Error Response  ─────────────────────────────── */

/**
 * Sends an error JSON response.
 *
 * Shape:
 * ```json
 * {
 *   "success": false,
 *   "message": "Validation failed",
 *   "errors": { "email": "Email is required" }
 * }
 * ```
 *
 * @param {import('express').Response} res           - Express response object.
 * @param {string}                     message        - Human-readable error message.
 * @param {number}                     [statusCode=500] - HTTP status code (400, 404, 500, …).
 * @param {Object|null}                [errors=null]  - Optional field-level or detailed errors.
 * @returns {import('express').Response}
 *
 * @example
 * return errorResponse(res, 'Email already exists', 409);
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/* ─────────────────────────  Paginated Response  ──────────────────────────── */

/**
 * Sends a paginated list response with pagination metadata.
 *
 * Shape:
 * ```json
 * {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "total": 100,
 *     "page": 2,
 *     "limit": 10,
 *     "pages": 10
 *   }
 * }
 * ```
 *
 * @param {import('express').Response} res   - Express response object.
 * @param {Array}                      data   - Array of records for the current page.
 * @param {number}                     total  - Total number of matching records in the DB.
 * @param {number}                     page   - Current page number (1-based).
 * @param {number}                     limit  - Number of records per page.
 * @returns {import('express').Response}
 *
 * @example
 * const total = await Lead.countDocuments(filter);
 * const leads = await Lead.find(filter).skip(skip).limit(limit);
 * return paginatedResponse(res, leads, total, page, limit);
 */
const paginatedResponse = (res, data, total, page, limit) => {
  const pages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  });
};

export { successResponse, errorResponse, paginatedResponse };
