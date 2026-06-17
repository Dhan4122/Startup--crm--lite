import { useState } from 'react';
import { List, Grid, Edit3, Trash2, Calendar, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';
import LeadCard from './LeadCard';

/**
 * @typedef {Object} Lead
 * @property {string} id - Unique identifier for the lead
 * @property {string} name - Name of the lead contact
 * @property {string} company - Company name
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {string} status - Deal status
 * @property {number} value - Deal value in USD
 * @property {string} source - Channel source
 * @property {string} createdAt - Date added
 */

/**
 * @typedef {Object} LeadTableProps
 * @property {Lead[]} leads - List of leads in the CRM
 * @property {function(Lead): void} onEdit - Callback function triggered when editing a lead
 * @property {function(string): void} onDelete - Callback function triggered when deleting a lead
 */

/**
 * LeadTable renders a structured datagrid displaying all lead records.
 * Supports toggling views between standard tables and responsive cards.
 *
 * @param {LeadTableProps} props - The props for the component
 * @returns {React.JSX.Element} The rendered lead list container
 */
export default function LeadTable({ leads = [], onEdit, onDelete }) {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'

  /**
   * Formats ISO date string into readable calendar date format
   * @param {string} dateString - ISO Date string
   * @returns {string} Formatted date (e.g. "Jun 15, 2026")
   */
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-4">
      {/* Table/Card Layout View Control Panel */}
      <div className="flex justify-between items-center bg-bg-surface p-3 border border-border-subtle rounded-xl shadow-subtle">
        <span className="text-xs text-text-muted font-medium">
          Showing <span className="text-text-main font-bold">{leads.length}</span> lead record{leads.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-1.5 bg-bg-base border border-border-subtle p-0.5 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-bg-surface text-primary border border-border-subtle/80 shadow-subtle font-semibold'
                : 'text-text-muted hover:text-text-main'
            }`}
            title="Tabular List Layout"
            aria-label="Switch to table view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
              viewMode === 'card'
                ? 'bg-bg-surface text-primary border border-border-subtle/80 shadow-subtle font-semibold'
                : 'text-text-muted hover:text-text-main'
            }`}
            title="Visual Cards Layout"
            aria-label="Switch to card view"
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border-subtle rounded-xl bg-bg-surface p-6 shadow-subtle">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-bg-base text-text-muted mb-3 border border-border-subtle">
            <FileText className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-text-main">No leads found</h4>
          <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
            Try creating a new lead or adjusting your search filters.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <>
          {/* Desktop Table View - visible on medium (md: 768px) and larger screens */}
          <div className="hidden md:block rounded-xl border border-border-subtle bg-bg-surface shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border-subtle bg-bg-base/30 text-xs font-bold text-text-muted uppercase tracking-wider">
                    <th className="p-4 pl-6">Lead Name</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Date Added</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-xs">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-bg-base/40 transition-colors duration-150 group"
                    >
                      <td className="p-4 pl-6 font-bold text-text-main">
                        {lead.name}
                      </td>
                      <td className="p-4 text-text-muted">{lead.company}</td>
                      <td className="p-4">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="p-4">
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-text-muted hover:text-primary hover:underline transition-colors"
                          >
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-text-muted/50">—</span>
                        )}
                      </td>
                      <td className="p-4 text-text-muted capitalize">
                        {lead.source || 'Direct'}
                      </td>
                      <td className="p-4 text-text-muted">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-text-muted shrink-0" />
                          <span>{formatDate(lead.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(lead)}
                            className="p-1.5 rounded-lg border border-border-subtle bg-bg-surface text-text-muted hover:text-text-main hover:bg-bg-surface-hover transition-colors cursor-pointer"
                            title={`Edit ${lead.name}`}
                            aria-label={`Edit ${lead.name}`}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(lead.id)}
                            className="p-1.5 rounded-lg border border-border-subtle bg-bg-surface text-text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                            title={`Delete ${lead.name}`}
                            aria-label={`Delete ${lead.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Fallback - stacked card list visible on smaller screens (<768px) */}
          <div className="grid md:hidden grid-cols-1 gap-4">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      ) : (
        /* Cards Grid View - stacks on mobile, responsive columns on tablet and desktop */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
