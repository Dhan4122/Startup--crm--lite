import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Controlled search input with debounced output, a clear button, and keyboard shortcut hint.
 *
 * @param {Object}   props
 * @param {string}   props.value     - Current raw (un-debounced) display value
 * @param {Function} props.onChange  - Called with the debounced search string (300 ms delay)
 */
export default function SearchBar({ value, onChange }) {
  // Internal state tracks the instant input value so the UI stays responsive
  const [inputValue, setInputValue] = useState(value ?? '');
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  // Keep internal value in sync if parent resets it (e.g. "Clear filters" button)
  useEffect(() => {
    setInputValue(value ?? '');
  }, [value]);

  /**
   * Handles every keystroke: updates local state immediately and schedules
   * the debounced callback so the parent only re-filters after 300 ms of
   * inactivity, preventing expensive renders on every character.
   */
  const handleChange = (e) => {
    const raw = e.target.value;
    setInputValue(raw);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(raw);
    }, 300);
  };

  /** Clears both the visible input and the parent's search query immediately */
  const handleClear = () => {
    clearTimeout(debounceRef.current);
    setInputValue('');
    onChange('');
    inputRef.current?.focus();
  };

  // Cleanup pending timer on unmount
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <div className="relative flex-1 max-w-md group">
      {/* Magnifying glass icon */}
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted/70 group-focus-within:text-primary transition-colors duration-200">
        <Search className="h-4 w-4" />
      </span>

      <input
        ref={inputRef}
        id="leads-search-input"
        type="text"
        role="searchbox"
        aria-label="Search leads by name, company, or email"
        placeholder="Search by name, company, or email..."
        value={inputValue}
        onChange={handleChange}
        className="
          w-full pl-9 pr-10 py-2 text-xs rounded-xl
          border border-border-subtle
          bg-bg-base/40 focus:bg-bg-surface
          text-text-main placeholder:text-text-muted/60
          focus-ring
          transition-all duration-200
        "
      />

      {/* Clear button — only rendered when there is text */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="
            absolute inset-y-0 right-0 flex items-center pr-3
            text-text-muted/60 hover:text-text-main
            transition-colors duration-150 cursor-pointer
          "
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
