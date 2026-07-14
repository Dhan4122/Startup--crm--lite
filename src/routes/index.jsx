/**
 * @fileoverview Application route configuration with protected route guard.
 *
 * ProtectedRoute checks whether a JWT exists in localStorage.
 *   • No token  → immediately redirect to /login (no flicker thanks to isLoading check)
 *   • Token OK  → render <Outlet /> so child routes display normally
 *
 * Route tree:
 *   /login     → Login    (public)
 *   /register  → Register (public)
 *   /          → AppLayout  (protected wrapper with sidebar + topbar)
 *     index    → Dashboard
 *     leads    → Leads
 *     analytics→ Analytics
 *
 * NOTE: AuthProvider is mounted in App.jsx (inside BrowserRouter) so that
 * useNavigate() is available inside the provider and hooks work in every page.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — renders its children only when the user is authenticated.
 *
 * Uses two checks:
 *   1. `isLoading` — while the AuthProvider is restoring a session from
 *      localStorage we render nothing (no spinner) to avoid a flash of the
 *      login page on a valid page refresh.
 *   2. `token`    — once loading is complete, if there is no token the user
 *      is redirected to /login. `replace` is used so the login page does not
 *      push onto the browser history stack (hitting Back from login would
 *      otherwise loop back to the protected page).
 *
 * @returns {React.JSX.Element | null}
 */
export function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  // While session is being restored from localStorage show nothing.
  // The app will re-render once isLoading becomes false.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-3">
          {/* Subtle spinner matching the app's primary colour */}
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-text-muted">Loading…</p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated → render the child routes
  return <Outlet />;
}
