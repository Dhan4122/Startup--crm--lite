import React, { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

/**
 * @fileoverview ThemeContext — global dark / light mode state for the CRM UI.
 *
 * When dark mode is active, the string `'dark'` is added as a class on
 * `document.documentElement`, which allows Tailwind's `dark:` variants
 * (and any custom CSS that keys off `.dark`) to take effect.
 */

/**
 * The React Context object for theme state.
 * Consume via the `useTheme` hook — never import or use this directly.
 *
 * @type {React.Context<{
 *   isDarkMode: boolean,
 *   theme: 'light'|'dark',
 *   toggleTheme: () => void,
 *   isDark: boolean
 * } | undefined>}
 */
const ThemeContext = createContext(undefined);

/**
 * ThemeProvider wraps the application and supplies dark-mode state and the
 * `toggleTheme` function to the entire component tree.
 *
 * The current theme is persisted to `localStorage` under `'crm-theme'` so the
 * user's preference survives page refreshes.  On every render cycle the
 * `'dark'` CSS class is kept in sync with `document.documentElement`.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.JSX.Element}
 */
export function ThemeProvider({ children }) {
  /**
   * Persisted theme string: `'light'` or `'dark'`.
   * Defaults to `'light'` on first load.
   * @type {['light'|'dark', (value: 'light'|'dark') => void]}
   */
  const [theme, setTheme] = useLocalStorage('crm-theme', 'light');

  /** Derived boolean — `true` when the active theme is dark mode. */
  const isDarkMode = theme === 'dark';

  /**
   * Synchronise the `'dark'` CSS class on `<html>` whenever the theme changes.
   * This is the single source-of-truth that all CSS dark-mode selectors rely on.
   */
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  /**
   * Flips the active theme between `'light'` and `'dark'`.
   * Persists the new value to localStorage automatically via `useLocalStorage`.
   *
   * @returns {void}
   *
   * @example
   * const { toggleTheme } = useTheme();
   * <button onClick={toggleTheme}>Toggle dark mode</button>
   */
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme, isDark: isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to consume ThemeContext.
 *
 * Must be called from within a component tree wrapped by `<ThemeProvider>`.
 * Throws a descriptive error if invoked outside the provider boundary so that
 * missing provider bugs are caught early during development.
 *
 * @returns {{
 *   isDarkMode: boolean,
 *   theme: 'light'|'dark',
 *   toggleTheme: () => void,
 *   isDark: boolean
 * }}
 *
 * @throws {Error} When called outside of a `<ThemeProvider>` component tree
 *
 * @example
 * function ThemeToggle() {
 *   const { isDarkMode, toggleTheme } = useTheme();
 *   return <button onClick={toggleTheme}>{isDarkMode ? '☀️' : '🌙'}</button>;
 * }
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      '[useTheme] This hook must be called inside a <ThemeProvider> component. ' +
      'Wrap your application (or the relevant subtree) with <ThemeProvider> to fix this error.'
    );
  }
  return context;
}

export { ThemeContext };
