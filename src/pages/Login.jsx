/**
 * @fileoverview Login page for Startup CRM Lite.
 *
 * Renders a polished email + password sign-in form.
 * On submission it calls useAuth().login() which:
 *   1. POSTs to /api/auth/login via authService
 *   2. Saves the token to localStorage
 *   3. Navigates to the dashboard '/'
 *
 * Error messages from the API (e.g. "Invalid credentials") are displayed
 * inline below the form so the user understands what went wrong.
 *
 * A link to /register is provided for users without an account.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Login page component.
 * Must be rendered inside <AuthProvider> (which must be inside <BrowserRouter>).
 *
 * @returns {React.JSX.Element}
 */
export default function Login() {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── UX state ───────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Error message displayed inline (from the API or validation) */
  const [error, setError] = useState('');

  const { login } = useAuth();

  // ── Submit handler ─────────────────────────────────────────────────────────

  /**
   * Handles form submission.
   * Clears any previous error, marks the form as submitting, then delegates
   * to AuthContext.login(). Any thrown AxiosError is caught and its message
   * is displayed inline so the user can correct the input.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // On success, AuthContext navigates to '/' — no further action needed here.
    } catch (err) {
      // Extract the most user-friendly error message available
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4 py-12 animate-fadeIn">
      <div className="w-full max-w-md">

        {/* ── Brand header ───────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-premium mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">
            Welcome back
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Sign in to your Luminate CRM account
          </p>
        </div>

        {/* ── Form card ──────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-8 shadow-premium">

          {/* Inline API error banner */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg bg-danger-light border border-danger/20 px-4 py-3 text-sm text-danger font-medium"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-text-main"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@company.com"
                  disabled={isSubmitting}
                  className="
                    w-full rounded-lg border border-border-subtle bg-bg-base pl-9 pr-4 py-2.5
                    text-sm text-text-main placeholder:text-text-muted
                    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-150
                  "
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-text-main"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className="
                    w-full rounded-lg border border-border-subtle bg-bg-base pl-9 pr-10 py-2.5
                    text-sm text-text-main placeholder:text-text-muted
                    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-150
                  "
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="
                w-full flex items-center justify-center gap-2
                rounded-lg bg-primary text-white text-sm font-semibold
                px-4 py-2.5 mt-2
                hover:bg-primary-hover
                focus:outline-none focus:ring-2 focus:ring-primary/40
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200 shadow-subtle
                cursor-pointer
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-xs text-text-muted">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Create one for free
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-[11px] text-text-muted">
          Luminate CRM · Startup Suite
        </p>
      </div>
    </div>
  );
}
