

/**
 * @typedef {Object} StatusBadgeProps
 * @property {string} status - The status of the lead (e.g. 'New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost')
 */

/**
 * StatusBadge renders a pill-shaped colored badge reflecting the lead's current stage.
 * Matches theme styling with support for dark mode.
 *
 * @param {StatusBadgeProps} props - The props for the component
 * @returns {React.JSX.Element} The rendered status badge
 */
export default function StatusBadge({ status }) {
  // Status style maps matching requirements
  const badgeStyles = {
    New: 'bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-400 border-gray-200/50 dark:border-gray-800/30',
    Contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30',
    'Meeting Scheduled': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/30',
    'Proposal Sent': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30',
    Won: 'bg-success-light text-success dark:bg-success/10 dark:text-success border-success/20 dark:border-success/30',
    Lost: 'bg-danger-light text-danger dark:bg-danger/10 dark:text-danger border-danger/20 dark:border-danger/30',
  };

  const currentStyle = badgeStyles[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-400 border-gray-200/50 dark:border-gray-800/30';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wide ${currentStyle}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
      <span>{status || 'Unknown'}</span>
    </span>
  );
}
