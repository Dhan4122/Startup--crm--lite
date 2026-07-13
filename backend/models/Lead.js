/**
 * @fileoverview Mongoose model for CRM leads.
 *
 * A lead represents a potential customer tracked through the sales pipeline.
 * Each lead belongs to an owning user and progresses through defined statuses.
 * Compound and single-field indexes are added for common query patterns.
 */

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Regex pattern for basic RFC-5322-compliant email validation.
 * Reused from shared validation logic to keep messages consistent.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @typedef {Object} ILead
 * @property {string}             name      - Full name of the lead contact.
 * @property {string}             company   - Company the lead is associated with.
 * @property {string}             email     - Contact email address.
 * @property {string}             [phone]   - Optional phone number.
 * @property {string}             status    - Current pipeline stage of the lead.
 * @property {string}             source    - Channel through which the lead was acquired.
 * @property {string}             [notes]   - Free-form internal notes about the lead.
 * @property {mongoose.Types.ObjectId} owner - Reference to the User who owns this lead.
 * @property {Date}               createdAt - Timestamp added automatically by Mongoose.
 * @property {Date}               updatedAt - Timestamp updated automatically by Mongoose.
 */

const leadSchema = new Schema(
  {
    /**
     * Full name of the lead/contact person.
     * Trimmed automatically; must be between 2 and 100 characters.
     *
     * @type {String}
     */
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },

    /**
     * Name of the company or organisation the lead belongs to.
     * Used for grouping and filtering leads by account.
     *
     * @type {String}
     */
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },

    /**
     * Primary contact email address for the lead.
     * Validated against a regex to ensure proper formatting.
     * Indexed separately for fast single-field email lookups.
     *
     * @type {String}
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      validate: {
        validator: (value) => EMAIL_REGEX.test(value),
        message: 'Email must be a valid email address',
      },
    },

    /**
     * Optional phone number for the lead.
     * Stored as a string to support international formats (+1-800-555-0199).
     * No format validation is applied to allow maximum flexibility.
     *
     * @type {String}
     */
    phone: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * Current stage of the lead in the sales pipeline.
     * Values are kept in sync with the frontend Kanban board column identifiers.
     *
     * Pipeline stages (in order):
     * - 'New'               : Freshly created lead, not yet actioned.
     * - 'Contacted'         : Initial outreach has been made.
     * - 'Meeting Scheduled' : A meeting or demo has been arranged.
     * - 'Proposal Sent'     : A formal proposal or quote has been delivered.
     * - 'Won'               : Deal closed successfully.
     * - 'Lost'              : Lead did not convert.
     *
     * @type {String}
     * @default 'New'
     */
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
        message:
          "Status must be one of: 'New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'",
      },
      default: 'New',
    },

    /**
     * Acquisition channel that generated this lead.
     * Used for marketing attribution and campaign performance reporting.
     *
     * Supported sources:
     * - 'Website'       : Organic or paid traffic from the company website.
     * - 'Referral'      : Introduced by an existing customer or partner.
     * - 'LinkedIn'      : Sourced via LinkedIn prospecting or ads.
     * - 'Cold Call'     : Outbound cold calling initiative.
     * - 'Email Campaign': Response to a bulk email marketing campaign.
     * - 'Other'         : Any channel not covered by the above options.
     *
     * @type {String}
     * @default 'Website'
     */
    source: {
      type: String,
      enum: {
        values: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'],
        message:
          "Source must be one of: 'Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'",
      },
      default: 'Website',
    },

    /**
     * Internal free-form notes about the lead.
     * Used to record call summaries, requirements, and other context.
     * Capped at 1000 characters to prevent abuse.
     *
     * @type {String}
     */
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must not exceed 1000 characters'],
      default: null,
    },

    /**
     * Reference to the User who created and owns this lead.
     * Required to enforce data isolation between users and enable
     * permission checks in the middleware layer.
     *
     * @type {mongoose.Types.ObjectId}
     * @ref  'User'
     */
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead must be assigned to an owner'],
    },
  },
  {
    /**
     * Automatically manages `createdAt` and `updatedAt` timestamp fields.
     * `createdAt` is used by the `age` virtual to compute lead staleness.
     */
    timestamps: true,

    /**
     * Ensure virtual fields (e.g., `age`) are included when the
     * document is converted to a plain object or JSON string.
     */
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ────────────────────────────  Virtual Fields  ───────────────────────────── */

/**
 * Virtual field: `age`
 *
 * Returns the number of whole days elapsed since the lead was created.
 * Useful for analytics dashboards to surface stale or high-priority leads.
 *
 * This field is NOT persisted to MongoDB — it is computed on-the-fly
 * each time the document is accessed.
 *
 * @returns {number} Number of complete days since `createdAt`.
 *
 * @example
 * const lead = await Lead.findById(id);
 * console.log(`This lead is ${lead.age} day(s) old.`);
 */
leadSchema.virtual('age').get(function computeAge() {
  const now = Date.now();
  const createdMs = this.createdAt ? this.createdAt.getTime() : now;
  const diffMs = now - createdMs;
  // Convert milliseconds → whole days (floor to avoid fractional days)
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

/* ─────────────────────────────────  Indexes  ─────────────────────────────── */

/**
 * Compound index on `owner` + `status`.
 *
 * Optimises the most frequent query pattern in the CRM:
 *   "Give me all leads owned by user X with status Y"
 *
 * Having `owner` first supports prefix queries (all leads for a user)
 * and the combination accelerates Kanban-board and pipeline-filter views.
 */
leadSchema.index({ owner: 1, status: 1 });

/**
 * Compound index on `owner` + `createdAt`.
 *
 * Optimises default paginated queries that list a user's leads sorted
 * by creation date (newest first).
 */
leadSchema.index({ owner: 1, createdAt: -1 });

/**
 * Compound index on `owner` + `source`.
 *
 * Speeds up filtering a user's leads by their acquisition channel.
 */
leadSchema.index({ owner: 1, source: 1 });

/**
 * Compound indexes on `owner` + text fields.
 *
 * Accelerates case-insensitive partial match search and autocomplete queries
 * (e.g. matching on name, company, or email) under owner isolation.
 */
leadSchema.index({ owner: 1, name: 1 });
leadSchema.index({ owner: 1, company: 1 });
leadSchema.index({ owner: 1, email: 1 });

/**
 * Single-field index on `email`.
 *
 * Accelerates duplicate-detection and lead-lookup-by-email operations,
 * which are common during CSV imports and deduplication workflows.
 */
leadSchema.index({ email: 1 });

/* ───────────────────────────────  Exports  ───────────────────────────────── */

/** Compiled Mongoose model for the 'leads' collection. */
const Lead = model('Lead', leadSchema);

export { Lead, leadSchema };
export default Lead;
