import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * @typedef {Object} StatsCardProps
 * @property {string} title - The title of the statistics card (e.g., "Total Leads")
 * @property {string|number} value - The main metric value (e.g., "$125,000" or "142")
 * @property {React.ComponentType<{ className?: string }>} icon - The Lucide React icon component to render
 * @property {number} change - The percentage change compared to last month (e.g., 12.4 or -3.2)
 * @property {'primary' | 'success' | 'warning' | 'danger'} color - The semantic color category for the icon background border
 */

/**
 * StatsCard component displays a metric with its label, value, an icon,
 * and a color-coded percentage indicating change compared to the previous month.
 *
 * @param {StatsCardProps} props - The props for the component
 * @returns {React.JSX.Element} The rendered stats card
 */
export default function StatsCard({ title, value, icon: Icon, change, color }) {
  const isPositive = change >= 0;

  // Resolve semantic color mappings to utility classes
  const colorMap = {
    primary: {
      bg: 'bg-primary-light text-primary dark:bg-primary/15',
      border: 'border-primary/20 dark:border-primary/30',
    },
    success: {
      bg: 'bg-success-light text-success dark:bg-success/15',
      border: 'border-success/20 dark:border-success/30',
    },
    warning: {
      bg: 'bg-warning-light text-warning dark:bg-warning/15',
      border: 'border-warning/20 dark:border-warning/30',
    },
    danger: {
      bg: 'bg-danger-light text-danger dark:bg-danger/15',
      border: 'border-danger/20 dark:border-danger/30',
    },
  };

  const selectedColors = colorMap[color] || colorMap.primary;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-subtle flex flex-col justify-between transition-all duration-300 hover:shadow-premium hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg border ${selectedColors.bg} ${selectedColors.border} flex items-center justify-center shrink-0`}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-2xl font-extrabold text-text-main tracking-tight">
          {value}
        </h3>
        
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 font-bold rounded-full px-2 py-0.5 ${
              isPositive
                ? 'bg-success-light text-success dark:bg-success/10'
                : 'bg-danger-light text-danger dark:bg-danger/10'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 shrink-0" />
            ) : (
              <ArrowDownRight className="h-3 w-3 shrink-0" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {change.toFixed(1)}%
            </span>
          </span>
          <span className="text-text-muted">vs last month</span>
        </div>
      </div>
    </div>
  );
}
