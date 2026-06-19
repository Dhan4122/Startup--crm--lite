import { SearchX, UserPlus } from 'lucide-react';

/**
 * Friendly empty-state panel shown when the leads table has nothing to display.
 * Renders two distinct variants:
 *   - "no leads at all"  → prompt the user to create their first lead
 *   - "no filter match" → prompt the user to clear active search / filters
 *
 * @param {Object}  props
 * @param {number}  props.totalLeads    - Total number of leads before any filtering
 * @param {boolean} props.hasFilters    - True when a search query or status filter is active
 * @param {Function} props.onClearFilters - Callback to reset search and filter state
 */
export default function EmptyState({ totalLeads = 0, hasFilters = false, onClearFilters }) {
  const isFiltered = totalLeads > 0 && hasFilters;

  return (
    <div
      role="status"
      aria-live="polite"
      className="
        flex flex-col items-center justify-center text-center
        py-16 px-6 rounded-xl
        border border-dashed border-border-subtle
        bg-bg-surface shadow-subtle
        animate-fadeIn
      "
    >
      {/* Icon */}
      <div
        className={`
          inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-5
          border border-border-subtle shadow-subtle
          ${isFiltered ? 'bg-warning-light text-warning' : 'bg-primary-light text-primary'}
        `}
      >
        {isFiltered ? (
          <SearchX className="h-6 w-6" />
        ) : (
          <UserPlus className="h-6 w-6" />
        )}
      </div>

      {/* Headline */}
      <h4 className="text-sm font-extrabold text-text-main tracking-tight">
        {isFiltered ? 'No leads found' : 'No leads yet'}
      </h4>

      {/* Supporting copy */}
      <p className="text-xs text-text-muted mt-1.5 max-w-xs leading-relaxed">
        {isFiltered
          ? 'No leads match your current search or filter. Try broadening your search or clearing the active filters.'
          : "You haven't added any leads yet. Click “Add Lead” to create your first prospect and start building your pipeline."}
      </p>

      {/* Clear-filters CTA (only shown when filters are active) */}
      {isFiltered && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="
            mt-5 inline-flex items-center gap-2
            px-4 py-2 text-xs font-semibold rounded-lg
            bg-primary text-white
            hover:bg-primary-hover
            transition-all duration-200 shadow-subtle cursor-pointer
          "
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
