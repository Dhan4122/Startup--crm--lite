/**
 * @fileoverview Configured Axios instance — the single HTTP client for the entire app.
 *
 * This module creates one shared Axios instance so that every API call
 * automatically benefits from:
 *   1. A base URL resolved from the Vite environment variable VITE_API_URL.
 *   2. A request interceptor that injects the Bearer token stored in localStorage.
 *   3. A response interceptor that handles 401 (session expired) and network errors.
 *
 * Usage:
 *   import api from '../services/api';
 *   const { data } = await api.get('/api/leads');
 */

import axios from 'axios';
import toast from 'react-hot-toast';

/* ─────────────────────────────  Instance  ────────────────────────────────── */

/**
 * Shared Axios instance.
 * `baseURL` is set at build-time via the VITE_API_URL environment variable
 * (see src/.env).  All relative request paths are resolved against this base.
 *
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // A sensible default timeout prevents requests from hanging indefinitely.
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ─────────────────────────  Request Interceptor  ─────────────────────────── */

/**
 * Attaches the JWT Bearer token to every outgoing request.
 *
 * The token is read from localStorage on each request (not cached in memory)
 * so that a token change (e.g. re-login) is picked up immediately without
 * needing to recreate the Axios instance.
 *
 * Token storage key: 'crm-token'  (matches AuthContext and authService)
 */
api.interceptors.request.use(
  (config) => {
    // Read the stored token on every request
    const token = localStorage.getItem('crm-token');

    if (token) {
      // Attach as a standard RFC 6750 Bearer credential
      config.headers.Authorization = 'Bearer ' + token;
    }

    return config;
  },
  (error) => {
    // Request setup itself failed (e.g. malformed config) — forward the error
    return Promise.reject(error);
  }
);

/* ─────────────────────────  Response Interceptor  ────────────────────────── */

/**
 * Global response error handler.
 *
 * Two distinct scenarios are handled here so that individual service functions
 * do not need to duplicate this logic:
 *
 *   401 — The token is missing, expired, or invalid.
 *         Action: clear localStorage and redirect to /login so the user can
 *         re-authenticate.  A toast is NOT shown here because the Login page
 *         itself communicates what happened.
 *
 *   Network error (no response) — The server is unreachable.
 *         Action: show a persistent error toast so the user knows immediately.
 *
 * All other errors are forwarded to the calling service function where they
 * can be handled with more context (e.g. show a form validation message).
 */
api.interceptors.response.use(
  // ── Success path: pass through unchanged ──────────────────────────────────
  (response) => response,

  // ── Error path ────────────────────────────────────────────────────────────
  (error) => {
    if (error.response) {
      // The server responded with an HTTP error status
      const { status } = error.response;

      if (status === 401) {
        // Session expired or token invalid → force re-login
        localStorage.removeItem('crm-token');
        localStorage.removeItem('crm-user');

        // Only redirect if we are not already on the login page to avoid
        // an infinite redirect loop.
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
      // All other HTTP errors (400, 403, 404, 500 …) bubble up to the caller.
    } else if (error.request) {
      // The request was made but no response was received (network failure,
      // server down, DNS error, CORS preflight blocked, etc.)
      toast.error('Cannot connect to server. Check your connection.', {
        id: 'network-error', // deduplicate: only one toast even on rapid retries
        duration: 5000,
      });
    }
    // Forward the error so service functions can still catch it
    return Promise.reject(error);
  }
);

/* ────────────────────────────────  Export  ───────────────────────────────── */

export default api;
