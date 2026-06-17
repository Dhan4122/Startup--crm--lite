import { UserPlus, Users, Download } from 'lucide-react';

/**
 * @typedef {Object} QuickActionsProps
 * @property {function} onAddNewLead - Callback function triggered when "Add New Lead" is clicked
 * @property {function} onViewAllLeads - Callback function triggered when "View All Leads" is clicked
 * @property {function} onExportData - Callback function triggered when "Export Data" is clicked
 */

/**
 * QuickActions renders a control panel container with key operations
 * for managing leads, accessing logs, and exporting report databases.
 *
 * @param {QuickActionsProps} props - The props for the component
 * @returns {React.JSX.Element} The rendered quick actions card
 */
export default function QuickActions({ onAddNewLead, onViewAllLeads, onExportData }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-subtle flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-text-main tracking-tight">
          Quick Actions
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Perform administrative and pipeline tasks directly.
        </p>
      </div>

      <div className="mt-5 space-y-3.5">
        {/* Action: Add New Lead */}
        <button
          onClick={onAddNewLead}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary text-white hover:bg-primary-hover transition-all duration-200 cursor-pointer shadow-subtle text-left group"
        >
          <div className="p-2 rounded-md bg-white/10 text-white shrink-0">
            <UserPlus className="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110" />
          </div>
          <div>
            <div className="text-xs font-bold leading-none">Add New Lead</div>
            <div className="text-[10px] text-white/80 mt-1 leading-none font-medium">Create a new prospect entry</div>
          </div>
        </button>

        {/* Action: View All Leads */}
        <button
          onClick={onViewAllLeads}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-main transition-all duration-200 cursor-pointer shadow-subtle text-left group"
        >
          <div className="p-2 rounded-md bg-bg-base border border-border-subtle text-text-muted group-hover:text-text-main group-hover:bg-bg-surface transition-colors shrink-0">
            <Users className="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110" />
          </div>
          <div>
            <div className="text-xs font-bold leading-none">View All Leads</div>
            <div className="text-[10px] text-text-muted mt-1 leading-none font-medium">Access the lead management ledger</div>
          </div>
        </button>

        {/* Action: Export Data */}
        <button
          onClick={onExportData}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover text-text-main transition-all duration-200 cursor-pointer shadow-subtle text-left group"
        >
          <div className="p-2 rounded-md bg-bg-base border border-border-subtle text-text-muted group-hover:text-text-main group-hover:bg-bg-surface transition-colors shrink-0">
            <Download className="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110" />
          </div>
          <div>
            <div className="text-xs font-bold leading-none">Export Data</div>
            <div className="text-[10px] text-text-muted mt-1 leading-none font-medium">Download spreadsheet-ready CSV</div>
          </div>
        </button>
      </div>
    </div>
  );
}
