/**
 * @fileoverview Auth routes for Startup CRM Lite.
 *
 * All routes are mounted under /api/auth in server.js:
 *
 *   POST   /api/auth/register   – create account
 *   POST   /api/auth/login      – authenticate and receive token
 *   GET    /api/auth/me         – get the authenticated user's profile
 *   PATCH  /api/auth/me         – update name / password
 *   DELETE /api/auth/logout     – client-side token invalidation hint
 *
 * Input validation is performed by the validate() middleware factory which
 * uses express-validator chains defined below.  Route-level validation runs
 * before the controller, so controllers can assume `req.body` is already
 * validated and sanitised.
 *
 * PRODUCTION NOTE: Add express-rate-limit here (see comment below) before
 * deploying to prevent brute-force attacks on the login and register endpoints.
 */

import { Router } from 'express';
import { body } from 'express-validator';

import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

/* ─────────────────────────  Rate Limiting (TODO)  ────────────────────────────
 *
 * PRODUCTION: Import and apply express-rate-limit on the register and login
 * routes to mitigate brute-force and credential-stuffing attacks.
 *
 * Example:
 *   import rateLimit from 'express-rate-limit';
 *
 *   const authLimiter = rateLimit({
 *     windowMs : 15 * 60 * 1000,  // 15-minute sliding window
 *     max      : 10,              // max 10 attempts per window per IP
 *     message  : { success: false, message: 'Too many attempts, try again later.' },
 *     standardHeaders: true,
 *     legacyHeaders  : false,
 *   });
 *
 *   router.post('/register', authLimiter, ...);
 *   router.post('/login',    authLimiter, ...);
 *
 * ─────────────────────────────────────────────────────────────────────────── */

/* ──────────────────────────  Validation Rules  ────────────────────────────── */

/**
 * Validation chains for POST /register.
 *
 * @type {import('express-validator').ValidationChain[]}
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

/**
 * Validation chains for POST /login.
 *
 * @type {import('express-validator').ValidationChain[]}
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation chains for PATCH /me (update profile).
 * All fields are optional – at least one must be provided (controller handles this).
 *
 * @type {import('express-validator').ValidationChain[]}
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),

  body('currentPassword')
    .if(body('newPassword').exists())
    .notEmpty()
    .withMessage('Current password is required when setting a new password'),
];

/* ──────────────────────────────  Routes  ─────────────────────────────────── */

/**
 * POST /api/auth/register
 *
 * Public. Create a new user account.
 * Validation  →  Controller
 */
router.post('/register', validate(registerValidation), register);

/**
 * POST /api/auth/login
 *
 * Public. Authenticate with email + password and receive a JWT.
 * Validation  →  Controller
 */
router.post('/login', validate(loginValidation), login);

/**
 * GET /api/auth/me
 *
 * Protected. Returns the profile of the currently authenticated user.
 * protect  →  Controller (req.user already populated)
 */
router.get('/me', protect, getProfile);

/**
 * PATCH /api/auth/me
 *
 * Protected. Update display name and/or password.
 * protect  →  Validation  →  Controller
 */
router.patch('/me', protect, validate(updateProfileValidation), updateProfile);

/**
 * DELETE /api/auth/logout
 *
 * Protected. JWTs are stateless, so "logout" on the server side is a no-op.
 * The client is responsible for discarding the token from storage.
 * This endpoint exists so the frontend has a conventional hook to call and
 * so future server-side token blacklisting can be added here without a
 * breaking API change.
 */
router.delete('/logout', protect, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please remove the token on the client.',
  });
});

export default router;
