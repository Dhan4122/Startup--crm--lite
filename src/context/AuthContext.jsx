/**
 * @fileoverview AuthContext — global authentication state for the CRM.
 *
 * Manages:
 *   • The current user object (null when unauthenticated)
 *   • The JWT token string (null when unauthenticated)
 *   • A loading flag used to block UI rendering until the session is restored
 *
 * On mount the provider checks localStorage for an existing token and, if
 * found, fetches the user profile from the backend to restore the session.
 * This ensures a full page refresh does not log the user out.
 *
 * Exported:
 *   AuthContext   – the raw React context (rarely needed directly)
 *   AuthProvider  – wrap your application (or App component) with this
 *   useAuth       – custom hook for consuming the context in any component
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import * as authService from '../services/authService';

/* ─────────────────────────────  Context  ─────────────────────────────────── */

/**
 * @type {React.Context<{
 *   user: object | null,
 *   token: string | null,
 *   isLoading: boolean,
 *   login: (email: string, password: string) => Promise<void>,
 *   register: (name: string, email: string, password: string) => Promise<void>,
 *   logout: () => void,
 * } | undefined>}
 */
export const AuthContext = createContext(undefined);

/* ─────────────────────────────  Provider  ────────────────────────────────── */

/**
 * AuthProvider wraps the application and supplies authentication state +
 * actions to every component in the tree.
 *
 * Provider nesting note: AuthProvider must be inside <BrowserRouter> because
 * it calls useNavigate() internally. In App.jsx it is placed inside the router.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.JSX.Element}
 */
export function AuthProvider({ children }) {
  // ── State ──────────────────────────────────────────────────────────────────

  /**
   * The decoded or server-returned user profile object.
   * null when the user is not authenticated.
   * @type {[object | null, React.Dispatch<React.SetStateAction<object | null>>]}
   */
  const [user, setUser] = useState(null);

  /**
   * The raw JWT string stored in localStorage under key 'crm-token'.
   * Initialised from localStorage so that a page refresh does not clear it.
   * @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]}
   */
  const [token, setToken] = useState(() => localStorage.getItem('crm-token'));

  /**
   * True while the provider is checking localStorage and fetching the profile
   * on mount. Components should block rendering (or show a spinner) until
   * isLoading is false to prevent a flash of the login page on refresh.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // ── Session restoration on mount ───────────────────────────────────────────

  /**
   * When the app first loads check localStorage for a saved token.
   * If one exists, call getProfile() to verify it is still valid and to
   * populate the user state. If the token has expired the 401 response
   * interceptor in api.js will clear localStorage and redirect to /login.
   */
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('crm-token');

      if (!savedToken) {
        // No token → user is definitely not logged in; stop loading.
        setIsLoading(false);
        return;
      }

      try {
        // Token exists — verify it is still valid by fetching the profile.
        // api.js interceptor auto-attaches the token via the Authorization header.
        const data = await authService.getProfile();

        // data.data is the user object returned by the successResponse helper.
        setUser(data.data || data.user || data);
        setToken(savedToken);
      } catch {
        // Token was invalid or expired — clean up localStorage.
        // The 401 interceptor already cleared 'crm-token' and redirected to
        // /login, but we still reset local state for completeness.
        setUser(null);
        setToken(null);
        localStorage.removeItem('crm-token');
        localStorage.removeItem('crm-user');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Authenticate the user with email and password.
   *
   * On success:
   *   1. Saves the token to localStorage (key: 'crm-token').
   *   2. Sets user and token state.
   *   3. Navigates to the dashboard ('/').
   *
   * On failure:
   *   Throws the Axios error so the Login page can display the server's
   *   error message in the form UI.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   * @throws {import('axios').AxiosError}
   */
  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);

    // Persist the JWT for subsequent page loads
    localStorage.setItem('crm-token', data.token);

    setToken(data.token);
    setUser(data.user);

    toast.success(`Welcome back, ${data.user?.name || 'there'}! 👋`, { duration: 3000 });

    // Redirect to the main dashboard
    navigate('/');
  }, [navigate]);

  /**
   * Create a new account.
   *
   * On success:
   *   1. Saves the token to localStorage.
   *   2. Sets user and token state.
   *   3. Navigates to the dashboard.
   *
   * On failure:
   *   Throws so the Register page can display the error.
   *
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   * @throws {import('axios').AxiosError}
   */
  const register = useCallback(async (name, email, password) => {
    const data = await authService.register(name, email, password);

    localStorage.setItem('crm-token', data.token);

    setToken(data.token);
    setUser(data.user);

    toast.success(`Account created! Welcome, ${data.user?.name || 'aboard'}! 🎉`, { duration: 3000 });

    navigate('/');
  }, [navigate]);

  /**
   * Log the user out.
   *
   * Clears localStorage, resets state, and navigates to /login.
   * The server is stateless so no API call is required for logout.
   *
   * @returns {void}
   */
  const logout = useCallback(() => {
    authService.logout();      // clears localStorage keys
    setUser(null);
    setToken(null);
    navigate('/login');
  }, [navigate]);

  // ── Context value ──────────────────────────────────────────────────────────

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─────────────────────────────  Hook  ────────────────────────────────────── */

/**
 * Custom hook to consume AuthContext.
 *
 * Must be called inside a component tree wrapped by <AuthProvider>.
 *
 * @returns {{
 *   user: object | null,
 *   token: string | null,
 *   isLoading: boolean,
 *   login: (email: string, password: string) => Promise<void>,
 *   register: (name: string, email: string, password: string) => Promise<void>,
 *   logout: () => void,
 * }}
 * @throws {Error} If called outside of an <AuthProvider>
 *
 * @example
 * function MyComponent() {
 *   const { user, logout } = useAuth();
 *   return <button onClick={logout}>{user.name}</button>;
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      '[useAuth] This hook must be called inside an <AuthProvider>. ' +
      'Wrap your application or the relevant subtree with <AuthProvider>.'
    );
  }
  return context;
}
