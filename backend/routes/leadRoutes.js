/**
 * @fileoverview Lead CRUD routes for Startup CRM Lite.
 *
 * All routes are mounted under /api/leads in server.js.
 * ALL routes are protected by the `protect` middleware applied at the router
 * level via `router.use(protect)` — no route in this file is publicly accessible.
 *
 * Route table:
 *   GET    /api/leads                – paginated, filterable list
 *   POST   /api/leads                – create a new lead
 *   GET    /api/leads/stats          – aggregated pipeline statistics
 *   GET    /api/leads/monthly-stats  – last-6-months bar chart data
 *   GET    /api/leads/:id            – single lead by id
 *   PATCH  /api/leads/:id            – full / partial field update
 *   PATCH  /api/leads/:id/status     – status-only fast update (Kanban)
 *   DELETE /api/leads/:id            – hard delete
 *
 * PRODUCTION NOTE: Add express-rate-limit here to cap per-user request rates
 * and protect the list/search endpoint from abuse:
 *
 *   import rateLimit from 'express-rate-limit';
 *   const leadsLimiter = rateLimit({
 *     windowMs: 60 * 1000,  // 1 minute
 *     max: 60,              // 60 requests per minute per IP
 *     standardHeaders: true,
 *     legacyHeaders: false,
 *   });
 *   router.use(leadsLimiter);
 */

import { Router }   from 'express';
import { body, param } from 'express-validator';

import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats,
  searchLeads,
} from '../controllers/leadController.js';

import { protect }  from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

/* ─────────────────────────────  Auth Guard  ──────────────────────────────── */

/**
 * Apply the JWT protect middleware to every route in this file.
 * Any request without a valid Bearer token is rejected with 401 before it
 * reaches any controller or validator below.
 */
router.use(protect);

/* ──────────────────────────  Validation Rules  ────────────────────────────── */

/** Reusable valid status values (mirrors Lead model enum). */
const VALID_STATUSES = [
  'New',
  'Contacted',
  'Meeting Scheduled',
  'Proposal Sent',
  'Won',
  'Lost',
];

/** Reusable valid source values (mirrors Lead model enum). */
const VALID_SOURCES = [
  'Website',
  'Referral',
  'LinkedIn',
  'Cold Call',
  'Email Campaign',
  'Other',
];

/**
 * Validation chains for POST /api/leads (create).
 * Required fields: name, company, email.
 * Optional fields: phone, status, source, notes.
 *
 * @type {import('express-validator').ValidationChain[]}
 */
const createLeadValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Lead name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address'),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Phone must be a string'),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('source')
    .optional()
    .isIn(VALID_SOURCES)
    .withMessage(`Source must be one of: ${VALID_SOURCES.join(', ')}`),

  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
];

/**
 * Validation chains for PATCH /api/leads/:id (full update).
 * All fields are optional so partial updates are supported.
 *
 * @type {import('express-validator').ValidationChain[]}
 */
const updateLeadValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('company')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email must be a valid email address'),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Phone must be a string'),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('source')
    .optional()
    .isIn(VALID_SOURCES)
    .withMessage(`Source must be one of: ${VALID_SOURCES.join(', ')}`),

  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
];

/**
 * Validation chains for PATCH /api/leads/:id/status (status-only update).
 *
 * @type {import('express-validator').ValidationChain[]}
 */
const updateStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
];

/**
 * Shared param validation for routes that accept /:id.
 *
 * @type {import('express-validator').ValidationChain[]}
 */
const idParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID'),
];

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Collection routes  (no :id)                                               */
/* ══════════════════════════════════════════════════════════════════════════ */

/**
 * GET /api/leads/stats
 *
 * Aggregated pipeline stats for the Dashboard StatsCard components.
 * Must be declared BEFORE /:id routes to prevent Express matching
 * the string "stats" as an ObjectId parameter.
 */
router.get('/stats', getLeadStats);

/**
 * GET /api/leads/monthly-stats
 *
 * Last-6-months chart data for the Analytics page.
 * Must be declared BEFORE /:id routes for the same reason as /stats.
 */
router.get('/monthly-stats', getMonthlyStats);

/**
 * GET /api/leads/search
 *
 * Autocomplete quick search for leads.
 * Must be declared BEFORE /:id routes to prevent Express matching
 * the string "search" as an ObjectId parameter.
 */
router.get('/search', searchLeads);

/**
 * GET /api/leads
 *
 * Paginated, filterable list of leads owned by the current user.
 * Query params: status, search, page, limit, sortBy, sortOrder
 */
router.get('/', getLeads);

/**
 * POST /api/leads
 *
 * Create a new lead. Validated then forwarded to createLead controller.
 */
router.post('/', validate(createLeadValidation), createLead);

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Document routes  (with :id)                                               */
/* ══════════════════════════════════════════════════════════════════════════ */

/**
 * GET /api/leads/:id
 *
 * Retrieve a single lead. Returns 404 if not found or not owned by the user.
 */
router.get('/:id', validate(idParamValidation), getLeadById);

/**
 * PATCH /api/leads/:id
 *
 * Full / partial update of lead fields. Owner field is stripped by the controller.
 */
router.patch('/:id', validate(updateLeadValidation), updateLead);

/**
 * PATCH /api/leads/:id/status
 *
 * Fast-path status-only update for Kanban board drag-and-drop.
 */
router.patch('/:id/status', validate(updateStatusValidation), updateLeadStatus);

/**
 * DELETE /api/leads/:id
 *
 * Permanently delete a lead. Returns 404 if not owned by the user.
 */
router.delete('/:id', validate(idParamValidation), deleteLead);

/* ───────────────────────────────  Export  ────────────────────────────────── */

export default router;
