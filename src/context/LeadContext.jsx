/**
 * @fileoverview LeadContext — global state management for CRM lead records.
 *
 * UPDATED: This version replaces the localStorage-backed useLocalStorage hook
 * with real API calls to the Express backend via leadService.js.
 * The context shape is intentionally kept identical to the previous version
 * so that all existing consumer components (Leads.jsx, Dashboard.jsx, Sidebar.jsx,
 * Analytics.jsx, etc.) continue to work without any changes.
 *
 * New state additions:
 *   isLoading  – true while an API request is in-flight
 *   pagination – pagination metadata returned by GET /api/leads
 *
 * Lead object shape (same as before):
 * @typedef {Object} Lead
 * @property {string}  id        - Unique identifier (MongoDB _id)
 * @property {string}  name      - Full name of the lead contact
 * @property {string}  company   - Company / organisation name
 * @property {string}  email     - Contact email address
 * @property {string}  phone     - Contact phone number
 * @property {number}  value     - Estimated deal value in USD
 * @property {'New'|'Contacted'|'Meeting Scheduled'|'Proposal Sent'|'Won'|'Lost'} status
 * @property {'Website'|'Referral'|'LinkedIn'|'Cold Call'|'Email Campaign'|'Other'} source
 * @property {string}  owner        - Team member responsible
 * @property {string}  lastContacted - ISO 8601 date-time of last contact
 * @property {string}  createdAt     - ISO 8601 date-time when created
 * @property {string}  [notes]       - Optional free-text notes
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import toast from 'react-hot-toast';

import * as leadService from '../services/leadService';

/* ─────────────────────────────  Context  ─────────────────────────────────── */

/**
 * @type {React.Context<{
 *   leads: Lead[],
 *   activities: Activity[],
 *   isLoading: boolean,
 *   pagination: object,
 *   fetchLeads: (params?: object) => Promise<void>,
 *   addLead: (data: object) => Promise<void>,
 *   updateLead: (id: string, data: Partial<Lead>) => Promise<void>,
 *   deleteLead: (id: string) => Promise<void>,
 *   getLeadById: (id: string) => Lead | undefined
 * } | undefined>}
 */
const LeadContext = createContext(undefined);

/* ─────────────────────────────  Provider  ────────────────────────────────── */

/**
 * LeadProvider — supplies all lead data and CRUD operations to the component tree.
 *
 * On mount it fetches the first page of leads from the API.
 * Every mutation (add / update / delete) calls the corresponding API endpoint
 * and then refreshes the local state optimistically or from the server response.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.JSX.Element}
 */
export function LeadProvider({ children }) {
  // ── State ──────────────────────────────────────────────────────────────────

  /** @type {[Lead[], React.Dispatch<React.SetStateAction<Lead[]>>]} */
  const [leads, setLeads] = useState([]);

  /**
   * Activities are kept in local state only for now (no backend endpoint).
   * This preserves backward-compat with Dashboard's RecentLeads component.
   * @type {[object[], React.Dispatch<React.SetStateAction<object[]>>]}
   */
  const [activities, setActivities] = useState([]);

  /** True while an API call is in-flight */
  const [isLoading, setIsLoading] = useState(false);

  /** Pagination metadata from the last getLeads response */
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    pages: 1,
  });

  // ── Activity logger (local-only) ───────────────────────────────────────────

  /**
   * Append an entry to the in-memory activity feed.
   * Capped at 50 entries (most-recent first) to avoid unbounded growth.
   *
   * @param {string} leadId
   * @param {string} leadName
   * @param {'lead_created'|'status_change'|'note_added'|'value_updated'} type
   * @param {string} content
   */
  const logActivity = useCallback((leadId, leadName, type, content) => {
    const newActivity = {
      id: `act-${crypto.randomUUID?.() ?? Date.now()}`,
      leadId,
      leadName,
      type,
      content,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 50));
  }, []);

  // ── fetchLeads ─────────────────────────────────────────────────────────────

  /**
   * Load leads from the backend.
   * Accepts any query params supported by GET /api/leads
   * (status, search, page, limit, sortBy, sortOrder).
   *
   * Called automatically on mount and can be called again with different
   * params for filtering / pagination.
   *
   * @param {object} [params={}] - Query parameters to forward to the API
   * @returns {Promise<void>}
   */
  const fetchLeads = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      // Fetch up to 100 leads per page (matches the previous localStorage limit)
      const data = await leadService.getLeads({ limit: 100, ...params });

      // The backend returns leads in data.data; normalise _id → id for compat
      const normalised = (data.data || []).map((lead) => ({
        ...lead,
        // Preserve _id as id so existing components using lead.id continue to work
        id: lead._id || lead.id,
      }));

      setLeads(normalised);

      // Store pagination metadata if provided by the backend
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      // Network / 401 errors are already handled by the api.js interceptor.
      // Only show a toast for unexpected errors (5xx, etc.).
      const message = error?.response?.data?.message || 'Failed to load leads';
      toast.error(message);
      console.error('[LeadContext] fetchLeads error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Auto-fetch on mount ────────────────────────────────────────────────────

  /**
   * Fetch leads when the provider first mounts.
   * If the user is not authenticated, the API returns 401 and the Axios
   * interceptor handles the redirect to /login automatically.
   */
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ── addLead ────────────────────────────────────────────────────────────────

  /**
   * Create a new lead via the API and prepend it to local state on success.
   *
   * @param {Omit<Lead, 'id'|'_id'|'createdAt'|'lastContacted'>} data
   * @returns {Promise<void>}
   */
  const addLead = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const result = await leadService.createLead(data);
      const newLead = { ...result.data, id: result.data._id || result.data.id };

      // Optimistic prepend — no need to re-fetch the whole list
      setLeads((prev) => [newLead, ...prev]);

      logActivity(newLead.id, newLead.name, 'lead_created',
        `Lead added with deal value $${Number(newLead.value).toLocaleString()}`);

      toast.success('Lead created successfully', {
        style: {
          border: '1px solid #22C55E',
          padding: '12px',
          color: 'var(--text-main)',
          background: 'var(--bg-surface)',
        },
        iconTheme: { primary: '#22C55E', secondary: '#FFF' },
      });
    } catch (error) {
      const message =
        error?.response?.data?.errors?.[0]?.msg ||
        error?.response?.data?.message ||
        'Failed to create lead';
      toast.error(message);
      console.error('[LeadContext] addLead error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [logActivity]);

  // ── updateLead ─────────────────────────────────────────────────────────────

  /**
   * Update an existing lead via the API and merge changes into local state.
   *
   * @param {string} id - The lead's id (MongoDB _id)
   * @param {Partial<Lead>} updatedFields
   * @returns {Promise<void>}
   */
  const updateLead = useCallback(async (id, updatedFields) => {
    setIsLoading(true);
    try {
      const result = await leadService.updateLead(id, updatedFields);
      const updatedLead = { ...result.data, id: result.data._id || result.data.id };

      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? updatedLead : lead))
      );

      // Log discrete change events
      if (updatedFields.status) {
        logActivity(id, updatedLead.name, 'status_change',
          `Status updated to ${updatedFields.status}`);
      }
      if (updatedFields.value !== undefined) {
        logActivity(id, updatedLead.name, 'value_updated',
          `Deal value updated to $${Number(updatedFields.value).toLocaleString()}`);
      }
      if (updatedFields.notes !== undefined) {
        logActivity(id, updatedLead.name, 'note_added',
          `Notes updated: "${String(updatedFields.notes).slice(0, 30)}${updatedFields.notes?.length > 30 ? '...' : ''}"`);
      }

      toast.success('Lead details updated', {
        style: {
          border: '1px solid #22C55E',
          padding: '12px',
          color: 'var(--text-main)',
          background: 'var(--bg-surface)',
        },
        iconTheme: { primary: '#22C55E', secondary: '#FFF' },
      });
    } catch (error) {
      const message =
        error?.response?.data?.errors?.[0]?.msg ||
        error?.response?.data?.message ||
        'Failed to update lead';
      toast.error(message);
      console.error('[LeadContext] updateLead error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [logActivity]);

  // ── deleteLead ─────────────────────────────────────────────────────────────

  /**
   * Delete a lead via the API and remove it from local state.
   *
   * @param {string} id - The lead's id (MongoDB _id)
   * @returns {Promise<void>}
   */
  const deleteLead = useCallback(async (id) => {
    const leadToDelete = leads.find((l) => l.id === id);
    setIsLoading(true);
    try {
      await leadService.deleteLead(id);

      setLeads((prev) => prev.filter((lead) => lead.id !== id));

      if (leadToDelete) {
        logActivity(id, leadToDelete.name, 'status_change', 'Lead removed from database');
      }

      toast.error('Lead record deleted', {
        style: {
          border: '1px solid #EF4444',
          padding: '12px',
          color: 'var(--text-main)',
          background: 'var(--bg-surface)',
        },
        iconTheme: { primary: '#EF4444', secondary: '#FFF' },
      });
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to delete lead';
      toast.error(message);
      console.error('[LeadContext] deleteLead error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [leads, logActivity]);

  // ── getLeadById ────────────────────────────────────────────────────────────

  /**
   * Retrieve a single lead by id from the local state (no API call).
   *
   * @param {string} id
   * @returns {Lead | undefined}
   */
  const getLeadById = useCallback((id) => {
    return leads.find((lead) => lead.id === id);
  }, [leads]);

  // ── Context value ──────────────────────────────────────────────────────────

  return (
    <LeadContext.Provider value={{
      leads,
      activities,
      isLoading,
      pagination,
      fetchLeads,
      addLead,
      updateLead,
      deleteLead,
      getLeadById,
    }}>
      {children}
    </LeadContext.Provider>
  );
}

/* ─────────────────────────────  Hook  ────────────────────────────────────── */

/**
 * Custom hook to consume LeadContext.
 *
 * Must be called inside a component tree wrapped by <LeadProvider>.
 *
 * @returns {{
 *   leads: Lead[],
 *   activities: object[],
 *   isLoading: boolean,
 *   pagination: object,
 *   fetchLeads: (params?: object) => Promise<void>,
 *   addLead: (data: object) => Promise<void>,
 *   updateLead: (id: string, data: object) => Promise<void>,
 *   deleteLead: (id: string) => Promise<void>,
 *   getLeadById: (id: string) => Lead | undefined
 * }}
 * @throws {Error} When called outside of a <LeadProvider>
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error(
      '[useLeads] This hook must be called inside a <LeadProvider> component. ' +
      'Wrap your application (or the relevant subtree) with <LeadProvider> to fix this error.'
    );
  }
  return context;
}

export { LeadContext };
