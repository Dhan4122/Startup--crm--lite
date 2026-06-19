import { Calendar, Edit3, Trash2, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';
import LeadCard from './LeadCard';

/**
 * @typedef {Object} Lead
 * @property {string} id
 * @property {string} name
 * @property {string} company
 * @property {string} email
 * @property {string} phone
 * @property {string} status
 * @property {number} value
 * @property {string} source
 * @property {string} createdAt
 */

/**
 * LeadTable — renders the lead list in either TABLE or CARD view.
 *
 * The `viewMode` prop is controlled by the Leads page header toggle and
 * persisted in localStorage. Mobile always gets the card grid regardless
 * of viewMode (table is unusable at narrow widths). On md+ both modes work.
 *
 * @param {{ leads: Lead[], viewMode: 'table'|'card', onEdit: Function, onDelete: Function }} props
 * @returns {React.JSX.Element}
 */
export default function LeadTable({ leads = [], viewMode = 'table', onEdit, onDelete }) {
  /**
   * Formats an ISO date string into "Jun 15, 2026" format.
   * @param {string} dateString
   * @returns {string}
   */
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (leads.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border-subtle rounded-xl bg-bg-surface p-6 shadow-subtle">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-bg-base text-text-muted mb-3 border border-border-subtle">
          <FileText className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-bold text-text-main">No leads found</h4>
        <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
          Try creating a new lead or adjusting your search filters.
        </p>
      </div>
    );
  }

  // ── Lead count label ─────────────────────────────────────────────────────
  const countLabel = (
    <p className="text-xs text-text-muted font-medium">
      Showing <span className="text-text-main font-bold">{leads.length}</span>{' '}
      lead record{leads.length !== 1 ? 's' : ''}
    </p>
  );

  // ════════════════════════════════════════════════════════════════════════
  // CARD VIEW — responsive grid: 1 col mobile, 2 col md, 3 col lg
  // ════════════════════════════════════════════════════════════════════════
  if (viewMode === 'card') {
    return (
      <div className="space-y-4 animate-fadeIn">
        {countLabel}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // TABLE VIEW
  // ════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* On mobile, always show cards — table is impractical at narrow widths */}
      <div className="md:hidden space-y-4">
        {countLabel}
        <div className="grid grid-cols-1 gap-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </div>

      {/* On md+ show the full table */}
      <div className="hidden md:block rounded-xl border border-border-subtle bg-bg-surface shadow-subtle overflow-hidden">
        {/* Table header bar */}
        <div className="px-4 py-3 border-b border-border-subtle bg-bg-base/10 flex items-center justify-between">
          {countLabel}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-base/30 text-xs font-bold text-text-muted uppercase tracking-wider">
                <th className="p-4 pl-6 whitespace-nowrap">Lead Name</th>
                <th className="p-4 whitespace-nowrap">Company</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap hidden lg:table-cell">Email</th>
                <th className="p-4 whitespace-nowrap hidden xl:table-cell">Source</th>
                <th className="p-4 whitespace-nowrap hidden xl:table-cell">Value</th>
                <th className="p-4 whitespace-nowrap hidden lg:table-cell">Date Added</th>
                <th className="p-4 text-right pr-6 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-bg-base/40 transition-colors duration-150 group"
                >
                  <td className="p-4 pl-6 font-bold text-text-main whitespace-nowrap">
                    {lead.name}
                  </td>
                  <td className="p-4 text-text-muted whitespace-nowrap">{lead.company}</td>
                  <td className="p-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    {lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-text-muted hover:text-primary hover:underline transition-colors truncate block max-w-[180px]"
                      >
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-text-muted/40">—</span>
                    )}
                  </td>
                  <td className="p-4 text-text-muted capitalize hidden xl:table-cell">
                    {lead.source || 'Direct'}
                  </td>
                  <td className="p-4 text-text-muted font-medium hidden xl:table-cell">
                    {lead.value !== undefined ? `$${Number(lead.value).toLocaleString()}` : '—'}
                  </td>
                  <td className="p-4 text-text-muted hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar className="h-3.5 w-3.5 text-text-muted/60 shrink-0" />
                      <span>{formatDate(lead.createdAt)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
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
    </div>
  );
}
