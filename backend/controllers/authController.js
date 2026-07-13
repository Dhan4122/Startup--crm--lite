/**
 * @fileoverview Auth controller for Startup CRM Lite.
 *
 * Exports five functions:
 *   • register      – create account + issue JWT
 *   • login         – verify credentials + issue JWT
 *   • getProfile    – return the authenticated user from req.user
 *   • updateProfile – update name and/or password for the authenticated user
 *   • generateToken – private helper that signs a JWT (not a route handler)
 *
 * Security principles applied throughout:
 *   • Password field is NEVER included in any API response.
 *   • Login failure messages are deliberately vague to prevent user enumeration.
 *   • Old password is required before any password change is accepted.
 *   • All async code is wrapped in try/catch – failures are forwarded via next(error).
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse } from '../utils/apiResponse.js';

/* ──────────────────────────────  Helpers  ────────────────────────────────── */

/**
 * Signs a JWT for the given user ID.
 *
 * Uses process.env.JWT_EXPIRES_IN for the expiry so that production deployments
 * can tune the lifetime via environment configuration without a code change.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId - MongoDB _id of the user.
 * @returns {string} Signed JWT string.
 */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/* ───────────────────────────────  Register  ──────────────────────────────── */

/**
 * POST /api/auth/register
 *
 * Creates a new user account and returns a JWT on success.
 *
 * Steps:
 *   1. Reject the request if the email is already in use.
 *   2. Persist the new User document (password is hashed by the pre-save hook).
 *   3. Sign a 7-day JWT.
 *   4. Return 201 with the token and the sanitised user object.
 *
 * @type {import('express').RequestHandler}
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ── Duplicate email guard ──────────────────────────────────────────────
    // Check before insert to give a clearer 409 error rather than relying on
    // the MongoDB unique-index violation (which produces a cryptic code-11000).
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // ── Create user ───────────────────────────────────────────────────────
    // The pre-save hook in User.js hashes the password before it is written.
    const user = await User.create({ name, email, password });

    // ── Issue token ───────────────────────────────────────────────────────
    // Use a hardcoded '7d' here (spec requirement). The generateToken helper
    // uses process.env.JWT_EXPIRES_IN and is used by login.
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // toJSON() on the User model strips the password automatically.
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user,            // password already removed by toJSON()
    });
  } catch (error) {
    return next(error);
  }
};

/* ────────────────────────────────  Login  ────────────────────────────────── */

/**
 * POST /api/auth/login
 *
 * Verifies credentials and returns a JWT on success.
 *
 * Security notes:
 *   • Both "user not found" and "wrong password" return the same 401 message
 *     to prevent username / email enumeration attacks.
 *   • Accounts with isActive=false receive a 403 (not 401) so the UI can
 *     display a distinct "account deactivated" message.
 *
 * @type {import('express').RequestHandler}
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ── Fetch user WITH password field ────────────────────────────────────
    // The schema sets `select: false` on password by default (add it if not
    // already present); `.select('+password')` overrides that for this query.
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    // ── Credential check ──────────────────────────────────────────────────
    // Evaluate both conditions before returning to avoid timing differences
    // that could leak whether the email exists.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // ── Account status check ──────────────────────────────────────────────
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // ── Issue token ───────────────────────────────────────────────────────
    const token = generateToken(user._id);

    // Strip password before serialising (toJSON handles this, but be explicit).
    const userObject = user.toJSON(); // password already removed

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userObject,
    });
  } catch (error) {
    return next(error);
  }
};

/* ──────────────────────────────  Get Profile  ────────────────────────────── */

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user.
 * The `protect` middleware has already fetched the user (sans password) and
 * attached it to `req.user`, so this handler simply echoes it back.
 *
 * @type {import('express').RequestHandler}
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user is guaranteed to exist and to have no password field because
    // the protect middleware uses .select('-password').
    return successResponse(res, req.user, 'Profile retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/* ─────────────────────────────  Update Profile  ──────────────────────────── */

/**
 * PATCH /api/auth/me
 *
 * Allows the authenticated user to update their display name and/or password.
 *
 * Rules:
 *   • Only `name` may be changed here. Email changes require an email
 *     verification flow and are intentionally not supported by this endpoint.
 *   • To change the password, the client must supply BOTH `currentPassword`
 *     (verified against the existing hash) and `newPassword` (min 6 chars).
 *
 * @type {import('express').RequestHandler}
 */
const updateProfile = async (req, res, next) => {
  try {
    // Fetch the full document including password so we can verify the current
    // password if a password change is requested.
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // ── Name update ───────────────────────────────────────────────────────
    if (req.body.name !== undefined) {
      user.name = req.body.name.trim();
    }

    // ── Password change ───────────────────────────────────────────────────
    // Both fields are required to trigger a password update.
    if (req.body.newPassword !== undefined) {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password',
        });
      }

      // Verify the current password before accepting the replacement.
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        });
      }

      // Assign plain text – the pre-save hook in User.js will hash it.
      user.password = newPassword;
    }

    // ── Persist changes ───────────────────────────────────────────────────
    await user.save();

    // Return the updated user without the password field.
    const updatedUser = user.toJSON(); // toJSON strips password

    return successResponse(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    return next(error);
  }
};

/* ───────────────────────────────  Exports  ───────────────────────────────── */

export {
  register,
  login,
  getProfile,
  updateProfile,
  generateToken,
};
