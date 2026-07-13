/**
 * @fileoverview JWT authentication middleware for Startup CRM Lite.
 *
 * Exports a single `protect` middleware that:
 *   1. Extracts the Bearer token from the Authorization header.
 *   2. Verifies the JWT signature and expiry using process.env.JWT_SECRET.
 *   3. Looks up the associated user in MongoDB (omitting the password field).
 *   4. Attaches the user document to `req.user` for downstream route handlers.
 *
 * Produces specific 401 / 404 responses for each failure scenario so clients
 * can give the user an accurate error message without leaking internal details.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/* ─────────────────────────────  Protect Middleware  ──────────────────────── */

/**
 * Middleware that protects routes behind JWT authentication.
 *
 * Attach this to any route (or router) that should only be accessible to
 * authenticated users:
 *
 * @example
 * router.get('/profile', protect, getProfile);
 *
 * @param {import('express').Request}      req  - Express request object.
 * @param {import('express').Response}     res  - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {void}
 */
const protect = async (req, res, next) => {
  try {
    // ── 1. Extract token from Authorization header ─────────────────────────
    // Expected format:  Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, access denied',
      });
    }

    const token = authHeader.split(' ')[1]; // isolate the raw JWT string

    // ── 2. Verify token signature and expiry ──────────────────────────────
    // jwt.verify throws:
    //   • JsonWebTokenError – malformed token / wrong secret
    //   • TokenExpiredError – the `exp` claim is in the past
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired, please login again',
        });
      }
      // JsonWebTokenError or any other JWT failure
      return res.status(401).json({
        success: false,
        message: 'Token is invalid',
      });
    }

    // ── 3. Look up the user in the database ───────────────────────────────
    // Exclude the password hash from the document – it must never reach a
    // route handler unintentionally.
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      // The token was valid but the account has since been deleted.
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
      });
    }

    // ── 4. Attach user to request and proceed ────────────────────────────
    req.user = user;
    return next();
  } catch (error) {
    // Unexpected errors (e.g., DB connection failure) are forwarded to the
    // global error handler registered in server.js.
    return next(error);
  }
};

export { protect };
export default protect;
