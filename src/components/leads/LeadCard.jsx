import { Mail, Phone, Building, Edit3, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

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
 * @typedef {Object} LeadCardProps
 * @property {Lead} lead - The lead record details
 * @property {function(Lead): void} onEdit - Callback function triggered when the Edit button is clicked
 * @property {function(string): void} onDelete - Callback function triggered when the Delete button is clicked
 */

/**
 * LeadCard renders a structured summary for a single lead.
 * Optimized for mobile viewport stacking and grid boards.
 *
 * @param {LeadCardProps} props - The props for the component
 * @returns {React.JSX.Element} The rendered lead card
 */
export default function LeadCard({ lead, onEdit, onDelete }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-subtle flex flex-col justify-between hover:shadow-premium hover:-translate-y-0.5 transition-all duration-200 group relative">
      <div className="space-y-4">
        {/* Header: Name and Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-text-main group-hover:text-primary transition-colors truncate">
              {lead.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 text-text-muted text-xs">
              <Building className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{lead.company}</span>
            </div>
          </div>
          <div className="shrink-0">
            <StatusBadge status={lead.status} />
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 pt-3 border-t border-border-subtle/50 text-xs">
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors group/link"
              title={`Email ${lead.name}`}
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-text-muted group-hover/link:text-primary" />
              <span className="truncate">{lead.email}</span>
            </a>
          )}

          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors group/link"
              title={`Call ${lead.name}`}
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-text-muted group-hover/link:text-primary" />
              <span className="truncate">{lead.phone}</span>
            </a>
          )}
          
          {lead.value !== undefined && (
            <div className="flex items-center justify-between text-xs font-semibold pt-1 text-text-main">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Value:</span>
              <span>${lead.value.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-border-subtle/50">
        <button
          onClick={() => onEdit(lead)}
          className="flex h-11 w-11 md:h-7 md:w-7 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface text-text-muted hover:text-text-main hover:bg-bg-surface-hover transition-all duration-200 cursor-pointer"
          title={`Edit details for ${lead.name}`}
          aria-label={`Edit ${lead.name}`}
        >
          <Edit3 className="h-5 w-5 md:h-3.5 md:w-3.5" />
        </button>
        <button
          onClick={() => onDelete(lead.id)}
          className="flex h-11 w-11 md:h-7 md:w-7 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200 cursor-pointer"
          title={`Delete record for ${lead.name}`}
          aria-label={`Delete ${lead.name}`}
        >
          <Trash2 className="h-5 w-5 md:h-3.5 md:w-3.5" />
        </button>
      </div>
    </div>
  );
}
