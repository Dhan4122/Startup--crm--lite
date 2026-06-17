import { useState, useRef, useEffect } from 'react';
import { Plus, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLeads } from '../context/LeadContext';

// Import newly created modular components
import LeadTable from '../components/leads/LeadTable';
import LeadForm from '../components/leads/LeadForm';

const STATUS_OPTIONS = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];
const SOURCE_OPTIONS = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'];

/**
 * Leads page serves as the main controller for managing CRM lead records.
 * Integrates search filters, view toggles, creation dialogs, and notifications.
 *
 * @returns {React.JSX.Element} The rendered Leads page
 */
export default function Leads() {
  // Get leads state and operations from LeadContext
  const { leads, addLead, updateLead, deleteLead } = useLeads();

  // Page layout and CRUD dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Search & Filter state values
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const searchInputRef = useRef(null);

  // Keyboard shortcut listener: '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/') {
        // If focus is already in an input, do not intercept
        if (
          document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.tagName === 'SELECT'
        ) {
          return;
        }
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Evaluates active filters and returns matching lead subset
   */
  const filteredLeads = leads.filter((lead) => {
    const matchQuery =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = !statusFilter || lead.status === statusFilter;
    const matchSource = !sourceFilter || lead.source === sourceFilter;

    return matchQuery && matchStatus && matchSource;
  });

  /**
   * Pre-fills inputs and displays the edit dialog
   * @param {Object} lead - The lead record to edit
   */
  const handleOpenEditModal = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  /**
   * Resets editing state and opens the blank creation dialog
   */
  const handleOpenCreateModal = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  /**
   * Closes the dialog and cleans up edit selection
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  /**
   * Triggers add operation and updates user interface
   * @param {Object} leadData - Form data output
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
      iconTheme: {
        primary: '#22C55E',
        secondary: '#FFF',
      },
    });
    handleCloseModal();
  };

  /**
   * Triggers update operation and updates user interface
   * @param {Object} leadData - Form data output
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
      iconTheme: {
        primary: '#22C55E',
        secondary: '#FFF',
      },
    });
    handleCloseModal();
  };

  /**
   * Prompts user and deletes lead record from database
   * @param {string} id - Lead ID to delete
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
        iconTheme: {
          primary: '#EF4444',
          secondary: '#FFF',
        },
      });
      // Close modal in case the lead deleted was currently open in edit mode
      if (selectedLead && selectedLead.id === id) {
        handleCloseModal();
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">
            Leads Ledger
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Search, filter, analyze, and manage prospects across your deal lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="add-lead-btn"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-all duration-200 shadow-subtle cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Search and Filters control toolbar */}
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search bar input wrapper */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted/75">
              <Search className="h-4 w-4" />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search leads, companies... (press '/' to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-1.5 text-xs rounded-lg border border-border-subtle bg-bg-base/40 focus:bg-bg-surface text-text-main focus-ring"
            />
            <kbd className="absolute right-2.5 top-2 hidden sm:inline-flex h-4 items-center rounded border border-border-subtle bg-bg-base px-1.5 text-[9px] font-medium text-text-muted">
              /
            </kbd>
          </div>
        </div>

        {/* Dropdowns filter widgets ribbon */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Filter: Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-border-subtle bg-bg-base text-text-main focus:border-primary focus:outline-none"
            aria-label="Filter leads by status"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Filter: Source */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-border-subtle bg-bg-base text-text-main focus:border-primary focus:outline-none"
            aria-label="Filter leads by channel source"
          >
            <option value="">All Sources</option>
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Action: Reset filters option */}
          {(statusFilter || sourceFilter || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setSourceFilter('');
                setSearchQuery('');
              }}
              className="text-xs text-primary hover:underline font-semibold ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Datagrid Viewport */}
      <LeadTable
        leads={filteredLeads}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteLead}
      />

      {/* Lead Editor Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={handleCloseModal}
          />

          {/* Card Content container */}
          <div className="relative w-full max-w-lg rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-premium animate-scaleIn z-10">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4">
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
                className="p-1 rounded-md text-text-muted hover:bg-bg-base hover:text-text-main transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Render validation inputs form */}
            <LeadForm
              key={selectedLead ? selectedLead.id : 'new-lead'}
              initialData={selectedLead}
              onSubmit={selectedLead ? handleUpdateLead : handleCreateLead}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
