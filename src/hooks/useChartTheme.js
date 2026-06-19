import { useTheme } from '../context/ThemeContext';

/**
 * useChartTheme — returns Recharts-compatible style objects and class strings
 * that are always in sync with the active light / dark theme.
 *
 * Usage:
 *   const { tooltipStyle, tooltipWrapperClass, cardClass } = useChartTheme();
 */
export function useChartTheme() {
  const { isDarkMode } = useTheme();

  /**
   * Inline style passed directly to Recharts <Tooltip contentStyle={…} />.
   * This overrides Recharts' own tooltip background so it matches the page surface.
   */
  const tooltipStyle = isDarkMode
    ? {
        backgroundColor: '#0F172A',   // slate-950 — deep page surface
        border: '1px solid #334155',  // slate-700
        borderRadius: '12px',
        color: '#F8FAFC',             // slate-50
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
        fontSize: '12px',
        padding: '10px 14px',
      }
    : {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',  // slate-200
        borderRadius: '12px',
        color: '#111827',             // gray-900
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 15px -3px rgba(0,0,0,0.04)',
        fontSize: '12px',
        padding: '10px 14px',
      };

  /**
   * Tailwind classes for the custom tooltip JSX wrapper used in all charts.
   */
  const tooltipWrapperClass = isDarkMode
    ? 'p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white shadow-[0_4px_20px_0_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]'
    : 'p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 shadow-lg';

  /**
   * Tailwind classes for the outer card wrapper of every chart card.
   * Adds subtle scale-lift + stronger shadow on hover, with a smooth transition.
   */
  const cardClass =
    'flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 ' +
    'rounded-2xl p-6 shadow-sm ' +
    'transition-all duration-200 ease-out ' +
    'hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:scale-[1.01] ' +
    'hover:border-slate-300 dark:hover:border-slate-700';

  /** Muted axis tick colour – used for Recharts XAxis/YAxis tick fill */
  const tickColor = isDarkMode ? '#64748B' : '#94A3B8';

  /** Grid stroke colour */
  const gridColor = isDarkMode ? '#1E293B' : '#E2E8F0';

  return { tooltipStyle, tooltipWrapperClass, cardClass, tickColor, gridColor, isDarkMode };
}
