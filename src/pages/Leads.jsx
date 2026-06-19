import { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, X, LayoutList, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';

import { useLeads } from '../context/LeadContext';
import { useFilters } from '../context/FilterContext';

// Modular lead components
import LeadTable from '../components/leads/LeadTable';
import LeadForm from '../components/leads/LeadForm';

// Common search / filter / empty-state components
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import EmptyState from '../components/common/EmptyState';

/**
 * Leads page — the main controller for managing CRM lead records.
 *
 * Filter state (search, status, source, sortBy) is sourced entirely from
 * `FilterContext` via `useFilters()`, which persists selections to localStorage
 * under the key `'startup-crm-filters'`. This ensures filter choices survive
 * page refreshes and browser sessions.
 *
 * The derived `filteredLeads` list is computed with `useMemo` to avoid
 * redundant recalculations on unrelated renders.
 *
 * @returns {React.JSX.Element} The rendered Leads page
 */
export default function Leads() {
  // ─── Global state ──────────────────────────────────────────────────────────

  /** Live lead records and CRUD operations from LeadContext. */
  const { leads, addLead, updateLead, deleteLead } = useLeads();

  /**
   * Persistent filter/search/sort state from FilterContext.
   * All setters automatically write through to localStorage.
   */
  const {
    search,
    status,
    source,
    sortBy,
    hasActiveFilters,
    setSearch,
    setStatus,
    setSource,
    setSortBy,
    resetFilters,
  } = useFilters();

  // ─── Local (non-persistent) UI state ──────────────────────────────────────

  /** Controls visibility of the lead create/edit dialog. */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** The lead currently selected for editing; `null` when creating a new lead. */
  const [selectedLead, setSelectedLead] = useState(null);

  /**
   * Controls whether leads are shown as a table or a card grid.
   * Defaults to 'table'. Persisted in localStorage so the preference
   * survives page refreshes.
   */
  const [viewMode, setViewMode] = useState(() => {
    try { return localStorage.getItem('crm-leads-view') || 'table'; }
    catch { return 'table'; }
  });

  /** Persist viewMode whenever it changes. */
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try { localStorage.setItem('crm-leads-view', mode); } catch { /* noop */ }
  };

  /** Ref for the search input element — used by the '/' keyboard shortcut. */
  const searchInputRef = useRef(null);

  // ─── Keyboard shortcut: '/' to focus search ───────────────────────────────

  useEffect(() => {
    /**
     * Listens for the '/' key globally and focuses the search input,
     * unless the active element is already an editable field.
     *
     * @param {KeyboardEvent} e
     */
    const handleKeyDown = (e) => {
      if (e.key !== '/') return;
      if (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.tagName === 'SELECT'
      ) {
        return;
      }
      e.preventDefault();
      searchInputRef.current?.focus();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── Derived: filtered + sorted lead list ─────────────────────────────────

  /**
   * Applies the active filters (search text, status, source) and then sorts
   * the result by the `sortBy` field.
   *
   * Filtering rules:
   *  - `search`  → case-insensitive substring match on name, company, or email
   *  - `status`  → exact match (empty string = show all)
   *  - `source`  → exact match (empty string = show all)
   *
   * Sorting rules:
   *  - `createdAt` → descending (newest first)
   *  - `value`     → descending (highest first)
   *  - `name`      → ascending  (A → Z)
   *  - `company`   → ascending  (A → Z)
   *
   * Re-computed only when `leads`, `search`, `status`, `source`, or `sortBy` change.
   *
   * @type {import('../context/LeadContext').Lead[]}
   */
  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase().trim();

    const filtered = leads.filter((lead) => {
      // Text search across name / company / email
      if (q) {
        const matchesSearch =
          lead.name.toLowerCase().includes(q) ||
          lead.company.toLowerCase().includes(q) ||
          (lead.email && lead.email.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Status exact match
      if (status && lead.status !== status) return false;

      // Source exact match
      if (source && lead.source !== source) return false;

      return true;
    });

    // Sort the filtered results
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'company':
          return a.company.localeCompare(b.company);
        case 'value':
          return (Number(b.value) || 0) - (Number(a.value) || 0);
        case 'createdAt':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [leads, search, status, source, sortBy]);

  // ─── Modal handlers ────────────────────────────────────────────────────────

  /**
   * Pre-fills the form with the selected lead's data and opens the edit dialog.
   *
   * @param {import('../context/LeadContext').Lead} lead - The lead record to edit
   * @returns {void}
   */
  const handleOpenEditModal = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  /**
   * Clears any editing selection and opens the blank create dialog.
   *
   * @returns {void}
   */
  const handleOpenCreateModal = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  /**
   * Closes the dialog and resets the editing selection.
   *
   * @returns {void}
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  // ─── CRUD action handlers ──────────────────────────────────────────────────

  /**
   * Delegates to `addLead` from context, shows a success toast, and closes the modal.
   *
   * @param {Omit<import('../context/LeadContext').Lead, 'id'|'createdAt'|'lastContacted'>} leadData
   * @returns {void}
   */
  const handleCreateLead = (leadData) => {
    addLead(leadData);
    toast.success('Lead created successfully', {
      style: {
        border: '1px solid #22C55E',
        padding: '12px',
        color: 'var(--text-main)',
        background: 'var(--bg-surface)',
      },
      iconTheme: { primary: '#22C55E', secondary: '#FFF' },
    });
    handleCloseModal();
  };

  /**
   * Delegates to `updateLead` from context, shows a success toast, and closes the modal.
   *
   * @param {Partial<import('../context/LeadContext').Lead>} leadData
   * @returns {void}
   */
  const handleUpdateLead = (leadData) => {
    updateLead(selectedLead.id, leadData);
    toast.success('Lead details updated', {
      style: {
        border: '1px solid #22C55E',
        padding: '12px',
        color: 'var(--text-main)',
        background: 'var(--bg-surface)',
      },
      iconTheme: { primary: '#22C55E', secondary: '#FFF' },
    });
    handleCloseModal();
  };

  /**
   * Confirms with the user, delegates to `deleteLead`, shows an error toast,
   * and closes the modal if the deleted lead was open for editing.
   *
   * @param {string} id - The unique identifier of the lead to delete
   * @returns {void}
   */
  const handleDeleteLead = (id) => {
    if (window.confirm('Are you sure you want to remove this lead record?')) {
      deleteLead(id);
      toast.error('Lead record deleted', {
        style: {
          border: '1px solid #EF4444',
          padding: '12px',
          color: 'var(--text-main)',
          background: 'var(--bg-surface)',
        },
        iconTheme: { primary: '#EF4444', secondary: '#FFF' },
      });
      if (selectedLead && selectedLead.id === id) {
        handleCloseModal();
      }
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Leads Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-text-muted mt-1">
            Search, filter, analyze, and manage prospects across your deal lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* ── View Mode Toggle ────────────────────────────────────────── */}
          <div
            className="flex items-center gap-0.5 p-1 bg-gray-100 dark:bg-bg-base border border-gray-200 dark:border-border-subtle rounded-lg"
            role="group"
            aria-label="Switch view mode"
          >
            <button
              id="view-toggle-table"
              onClick={() => handleViewModeChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-bg-surface text-primary shadow-subtle border border-gray-200 dark:border-border-subtle'
                  : 'text-gray-500 dark:text-text-muted hover:text-gray-900 dark:hover:text-text-main'
              }`}
              title="Table view"
              aria-label="Switch to table view"
              aria-pressed={viewMode === 'table'}
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              id="view-toggle-card"
              onClick={() => handleViewModeChange('card')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-bg-surface text-primary shadow-subtle border border-gray-200 dark:border-border-subtle'
                  : 'text-gray-500 dark:text-text-muted hover:text-gray-900 dark:hover:text-text-main'
              }`}
              title="Card view"
              aria-label="Switch to card view"
              aria-pressed={viewMode === 'card'}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          {/* ── Add Lead Button ─────────────────────────────────────────── */}
          <button
            id="add-lead-btn"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-all duration-200 shadow-subtle cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Search and Filter toolbar */}
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 shadow-subtle space-y-3">
        {/* Row 1: search input + reset button */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/*
           * SearchBar is a controlled component. We pass the persisted `search`
           * value from FilterContext and wire `setSearch` as the onChange handler.
           * The component debounces internally (300 ms) before calling onChange.
           */}
          <SearchBar value={search} onChange={setSearch} />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="shrink-0 text-xs text-primary hover:underline font-semibold cursor-pointer transition-opacity duration-150"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Row 2: status + source filter pills */}
        <div className="pt-3 border-t border-border-subtle">
          <FilterBar
            activeStatus={status}
            activeSource={source}
            sortBy={sortBy}
            onStatusChange={setStatus}
            onSourceChange={setSource}
            onSortChange={setSortBy}
            leads={leads}
          />
        </div>
      </div>

      {/* Main Datagrid Viewport — or empty state when nothing matches */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          totalLeads={leads.length}
          hasFilters={hasActiveFilters}
          onClearFilters={resetFilters}
        />
      ) : (
        <LeadTable
          leads={filteredLeads}
          viewMode={viewMode}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteLead}
        />
      )}

      {/* Lead Editor Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center p-0 md:p-4">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={handleCloseModal}
          />

          {/* Card Content container */}
          <div className="relative w-full h-full md:h-auto md:max-w-lg rounded-none md:rounded-xl border-0 md:border border-border-subtle bg-bg-surface p-6 shadow-premium animate-scaleIn z-10 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-text-main tracking-tight">
                  {selectedLead ? `Edit Details: ${selectedLead.name}` : 'Create Lead Entry'}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Complete lead parameters and contact details below.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="flex h-11 w-11 items-center justify-center rounded-md text-text-muted hover:bg-bg-base hover:text-text-main transition-colors cursor-pointer shrink-0"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Render validation inputs form */}
            <div className="flex-1 min-h-0 md:flex-initial">
              <LeadForm
                key={selectedLead ? selectedLead.id : 'new-lead'}
                initialData={selectedLead}
                onSubmit={selectedLead ? handleUpdateLead : handleCreateLead}
                onCancel={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
