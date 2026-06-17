
/**
 * @typedef {Object} Lead
 * @property {string} id - Unique identifier for the lead
 * @property {string} name - Name of the lead contact
 * @property {string} company - Company name
 * @property {number} value - Deal value in USD
 * @property {string} status - Lead stage status (e.g. 'New', 'Contacted', 'Qualified', 'Nurturing', 'Won', 'Lost')
 * @property {string} createdAt - ISO timestamp of lead creation
 */

/**
 * @typedef {Object} PipelineOverviewProps
 * @property {Lead[]} leads - List of leads in the CRM
 */

/**
 * PipelineOverview displays a horizontal segmented progress bar where
 * each segment represents the percentage of leads in a specific pipeline stage.
 * It also displays a detailed legend below the bar.
 *
 * @param {PipelineOverviewProps} props - The props for the component
 * @returns {React.JSX.Element} The rendered pipeline overview card
 */
export default function PipelineOverview({ leads = [] }) {
  // Define standard statuses and their styling properties
  const statusConfig = {
    New: { label: 'New', colorClass: 'bg-blue-500', textClass: 'text-blue-500', dotClass: 'bg-blue-500' },
    Contacted: { label: 'Contacted', colorClass: 'bg-indigo-500', textClass: 'text-indigo-500', dotClass: 'bg-indigo-500' },
    'Meeting Scheduled': { label: 'Meeting Scheduled', colorClass: 'bg-purple-500', textClass: 'text-purple-500', dotClass: 'bg-purple-500' },
    'Proposal Sent': { label: 'Proposal Sent', colorClass: 'bg-warning', textClass: 'text-warning', dotClass: 'bg-warning' },
    Won: { label: 'Won', colorClass: 'bg-success', textClass: 'text-success', dotClass: 'bg-success' },
    Lost: { label: 'Lost', colorClass: 'bg-danger', textClass: 'text-danger', dotClass: 'bg-danger' },
  };

  const totalLeads = leads.length;

  // Aggregate lead status counts
  const counts = leads.reduce((acc, lead) => {
    const status = lead.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Prepare status metrics list ordered logically
  const stages = Object.keys(statusConfig).map((status) => {
    const count = counts[status] || 0;
    const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
    return {
      status,
      count,
      percentage,
      ...statusConfig[status],
    };
  });

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-subtle flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-text-main tracking-tight">
          Pipeline Overview
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Visual segment of deal distribution by current lead stage status.
        </p>
      </div>

      {totalLeads > 0 ? (
        <div className="mt-6 space-y-6">
          {/* Segmented Horizontal Bar */}
          <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-bg-base border border-border-subtle shadow-inner">
            {stages
              .filter((stage) => stage.count > 0)
              .map((stage) => (
                <div
                  key={stage.status}
                  className={`${stage.colorClass} h-full transition-all duration-500 hover:brightness-95 relative group cursor-pointer`}
                  style={{ width: `${stage.percentage}%` }}
                  title={`${stage.label}: ${stage.count} (${stage.percentage.toFixed(1)}%)`}
                >
                  {/* Tooltip for hover action */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 whitespace-nowrap bg-text-main text-text-inverse text-[10px] font-bold px-2 py-1 rounded shadow-premium">
                    {stage.label}: {stage.count} ({stage.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
          </div>

          {/* Grid Legend with metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {stages.map((stage) => (
              <div
                key={stage.status}
                className="flex items-start gap-2.5 p-2 rounded-lg border border-transparent hover:border-border-subtle hover:bg-bg-base/50 transition-all duration-200"
              >
                <span className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${stage.dotClass}`} />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    {stage.label}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-sm font-bold text-text-main">
                      {stage.count}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      ({stage.percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="my-8 text-center text-xs text-text-muted py-6 flex flex-col items-center justify-center border border-dashed border-border-subtle rounded-xl bg-bg-base/30">
          <span>No active leads in the pipeline yet.</span>
          <span className="text-[10px] mt-1">Add leads to see visual distribution.</span>
        </div>
      )}
    </div>
  );
}
