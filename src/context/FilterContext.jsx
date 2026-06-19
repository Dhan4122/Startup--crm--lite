import React, { createContext, useContext, useMemo, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

/**
 * @fileoverview FilterContext — persistent, global filter/search/sort state for the CRM.
 *
 * All filter state is stored in localStorage under `'startup-crm-filters'` so
 * selections survive page refreshes and new browser sessions.
 *
 * Filter state shape:
 * @typedef {Object} FilterState
 * @property {string} search  - Free-text search query (matches name / company / email)
 * @property {string} status  - Exact-match status filter ('New', 'Won', etc.) or '' for all
 * @property {string} source  - Exact-match source filter ('Website', 'Referral', etc.) or '' for all
 * @property {'createdAt'|'name'|'company'|'value'} sortBy
 *   - Field to sort the filtered lead list by (descending for dates/values, ascending for strings)
 */

/**
 * Default (empty) filter state — also used as the reset target.
 * @type {FilterState}
 */
const DEFAULT_FILTERS = {
  search: '',
  status: '',
  source: '',
  sortBy: 'createdAt',
};

/**
 * Validates that a value loaded from localStorage matches the expected shape.
 * Returns `DEFAULT_FILTERS` if the stored value is missing, null, or malformed,
 * preventing corrupted localStorage data from crashing the app.
 *
 * @param {unknown} stored - Raw value parsed from localStorage
 * @returns {FilterState} A safe, validated filter state object
 */
function sanitizeFilters(stored) {
  try {
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
      return DEFAULT_FILTERS;
    }

    const VALID_SORT_KEYS = ['createdAt', 'name', 'company', 'value'];

    return {
      search:  typeof stored.search === 'string'  ? stored.search  : DEFAULT_FILTERS.search,
      status:  typeof stored.status === 'string'  ? stored.status  : DEFAULT_FILTERS.status,
      source:  typeof stored.source === 'string'  ? stored.source  : DEFAULT_FILTERS.source,
      sortBy:  VALID_SORT_KEYS.includes(stored.sortBy) ? stored.sortBy : DEFAULT_FILTERS.sortBy,
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

/**
 * The React Context object for filter state.
 * Consume via `useFilters()` — never import or use this directly.
 *
 * @type {React.Context<{
 *   search: string,
 *   status: string,
 *   source: string,
 *   sortBy: string,
 *   hasActiveFilters: boolean,
 *   setSearch: (value: string) => void,
 *   setStatus: (value: string) => void,
 *   setSource: (value: string) => void,
 *   setSortBy: (value: string) => void,
 *   resetFilters: () => void,
 * } | undefined>}
 */
const FilterContext = createContext(undefined);

/**
 * FilterProvider wraps the application (or a subtree) and supplies persisted
 * filter/search/sort state to the entire component tree.
 *
 * State is written to localStorage under `'startup-crm-filters'` on every
 * change, and read back (with corruption-safe validation) on first render.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.JSX.Element}
 */
export function FilterProvider({ children }) {
  /**
   * Core filter state, persisted to and restored from localStorage.
   * The initializer function wraps `sanitizeFilters` so that corrupted
   * or missing data never propagates into component state.
   *
   * @type {[FilterState, (value: FilterState | ((prev: FilterState) => FilterState)) => void]}
   */
  const [filters, setFilters] = useLocalStorage('startup-crm-filters', DEFAULT_FILTERS);

  // On every hydration, re-validate to guard against mid-session corruption.
  const safeFilters = useMemo(() => sanitizeFilters(filters), [filters]);

  // ─── Setters ─────────────────────────────────────────────────────────────

  /**
   * Updates the free-text search query.
   * An empty string disables text filtering.
   *
   * @param {string} value - The new search term
   * @returns {void}
   */
  const setSearch = useCallback((value) => {
    setFilters((prev) => ({ ...sanitizeFilters(prev), search: String(value) }));
  }, [setFilters]);

  /**
   * Updates the status filter.
   * Pass an empty string (`''`) to show all statuses.
   *
   * @param {string} value - Status label or '' for "All"
   * @returns {void}
   */
  const setStatus = useCallback((value) => {
    setFilters((prev) => ({ ...sanitizeFilters(prev), status: String(value) }));
  }, [setFilters]);

  /**
   * Updates the lead source filter.
   * Pass an empty string (`''`) to show all sources.
   *
   * @param {string} value - Source label or '' for "All"
   * @returns {void}
   */
  const setSource = useCallback((value) => {
    setFilters((prev) => ({ ...sanitizeFilters(prev), source: String(value) }));
  }, [setFilters]);

  /**
   * Updates the sort field.
   * Accepted values: `'createdAt'` (default), `'name'`, `'company'`, `'value'`.
   *
   * @param {'createdAt'|'name'|'company'|'value'} value - The field to sort by
   * @returns {void}
   */
  const setSortBy = useCallback((value) => {
    setFilters((prev) => ({ ...sanitizeFilters(prev), sortBy: String(value) }));
  }, [setFilters]);

  /**
   * Resets all filter fields to their defaults and clears the localStorage entry.
   * After calling this, `useFilters()` consumers will see the empty/default state.
   *
   * @returns {void}
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, [setFilters]);

  // ─── Derived state ────────────────────────────────────────────────────────

  /**
   * `true` when any non-default filter is active.
   * Useful for rendering "Reset filters" controls conditionally.
   *
   * @type {boolean}
   */
  const hasActiveFilters =
    safeFilters.search !== DEFAULT_FILTERS.search ||
    safeFilters.status !== DEFAULT_FILTERS.status ||
    safeFilters.source !== DEFAULT_FILTERS.source ||
    safeFilters.sortBy !== DEFAULT_FILTERS.sortBy;

  // ─── Context value ────────────────────────────────────────────────────────

  /**
   * Memoised context value — only re-creates when safeFilters or callbacks change,
   * preventing unnecessary re-renders in deeply nested consumers.
   */
  const value = useMemo(() => ({
    // State
    search:          safeFilters.search,
    status:          safeFilters.status,
    source:          safeFilters.source,
    sortBy:          safeFilters.sortBy,
    hasActiveFilters,
    // Setters
    setSearch,
    setStatus,
    setSource,
    setSortBy,
    resetFilters,
  }), [safeFilters, hasActiveFilters, setSearch, setStatus, setSource, setSortBy, resetFilters]);

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

/**
 * Custom hook to consume FilterContext.
 *
 * Must be called inside a component tree wrapped by `<FilterProvider>`.
 * Throws a descriptive, developer-friendly error if invoked outside the
 * provider boundary so that missing provider bugs surface immediately.
 *
 * @returns {{
 *   search: string,
 *   status: string,
 *   source: string,
 *   sortBy: string,
 *   hasActiveFilters: boolean,
 *   setSearch: (value: string) => void,
 *   setStatus: (value: string) => void,
 *   setSource: (value: string) => void,
 *   setSortBy: (value: string) => void,
 *   resetFilters: () => void,
 * }}
 *
 * @throws {Error} When called outside of a `<FilterProvider>` component tree
 *
 * @example
 * function LeadSearch() {
 *   const { search, setSearch } = useFilters();
 *   return <input value={search} onChange={e => setSearch(e.target.value)} />;
 * }
 */
export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error(
      '[useFilters] This hook must be called inside a <FilterProvider> component. ' +
      'Wrap your application (or the relevant subtree) with <FilterProvider> to fix this error.'
    );
  }
  return context;
}

export { FilterContext, DEFAULT_FILTERS };
