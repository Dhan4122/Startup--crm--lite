/**
 * @fileoverview Lead CRUD controller for Startup CRM Lite.
 *
 * Every endpoint enforces owner isolation by scoping ALL database queries
 * to { owner: req.user._id }. A lead belonging to a different user is
 * indistinguishable from a non-existent lead from the caller's perspective
 * (both return 404), which prevents cross-user data enumeration.
 *
 * Exported handlers:
 *   getLeads          – paginated, filterable list  (GET  /api/leads)
 *   createLead        – create a new lead           (POST /api/leads)
 *   getLeadById       – single lead by id           (GET  /api/leads/:id)
 *   updateLead        – full/partial update         (PATCH /api/leads/:id)
 *   updateLeadStatus  – status-only fast update     (PATCH /api/leads/:id/status)
 *   deleteLead        – soft-less hard delete       (DELETE /api/leads/:id)
 *   getLeadStats      – aggregated pipeline stats   (GET  /api/leads/stats)
 *   getMonthlyStats   – last-6-months bar data      (GET  /api/leads/monthly-stats)
 */

import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from '../utils/apiResponse.js';

/* ─────────────────────────────  Constants  ───────────────────────────────── */

/** Valid pipeline status values (mirrors Lead model enum). */
const VALID_STATUSES = [
  'New',
  'Contacted',
  'Meeting Scheduled',
  'Proposal Sent',
  'Won',
  'Lost',
];

/** Short month names ordered Jan → Dec for chart labelling. */
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/* ─────────────────────────────  Dev Logger  ──────────────────────────────── */

/**
 * Logs a message to console only in development mode.
 *
 * @param {string} label  - Short label describing the operation.
 * @param {*}      [data] - Optional data to log alongside the label.
 */
const devLog = (label, data) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[LeadController] ${label}`, data ?? '');
  }
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  GET /api/leads                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Retrieve a paginated, optionally filtered list of leads owned by the
 * current user.
 *
 * Query parameters:
 *   @param {number}  [page=1]            - 1-based page number.
 *   @param {number}  [limit=20]          - Records per page (max enforced to 100).
 *   @param {string}  [sortBy='createdAt'] - Field to sort on.
 *   @param {string}  [sortOrder='desc']   - 'asc' or 'desc'.
 *   @param {string}  [status]             - Filter by pipeline status. Omit or 'All' for all.
 *   @param {string}  [search]             - Case-insensitive partial match on name, company, email.
 *   @param {string}  [source]             - Filter by lead acquisition source. Omit or 'All' for all.
 *   @param {string}  [dateFrom]           - Filter leads created on or after this ISO date string.
 *   @param {string}  [dateTo]             - Filter leads created on or before this ISO date string.
 *
 * Returns: paginatedResponse → { success, data: leads[], pagination: { total, page, limit, pages, hasNext, hasPrev } }
 *
 * @type {import('express').RequestHandler}
 */
const getLeads = async (req, res, next) => {
  try {
    const {
      page      = 1,
      limit     = 20,
      sortBy    = 'createdAt',
      sortOrder = 'desc',
      status,
      search,
      source,
      dateFrom,
      dateTo,
    } = req.query;

    // ── Pagination sanitisation ─────────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page, 10)  || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip     = (pageNum - 1) * limitNum;

    // ── Base filter: always scope to the authenticated user ─────────────────
    const filter = { owner: req.user._id };

    // ── Dynamic status filter ──────────────────────────────────────────────
    if (status && status !== 'All') {
      filter.status = status;
    }

    // ── Dynamic source filter ──────────────────────────────────────────────
    if (source && source !== 'All') {
      filter.source = source;
    }

    // ── Dynamic date filters ────────────────────────────────────────────────
    if (dateFrom && !isNaN(Date.parse(dateFrom))) {
      filter.createdAt = filter.createdAt || {};
      filter.createdAt.$gte = new Date(dateFrom);
    }
    if (dateTo && !isNaN(Date.parse(dateTo))) {
      filter.createdAt = filter.createdAt || {};
      filter.createdAt.$lte = new Date(dateTo);
    }

    // ── Dynamic search filter ───────────────────────────────────────────────
    if (search && search.trim()) {
      filter.$or = [
        { name:    { $regex: search.trim(), $options: 'i' } },
        { company: { $regex: search.trim(), $options: 'i' } },
        { email:   { $regex: search.trim(), $options: 'i' } },
      ];
    }

    devLog('getLeads filter', filter);

    // ── Sort direction ──────────────────────────────────────────────────────
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortDirection };

    // ── Execute query + count in parallel for performance ───────────────────
    const [leads, total] = await Promise.all([
      Lead.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    devLog(`getLeads → ${leads.length} / ${total} leads`);

    return paginatedResponse(res, leads, total, pageNum, limitNum);
  } catch (error) {
    return next(error);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  POST /api/leads                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Create a new lead and assign it to the authenticated user.
 *
 * Inputs  (req.body): name, company, email, phone?, status?, source?, notes?
 * Outputs: 201 JSON { success, message, data: lead }
 *
 * The owner field is taken exclusively from req.user._id (set by the protect
 * middleware) and cannot be overridden by the client request body.
 *
 * @type {import('express').RequestHandler}
 */
const createLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, status, source, notes } = req.body;

    devLog('createLead body', { name, company, email, status, source });

    const lead = await Lead.create({
      name,
      company,
      email,
      phone,
      status,
      source,
      notes,
      owner: req.user._id, // always set from auth context, never from body
    });

    return successResponse(res, lead, 'Lead created successfully', 201);
  } catch (error) {
    return next(error);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  GET /api/leads/:id                                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Retrieve a single lead by its MongoDB _id.
 *
 * Inputs  (req.params): id – 24-char hex MongoDB ObjectId
 * Outputs: 200 JSON { success, data: lead } | 404 if not found
 *
 * Owner isolation: the query includes { owner: req.user._id } so leads
 * belonging to other users return 404 rather than 403, preventing enumeration.
 *
 * @type {import('express').RequestHandler}
 */
const getLeadById = async (req, res, next) => {
  try {
    devLog('getLeadById', req.params.id);

    const lead = await Lead.findOne({
      _id:   req.params.id,
      owner: req.user._id,
    });

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  PATCH /api/leads/:id                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Update any field(s) on a lead owned by the current user.
 *
 * Inputs  (req.params): id
 * Inputs  (req.body):   any subset of { name, company, email, phone, status, source, notes }
 *                       NOTE: 'owner' in the body is silently stripped.
 * Outputs: 200 JSON { success, data: updatedLead } | 404 if not found
 *
 * Uses findOneAndUpdate with { new: true, runValidators: true } so that:
 *   • `new: true`          – returns the post-update document.
 *   • `runValidators: true`– Mongoose schema validators run on the new values.
 *
 * @type {import('express').RequestHandler}
 */
const updateLead = async (req, res, next) => {
  try {
    devLog('updateLead', { id: req.params.id, body: req.body });

    // Strip the owner field from the request body to prevent privilege escalation.
    const { owner: _stripped, ...updateData } = req.body; // eslint-disable-line no-unused-vars

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updateData,
      { new: true, runValidators: true },
    );

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead updated successfully');
  } catch (error) {
    return next(error);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  PATCH /api/leads/:id/status                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Fast-path status update for Kanban drag-and-drop operations.
 *
 * Accepts only { status } in the request body. Using a dedicated endpoint
 * keeps the Kanban controller logic simple and avoids accidental field
 * overwrites from broader update payloads.
 *
 * Inputs  (req.params): id
 * Inputs  (req.body):   { status } – must be one of VALID_STATUSES
 * Outputs: 200 JSON { success, data: updatedLead } | 400 | 404
 *
 * @type {import('express').RequestHandler}
 */
const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    devLog('updateLeadStatus', { id: req.params.id, status });

    // ── Validate status value ───────────────────────────────────────────────
    if (!status || !VALID_STATUSES.includes(status)) {
      return errorResponse(
        res,
        `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        400,
      );
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status },
      { new: true, runValidators: true },
    );

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, `Lead status updated to '${status}'`);
  } catch (error) {
    return next(error);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  DELETE /api/leads/:id                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Permanently delete a lead owned by the current user.
 *
 * Inputs  (req.params): id
 * Outputs: 200 JSON { success, message } | 404 if not found
 *
 * Uses document-level deleteOne() rather than a static query so that any
 * Mongoose pre/post 'deleteOne' middleware hooks fire correctly.
 *
 * @type {import('express').RequestHandler}
 */
const deleteLead = async (req, res, next) => {
  try {
    devLog('deleteLead', req.params.id);

    const lead = await Lead.findOne({
      _id:   req.params.id,
      owner: req.user._id,
    });

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    await lead.deleteOne();

    return successResponse(res, null, 'Lead deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  GET /api/leads/stats                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Return aggregated pipeline statistics for the authenticated user's leads.
 *
 * Outputs a stats object with the shape the Dashboard StatsCard components
 * expect:
 * ```json
 * {
 *   "totalLeads": 42,
 *   "wonLeads": 10,
 *   "lostLeads": 5,
 *   "conversionRate": 23.81,
 *   "byStatus": {
 *     "New": 12,
 *     "Contacted": 8,
 *     "Meeting Scheduled": 5,
 *     "Proposal Sent": 7,
 *     "Won": 10,
 *     "Lost": 0
 *   }
 * }
 * ```
 *
 * conversionRate = (wonLeads / totalLeads) * 100, rounded to 2 decimal places.
 * Returns 0 when totalLeads is 0 to avoid division-by-zero.
 *
 * @type {import('express').RequestHandler}
 */
/**
 * Return aggregated pipeline statistics for the authenticated user's leads.
 *
 * Use Lead.aggregate() to return in a SINGLE database query:
 *   - totalLeads      - Total count of leads for this user
 *   - statusBreakdown - Map of status count { New: 5, Contacted: 3, Won: 10, ... }
 *   - conversionRate  - (won / total) * 100, rounded to 1 decimal place
 *   - sourceBreakdown - Map of source count { Website: 8, LinkedIn: 5, ... }
 *   - thisMonthLeads  - Count of leads created in the current calendar month
 *   - lastMonthLeads  - Count of leads created in the previous calendar month
 *   - growthRate      - ((thisMonth - lastMonth) / lastMonth) * 100, rounded to 1 decimal place
 *
 * Inputs  (req.user): _id - Authenticated user's ObjectId
 * Outputs: 200 JSON { success, message, data: { totalLeads, statusBreakdown, conversionRate, sourceBreakdown, thisMonthLeads, lastMonthLeads, growthRate } }
 *
 * @type {import('express').RequestHandler}
 */
const getLeadStats = async (req, res, next) => {
  try {
    devLog('getLeadStats user', req.user._id);

    const ownerId = new mongoose.Types.ObjectId(req.user._id);

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const aggregationResult = await Lead.aggregate([
      { $match: { owner: ownerId } },
      {
        $facet: {
          total: [
            { $count: 'count' }
          ],
          statusGroup: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          sourceGroup: [
            { $group: { _id: '$source', count: { $sum: 1 } } }
          ],
          thisMonth: [
            { $match: { createdAt: { $gte: startOfThisMonth } } },
            { $count: 'count' }
          ],
          lastMonth: [
            {
              $match: {
                createdAt: {
                  $gte: startOfLastMonth,
                  $lt: startOfThisMonth
                }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]);

    const result = aggregationResult[0] || {};

    const totalLeads = result.total?.[0]?.count || 0;
    const thisMonthLeads = result.thisMonth?.[0]?.count || 0;
    const lastMonthLeads = result.lastMonth?.[0]?.count || 0;

    // ── Build status breakdown ──────────────────────────────────────────────
    const statusBreakdown = VALID_STATUSES.reduce((acc, s) => {
      acc[s] = 0;
      return acc;
    }, {});
    if (result.statusGroup) {
      result.statusGroup.forEach(({ _id, count }) => {
        if (_id && _id in statusBreakdown) {
          statusBreakdown[_id] = count;
        }
      });
    }

    // ── Build source breakdown ──────────────────────────────────────────────
    const VALID_SOURCES = [
      'Website',
      'Referral',
      'LinkedIn',
      'Cold Call',
      'Email Campaign',
      'Other',
    ];
    const sourceBreakdown = VALID_SOURCES.reduce((acc, s) => {
      acc[s] = 0;
      return acc;
    }, {});
    if (result.sourceGroup) {
      result.sourceGroup.forEach(({ _id, count }) => {
        if (_id && _id in sourceBreakdown) {
          sourceBreakdown[_id] = count;
        }
      });
    }

    // ── Calculate conversion rate ───────────────────────────────────────────
    const wonLeads = statusBreakdown['Won'] || 0;
    const conversionRate = totalLeads > 0
      ? parseFloat(((wonLeads / totalLeads) * 100).toFixed(1))
      : 0.0;

    // ── Calculate growth rate ───────────────────────────────────────────────
    // growthRate = ((thisMonth - lastMonth) / lastMonth) * 100
    // Handle division by zero. If last month is 0 and this month is > 0, growth rate is 100.0%. If both are 0, it's 0.0%
    const growthRate = lastMonthLeads > 0
      ? parseFloat((((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100).toFixed(1))
      : (thisMonthLeads > 0 ? 100.0 : 0.0);

    const stats = {
      totalLeads,
      statusBreakdown,
      conversionRate,
      sourceBreakdown,
      thisMonthLeads,
      lastMonthLeads,
      growthRate,
    };

    devLog('getLeadStats result', stats);

    return successResponse(res, stats, 'Stats retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  GET /api/leads/monthly-stats                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Return per-month lead statistics for the last 6 calendar months (inclusive of
 * the current month), shaped for analytics trends.
 *
 * Use Lead.aggregate() to retrieve data grouped by year and month.
 *
 * Each month in the returned array contains:
 *   - month: string label (e.g., 'Jan 2025')
 *   - total: total number of leads created in that month
 *   - won: number of won leads created in that month
 *   - lost: number of lost leads created in that month
 *   - conversionRate: percentage of won leads over total leads, rounded to 1 decimal place
 *
 * Output array is always exactly 6 elements, ordered oldest → newest.
 * Months with no leads are included with zeroed metrics.
 *
 * Inputs  (req.user): _id - Authenticated user's ObjectId
 * Outputs: 200 JSON { success, message, data: Array<{ month, total, won, lost, conversionRate }> }
 *
 * @type {import('express').RequestHandler}
 */
const getMonthlyStats = async (req, res, next) => {
  try {
    devLog('getMonthlyStats user', req.user._id);

    const ownerId = new mongoose.Types.ObjectId(req.user._id);

    // ── Compute 6-month window ──────────────────────────────────────────────
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    startDate.setHours(0, 0, 0, 0);

    const pipeline = [
      // Stage 1: owner + date range
      {
        $match: {
          owner:     ownerId,
          createdAt: { $gte: startDate },
        },
      },
      // Stage 2: group by year + month
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' }, // 1-based (1=Jan … 12=Dec)
          },
          total: { $sum: 1 },
          won: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Won'] }, 1, 0],
            },
          },
          lost: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0],
            },
          },
        },
      },
      // Stage 3: deterministic ordering
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ];

    const raw = await Lead.aggregate(pipeline);

    // ── Build result map keyed by "YYYY-M" ─────────────────────────────────
    const dataMap = {};
    raw.forEach(({ _id, total, won, lost }) => {
      dataMap[`${_id.year}-${_id.month}`] = { total, won, lost };
    });

    // ── Produce a slot for every month in the window ────────────────────────
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth(); // 0-based index
      const key = `${year}-${monthIndex + 1}`;
      const label = `${MONTH_NAMES[monthIndex]} ${year}`;

      const slot = dataMap[key] || { total: 0, won: 0, lost: 0 };
      const total = slot.total;
      const won = slot.won;
      const lost = slot.lost;
      const conversionRate = total > 0
        ? parseFloat(((won / total) * 100).toFixed(1))
        : 0.0;

      result.push({
        month: label,
        total,
        won,
        lost,
        conversionRate,
      });
    }

    devLog('getMonthlyStats result', result);

    return successResponse(res, result, 'Monthly stats retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  GET /api/leads/search                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Autocomplete quick-search endpoint.
 *
 * Query parameters:
 *   @param {string} q       - Case-insensitive search query (matches name, company, or email).
 *   @param {number} [limit=5] - Maximum number of results to return (defaults to 5, capped at 50).
 *
 * Returns: successResponse → { success, message, data: Array<{ _id, name, company, email, status }> }
 *
 * @type {import('express').RequestHandler}
 */
const searchLeads = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 5));

    // Base query scoped to the authenticated owner
    const query = { owner: req.user._id };

    if (q && q.trim()) {
      const regex = { $regex: q.trim(), $options: 'i' };
      query.$or = [
        { name:    regex },
        { company: regex },
        { email:   regex },
      ];
    } else {
      // If no query parameter is provided, return an empty array for autocomplete
      return successResponse(res, [], 'Search query is empty');
    }

    devLog('searchLeads query', { query, limitNum });

    const leads = await Lead.find(query)
      .select('_id name company email status')
      .limit(limitNum);

    devLog(`searchLeads → found ${leads.length} leads`);

    return successResponse(res, leads, 'Search results retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/* ───────────────────────────────  Exports  ───────────────────────────────── */

export {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats,
  searchLeads,
};
