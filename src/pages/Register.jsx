/**
 * @fileoverview Register page for Startup CRM Lite.
 *
 * Renders a registration form with:
 *   - Name, email, password, confirm password fields
 *   - Client-side validation (password match, minimum 6 chars)
 *   - Server-side error display (e.g. "Email already exists")
 *   - Loading state on the submit button during the API request
 *
 * On successful registration, AuthContext saves the token and navigates to '/'.
 * A link to /login is provided for existing users.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Register page component.
 * Must be rendered inside <AuthProvider> (which must be inside <BrowserRouter>).
 *
 * @returns {React.JSX.Element}
 */
export default function Register() {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── UX state ───────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Inline error messages keyed by field (or 'form' for general errors) */
  const [errors, setErrors] = useState({});

  const { register } = useAuth();

  // ── Client-side validation ─────────────────────────────────────────────────

  /**
   * Validates the form fields client-side before hitting the API.
   * Returns an error map; an empty object means validation passed.
   *
   * @returns {{ name?: string, email?: string, password?: string, confirmPassword?: string }}
   */
  const validate = () => {
    /** @type {Record<string, string>} */
    const errs = {};

    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    return errs;
  };

  // ── Submit handler ─────────────────────────────────────────────────────────

  /**
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation first
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await register(name.trim(), email.trim(), password);
      // Success: AuthContext navigates to '/'
    } catch (err) {
      // Server-side errors (e.g. email already exists, validation failures)
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        'Registration failed. Please try again.';
      setErrors({ form: serverMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shared field clear helper ──────────────────────────────────────────────
  const clearError = (field) =>
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

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
            Create your account
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Get started with Luminate CRM — free for startups
          </p>
        </div>

        {/* ── Form card ──────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-8 shadow-premium">

          {/* General API error banner */}
          {errors.form && (
            <div
              role="alert"
              className="mb-5 rounded-lg bg-danger-light border border-danger/20 px-4 py-3 text-sm text-danger font-medium"
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Name field */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold text-text-main"
              >
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError('name'); }}
                  placeholder="Sai Dhanvesh"
                  disabled={isSubmitting}
                  className={`
                    w-full rounded-lg border bg-bg-base pl-9 pr-4 py-2.5
                    text-sm text-text-main placeholder:text-text-muted
                    focus:outline-none focus:ring-2
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-150
                    ${errors.name
                      ? 'border-danger focus:border-danger focus:ring-danger/20'
                      : 'border-border-subtle focus:border-primary focus:ring-primary/20'
                    }
                  `}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-danger mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-text-main"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                  placeholder="you@company.com"
                  disabled={isSubmitting}
                  className={`
                    w-full rounded-lg border bg-bg-base pl-9 pr-4 py-2.5
                    text-sm text-text-main placeholder:text-text-muted
                    focus:outline-none focus:ring-2
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-150
                    ${errors.email
                      ? 'border-danger focus:border-danger focus:ring-danger/20'
                      : 'border-border-subtle focus:border-primary focus:ring-primary/20'
                    }
                  `}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold text-text-main"
              >
                Password
                <span className="font-normal text-text-muted ml-1">(min 6 characters)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className={`
                    w-full rounded-lg border bg-bg-base pl-9 pr-10 py-2.5
                    text-sm text-text-main placeholder:text-text-muted
                    focus:outline-none focus:ring-2
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-150
                    ${errors.password
                      ? 'border-danger focus:border-danger focus:ring-danger/20'
                      : 'border-border-subtle focus:border-primary focus:ring-primary/20'
                    }
                  `}
                />
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
              {errors.password && (
                <p className="text-xs text-danger mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-semibold text-text-main"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <input
                  id="register-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className={`
                    w-full rounded-lg border bg-bg-base pl-9 pr-10 py-2.5
                    text-sm text-text-main placeholder:text-text-muted
                    focus:outline-none focus:ring-2
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-150
                    ${errors.confirmPassword
                      ? 'border-danger focus:border-danger focus:ring-danger/20'
                      : 'border-border-subtle focus:border-primary focus:ring-primary/20'
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors cursor-pointer"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-danger mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting}
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
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-xs text-text-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
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
