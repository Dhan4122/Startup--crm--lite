/**
 * @fileoverview Mongoose model for application users.
 *
 * Handles authentication identity, role-based access control, and
 * secure password storage via bcryptjs hashing.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

/** Number of salt rounds used by bcrypt when hashing passwords. */
const SALT_ROUNDS = 10;

/**
 * Regex pattern for basic RFC-5322-compliant email validation.
 * Ensures the value contains a local part, an "@" symbol, and a domain.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @typedef {Object} IUser
 * @property {string}  name      - Full display name of the user.
 * @property {string}  email     - Unique email address used for login.
 * @property {string}  password  - Bcrypt-hashed password (never plain text).
 * @property {string}  role      - Access level: 'admin' or 'user'.
 * @property {boolean} isActive  - Soft-delete / account suspension flag.
 * @property {Date}    createdAt - Timestamp added automatically by Mongoose.
 * @property {Date}    updatedAt - Timestamp updated automatically by Mongoose.
 */

const userSchema = new Schema(
  {
    /**
     * Full display name of the user.
     * Trimmed automatically; must be between 2 and 50 characters.
     *
     * @type {String}
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },

    /**
     * Unique email address for authentication and communication.
     * Stored in lowercase to prevent case-sensitivity collisions.
     *
     * @type {String}
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => EMAIL_REGEX.test(value),
        message: 'Email must be a valid email address',
      },
    },

    /**
     * Bcrypt-hashed password.
     * The pre-save hook below handles hashing automatically whenever
     * this field is modified. Plain-text passwords are NEVER persisted.
     *
     * @type {String}
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },

    /**
     * Role-based access level for the user.
     * Controls which routes and resources the user can access.
     *
     * - 'admin' : Full access to all CRM features and user management.
     * - 'user'  : Standard access; can only manage their own leads.
     *
     * @type {String}
     * @default 'user'
     */
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: "Role must be either 'admin' or 'user'",
      },
      default: 'user',
    },

    /**
     * Soft-delete / account suspension flag.
     * When set to false the user cannot log in, but their data is retained.
     *
     * @type {Boolean}
     * @default true
     */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    /**
     * Automatically manages `createdAt` and `updatedAt` timestamp fields.
     * Mongoose sets `createdAt` on insert and updates `updatedAt` on every save.
     */
    timestamps: true,
  }
);

/* ─────────────────────────────  Middleware  ──────────────────────────────── */

/**
 * Pre-save hook — hash the password with bcrypt before persisting.
 *
 * Skips hashing if the password field has not been modified, avoiding
 * unnecessary re-hashing on unrelated document updates.
 *
 * NOTE: Mongoose 8+ async pre-hooks must NOT accept or call `next()`.
 * Mongoose detects that the function is async and handles the lifecycle
 * automatically. Simply return (or throw) to signal completion/failure.
 */
userSchema.pre('save', async function hashPassword() {
  // Only hash when the password field has actually changed.
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
  // No need to call next() — Mongoose 8+ handles async hooks automatically.
  // Any thrown error is automatically forwarded to the error handler.
});

/* ──────────────────────────  Instance Methods  ───────────────────────────── */

/**
 * Compares a plain-text candidate password against the stored bcrypt hash.
 *
 * Use this during login to verify credentials without exposing the hash.
 *
 * @param {string} candidatePassword - The plain-text password supplied by the user.
 * @returns {Promise<boolean>} Resolves to `true` if the passwords match, `false` otherwise.
 *
 * @example
 * const isMatch = await user.comparePassword(req.body.password);
 * if (!isMatch) throw new Error('Invalid credentials');
 */
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ──────────────────────────  JSON Serialisation  ─────────────────────────── */

/**
 * Override the default toJSON transformation to strip the password hash
 * from any object serialised to JSON (e.g., API responses).
 *
 * This is a safety net — controllers should never manually attach the
 * password to response payloads, but this ensures it cannot leak.
 *
 * @returns {Object} A plain object representation of the document without the password field.
 */
userSchema.methods.toJSON = function toJSON() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

/* ───────────────────────────────  Exports  ───────────────────────────────── */

/** Compiled Mongoose model for the 'users' collection. */
const User = model('User', userSchema);

export { User, userSchema };
export default User;
