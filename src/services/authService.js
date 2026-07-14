/**
 * @fileoverview Auth service — thin wrapper around the /api/auth backend endpoints.
 *
 * Every function calls the shared Axios instance (`api`) so that the JWT
 * interceptor and global error handling defined in api.js apply automatically.
 *
 * API endpoints used (all mounted under /api/auth in backend/routes/authRoutes.js):
 *   POST   /api/auth/register  – create account
 *   POST   /api/auth/login     – authenticate and receive a JWT
 *   GET    /api/auth/me        – return the current user's profile
 *   PATCH  /api/auth/me        – update name / password
 *
 * All functions return `response.data` (the unwrapped Axios response body),
 * so callers work with the plain JSON payload from the server.
 */

import api from './api';

/* ────────────────────────────  register  ─────────────────────────────────── */

/**
 * Create a new user account.
 *
 * @param {string} name     - Display name (2–50 chars)
 * @param {string} email    - Valid email address
 * @param {string} password - Plain-text password (min 6 chars; hashed server-side)
 * @returns {Promise<{ success: boolean, token: string, user: object, message: string }>}
 * @throws {import('axios').AxiosError} On 4xx / 5xx HTTP errors or network failures
 */
export const register = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  return response.data;
};

/* ─────────────────────────────  login  ───────────────────────────────────── */

/**
 * Authenticate with email and password.
 *
 * @param {string} email    - Registered email address
 * @param {string} password - Plain-text password
 * @returns {Promise<{ success: boolean, token: string, user: object, message: string }>}
 * @throws {import('axios').AxiosError} On invalid credentials (401) or other errors
 */
export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

/* ────────────────────────────  logout  ───────────────────────────────────── */

/**
 * Clear the JWT from localStorage.
 *
 * The backend is stateless (no server-side session), so the only required
 * cleanup is removing the token from the browser's localStorage.
 * AuthContext.logout() calls this before clearing its own state.
 *
 * @returns {void}
 */
export const logout = () => {
  localStorage.removeItem('crm-token');
  localStorage.removeItem('crm-user');
};

/* ───────────────────────────  getProfile  ────────────────────────────────── */

/**
 * Fetch the authenticated user's profile.
 *
 * The JWT is attached automatically by the Axios request interceptor.
 * Endpoint: GET /api/auth/me (note: the backend uses /me, not /profile)
 *
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 * @throws {import('axios').AxiosError} On 401 (token invalid/expired) or network failure
 */
export const getProfile = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

/* ──────────────────────────  updateProfile  ──────────────────────────────── */

/**
 * Update the authenticated user's name and/or password.
 *
 * To change the password supply both `currentPassword` and `newPassword`.
 * To update only the name, supply just `{ name }`.
 *
 * Endpoint: PATCH /api/auth/me
 *
 * @param {{ name?: string, currentPassword?: string, newPassword?: string }} data
 * @returns {Promise<{ success: boolean, data: object, message: string }>}
 * @throws {import('axios').AxiosError} On validation errors (400), wrong password (401), etc.
 */
export const updateProfile = async (data) => {
  const response = await api.patch('/api/auth/me', data);
  return response.data;
};
