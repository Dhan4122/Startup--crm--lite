import { ChevronDown } from 'lucide-react';

/**
 * @fileoverview FilterBar — the horizontal filter/sort toolbar for the Leads page.
 *
 * Renders three control groups:
 *  1. **Status pills** — clickable pill buttons for each pipeline status.
 *     The active pill is highlighted with the primary brand colour.
 *     Each pill shows the count of leads that match that status.
 *
 *  2. **Source dropdown** — a `<select>` element for filtering by acquisition
 *     channel (Website, Referral, LinkedIn, etc.).
 *
 *  3. **Sort dropdown** — a `<select>` element for choosing the sort field
 *     (Date Added, Name, Company, Deal Value).
 *
 * All state is owned by the parent (FilterContext via Leads.jsx) and passed
 * down as props, keeping FilterBar a purely presentational component.
 *
 * @param {Object}   props
 * @param {string}   props.activeStatus   - Currently selected status filter; '' means "All"
 * @param {string}   props.activeSource   - Currently selected source filter; '' means "All"
 * @param {string}   props.sortBy         - Current sort field key
 * @param {Function} props.onStatusChange - Called with the new status string ('' to clear)
 * @param {Function} props.onSourceChange - Called with the new source string ('' to clear)
 * @param {Function} props.onSortChange   - Called with the new sort key string
 * @param {Array}    props.leads          - Full (unfiltered) leads array used to compute pill counts
 */

/** Status options for filter pills ('' = all). */
const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'New', value: 'New' },
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Meeting Scheduled', value: 'Meeting Scheduled' },
  { label: 'Proposal Sent', value: 'Proposal Sent' },
  { label: 'Won', value: 'Won' },
  { label: 'Lost', value: 'Lost' },
];

/** Source options for the dropdown ('' = all). */
const SOURCE_OPTIONS = [
  { label: 'All Sources', value: '' },
  { label: 'Website', value: 'Website' },
  { label: 'Referral', value: 'Referral' },
  { label: 'LinkedIn', value: 'LinkedIn' },
  { label: 'Cold Call', value: 'Cold Call' },
  { label: 'Email Campaign', value: 'Email Campaign' },
  { label: 'Other', value: 'Other' },
];

/** Sort-by options for the dropdown. */
const SORT_OPTIONS = [
  { label: 'Date Added', value: 'createdAt' },
  { label: 'Name (A→Z)', value: 'name' },
  { label: 'Company (A→Z)', value: 'company' },
  { label: 'Deal Value', value: 'value' },
];

export default function FilterBar({
  activeStatus = '',
  activeSource = '',
  sortBy = 'createdAt',
  onStatusChange,
  onSourceChange,
  onSortChange,
  leads = [],
}) {
  /**
   * Returns the number of leads that match a given status value.
   * An empty string (the "All" value) always returns the total count.
   *
   * @param {string} statusValue - Status string or '' for all
   * @returns {number}
   */
  const countForStatus = (statusValue) =>
    statusValue === ''
      ? leads.length
      : leads.filter((l) => l.status === statusValue).length;

  /**
   * Shared class builder for the dropdown `<select>` elements.
   * Keeps styling consistent between the source and sort controls.
   *
   * @returns {string} Tailwind class string
   */
  const selectClasses =
    'appearance-none pr-8 pl-3 py-[11px] md:py-1.5 text-xs font-semibold rounded-lg ' +
    'border border-border-subtle bg-bg-base text-text-main ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ' +
    'transition-colors duration-200 cursor-pointer';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* ── Status Pills ─────────────────────────────────────────────────── */}
      <div
        role="group"
        aria-label="Filter leads by status"
        className="flex flex-wrap items-center gap-2"
      >
        {STATUS_FILTERS.map(({ label, value }) => {
          const isActive = activeStatus === value;
          const count = countForStatus(value);

          return (
            <button
              key={value || 'all-status'}
              type="button"
              onClick={() => onStatusChange(value)}
              aria-pressed={isActive}
              aria-label={`${label} (${count})`}
              className={`
                inline-flex items-center gap-1.5 px-3 py-[11px] md:py-1.5
                text-xs font-semibold rounded-lg
                border transition-all duration-200 cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-bg-base border-border-subtle text-text-muted hover:text-text-main hover:border-border-strong hover:bg-bg-surface'
                }
              `}
            >
              <span>{label}</span>
              <span
                className={`
                  inline-flex items-center justify-center
                  min-w-[1.1rem] h-[1.1rem] rounded-full text-[10px] font-bold
                  ${isActive ? 'bg-white/25 text-white' : 'bg-border-subtle/80 text-text-muted'}
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Separator ────────────────────────────────────────────────────── */}
      <div className="h-5 w-px bg-border-subtle mx-1 hidden sm:block" aria-hidden="true" />

      {/* ── Source Dropdown ──────────────────────────────────────────────── */}
      <div className="relative">
        <select
          id="filter-source"
          value={activeSource}
          onChange={(e) => onSourceChange(e.target.value)}
          className={selectClasses}
          aria-label="Filter by lead source"
        >
          {SOURCE_OPTIONS.map(({ label, value }) => (
            <option key={value || 'all-source'} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted"
          aria-hidden="true"
        />
      </div>

      {/* ── Sort Dropdown ────────────────────────────────────────────────── */}
      <div className="relative">
        <select
          id="filter-sort-by"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className={selectClasses}
          aria-label="Sort leads by field"
        >
          {SORT_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
