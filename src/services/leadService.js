/**
 * @fileoverview Lead service — thin wrapper around the /api/leads backend endpoints.
 *
 * Every function uses the shared Axios instance from api.js so that the JWT
 * Authorization header is injected automatically on every request.
 *
 * API endpoints (all mounted under /api/leads in backend/routes/leadRoutes.js):
 *   GET    /api/leads                – paginated + filtered list
 *   POST   /api/leads                – create a new lead
 *   PUT    /api/leads/:id            – full field update  (maps to PATCH on backend)
 *   PATCH  /api/leads/:id/status     – fast status-only update
 *   DELETE /api/leads/:id            – hard delete
 *   GET    /api/leads/stats          – aggregated KPI stats
 *   GET    /api/leads/monthly-stats  – last-6-months chart data
 *
 * Note: The backend uses PATCH for both full and partial updates; this service
 * names the full-update function `updateLead` (called via PUT by convention in
 * the requirement) but still issues a PATCH HTTP request, matching the backend route.
 *
 * All functions return `response.data` (unwrapped Axios response body).
 */

import api from './api';

/* ─────────────────────────────  getLeads  ────────────────────────────────── */

/**
 * Fetch a paginated, filterable list of leads owned by the current user.
 *
 * @param {{ status?: string, search?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string }} [params={}]
 *   Query parameters forwarded directly to the backend.
 * @returns {Promise<{ success: boolean, count: number, data: Lead[], pagination: object }>}
 */
export const getLeads = async (params = {}) => {
  const response = await api.get('/api/leads', { params });
  return response.data;
};

/* ────────────────────────────  createLead  ───────────────────────────────── */

/**
 * Create a new lead record.
 *
 * @param {{ name: string, company: string, email: string, phone?: string, status?: string, source?: string, value?: number, notes?: string }} leadData
 * @returns {Promise<{ success: boolean, data: Lead }>}
 */
export const createLead = async (leadData) => {
  const response = await api.post('/api/leads', leadData);
  return response.data;
};

/* ─────────────────────────────  updateLead  ──────────────────────────────── */

/**
 * Perform a full / partial update of a lead record.
 *
 * @param {string} id          - MongoDB ObjectId of the lead to update
 * @param {Partial<Lead>} leadData - Fields to update (all optional; only changed fields need be sent)
 * @returns {Promise<{ success: boolean, data: Lead }>}
 */
export const updateLead = async (id, leadData) => {
  // Backend uses PATCH for both full and partial updates
  const response = await api.patch(`/api/leads/${id}`, leadData);
  return response.data;
};

/* ──────────────────────────  updateLeadStatus  ───────────────────────────── */

/**
 * Fast-path status-only update (used by Kanban drag-and-drop, quick status pills, etc.).
 *
 * @param {string} id     - MongoDB ObjectId of the lead
 * @param {string} status - New status value (must be one of the backend enum values)
 * @returns {Promise<{ success: boolean, data: Lead }>}
 */
export const updateLeadStatus = async (id, status) => {
  const response = await api.patch(`/api/leads/${id}/status`, { status });
  return response.data;
};

/* ────────────────────────────  deleteLead  ───────────────────────────────── */

/**
 * Permanently delete a lead record.
 *
 * @param {string} id - MongoDB ObjectId of the lead to delete
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteLead = async (id) => {
  const response = await api.delete(`/api/leads/${id}`);
  return response.data;
};

/* ────────────────────────────  getLeadStats  ─────────────────────────────── */

/**
 * Aggregated pipeline statistics for the Dashboard KPI cards.
 * Backend route: GET /api/leads/stats
 *
 * @returns {Promise<{ success: boolean, data: { total: number, active: number, won: number, pipelineValue: number, wonValue: number } }>}
 */
export const getLeadStats = async () => {
  const response = await api.get('/api/leads/stats');
  return response.data;
};

/* ───────────────────────────  getMonthlyStats  ───────────────────────────── */

/**
 * Last-6-months chart data for the Analytics page bar chart.
 * Backend route: GET /api/leads/monthly-stats
 *
 * @returns {Promise<{ success: boolean, data: Array<{ month: string, leads: number, value: number }> }>}
 */
export const getMonthlyStats = async () => {
  const response = await api.get('/api/leads/monthly-stats');
  return response.data;
};
