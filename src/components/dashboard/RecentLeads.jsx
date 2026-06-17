
/**
 * @typedef {Object} Lead
 * @property {string} id - Unique identifier for the lead
 * @property {string} name - Name of the lead contact
 * @property {string} company - Company name
 * @property {string} status - Lead stage status (e.g. 'New', 'Contacted', 'Qualified', 'Nurturing', 'Won', 'Lost')
 * @property {string} createdAt - ISO timestamp of lead creation
 */

/**
 * @typedef {Object} RecentLeadsProps
 * @property {Lead[]} leads - List of leads in the CRM
 */

/**
 * RecentLeads displays the 5 most recently added leads in a tabular list
 * with details on name, company, styled status badge, and date added.
 *
 * @param {RecentLeadsProps} props - The props for the component
 * @returns {React.JSX.Element} The rendered recent leads card
 */
export default function RecentLeads({ leads = [] }) {
  // Sort leads by creation date (newest first) and get the top 5
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Status badge styling maps
  const statusStyles = {
    New: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200/55 dark:border-blue-800/30',
    Contacted: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200/55 dark:border-indigo-800/30',
    'Meeting Scheduled': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200/55 dark:border-purple-800/30',
    'Proposal Sent': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200/55 dark:border-amber-800/30',
    Won: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200/55 dark:border-green-800/30',
    Lost: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200/55 dark:border-red-800/30',
  };

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
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-subtle flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-text-main tracking-tight">
          Recent Leads
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Chronological ledger of the last 5 leads added to the portal.
        </p>
      </div>

      <div className="overflow-x-auto -mx-6">
        <div className="inline-block min-w-full align-middle px-6">
          <table className="min-w-full divide-y divide-border-subtle/60 text-left">
            <thead>
              <tr className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-3 px-2">Name</th>
                <th className="py-3 px-2">Company</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40 text-xs">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-bg-base/40 transition-colors duration-150"
                  >
                    <td className="py-3.5 px-2 font-bold text-text-main whitespace-nowrap">
                      {lead.name}
                    </td>
                    <td className="py-3.5 px-2 text-text-muted whitespace-nowrap">
                      {lead.company}
                    </td>
                    <td className="py-3.5 px-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          statusStyles[lead.status] ||
                          'bg-bg-base text-text-muted border-border-subtle'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-text-muted text-right whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-8 text-center text-xs text-text-muted"
                  >
                    No leads found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
