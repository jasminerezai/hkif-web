// The login page. Accessible at /login.
// Public route — no authentication required to view it.
//
// What this page does:
//   1. Shows a form with email and password fields
//   2. Validates inputs before hitting the API
//   3. Calls login() from AuthContext on submit
//   4. On success: AuthContext saves the JWT, this page redirects to /
//   5. On failure: shows the error message from the server
//
// What this page does NOT do:
//   - Touch localStorage directly (AuthContext handles that)
//   - Call fetch() directly (AuthService handles that)
//   - Store the token itself (AuthContext handles that)

import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
// useNavigate: returns a function to programmatically change the URL
// useLocation: reads the current URL — used to send users back to
//              where they were before being redirected to /login

import { useAuth } from '../context/AuthContext.jsx'
import { Button, Input, Card } from '../components/ui'
// Importing from the barrel export (index.jsx) — one clean import line

export default function LoginPage() {
  const { login } = useAuth()
  // login() is async. It calls the API, saves the JWT to localStorage,
  // updates the user state in AuthContext, and returns the user object.
  // If the API returns an error, login() throws — we catch it below.

  const navigate  = useNavigate()
  const location  = useLocation()

  // If the user was redirected here from a protected page (e.g. /profile),
  // ProtectedRoute in App.jsx passes the blocked URL via location.state.from.
  // After login we send them back there instead of always going to /.
  // Example: user tries to visit /profile → redirected to /login →
  //          logs in → sent back to /profile automatically.
  const redirectTo = location.state?.from?.pathname || '/'
  // ?. is optional chaining — safely reads nested properties.
  // If location.state is null, this returns undefined instead of crashing.
  // || '/' means "fall back to home if no redirect target was set"

  // ── Form state ────────────────────────────────────────────────
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  // These are controlled inputs — React owns the values,
  // not the browser. Every keystroke updates state via onChange.

  // ── Validation errors ─────────────────────────────────────────
  // fieldErrors: shows red text under each specific field
  // serverError: shows the error from the API at the top of the form
  const [fieldErrors,  setFieldErrors]  = useState({})
  const [serverError,  setServerError]  = useState('')
  // Separate state for each kind of error:
  // fieldErrors catches problems before the API call (client-side)
  // serverError catches problems from the API (wrong password, etc.)

  // ── Loading state ─────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  // Disables the button and shows a spinner during the API call.
  // Prevents double-submitting if the user clicks twice.

  // ── Client-side validation ────────────────────────────────────
  // Run before the API call so we don't waste a network request
  // on obviously wrong input (empty fields, malformed email).
  function validate() {
    const errors = {}

    if (!email.trim()) {
      errors.email = 'Email address is required.'
    } else if (!email.includes('@') || !email.includes('.')) {
      errors.email = 'Enter a valid email address.'
    }

    if (!password) {
      errors.password = 'Password is required.'
    }

    return errors
    // Returns an empty object {} if everything is valid.
    // Returns { email: '...' } or { password: '...' } if not.
  }

  // ── Form submit handler ───────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    // e.preventDefault() stops the browser's default form behaviour.
    // Without this, the page would reload and lose all state.

    // Reset errors from any previous attempt
    setFieldErrors({})
    setServerError('')

    // Run client-side validation first
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      // Object.keys(errors).length > 0 means there is at least one error.
      setFieldErrors(errors)
      return
      // Stop here — don't call the API with invalid data.
    }

    setLoading(true)

    try {
      await login(email, password)
      // login() is from AuthContext. Internally it:
      //   1. Calls loginRequest(email, password) in AuthService.js
      //   2. Gets { user, token } back from the backend
      //   3. Saves user to React state
      //   4. Saves token to localStorage under 'hkif_token'
      //   5. Saves user to localStorage under 'hkif_user'
      //   6. Returns the user object
      //
      // If the backend returns an error (wrong password, user not found),
      // loginRequest throws an Error and this catch block runs instead.

      navigate(redirectTo, { replace: true })
      // replace: true means this replaces the /login entry in browser history.
      // Without replace, pressing back from / would go back to /login,
      // which is confusing for a logged-in user.

    } catch (err) {
      // err.message comes from AuthService.js:
      //   throw new Error(json.message || 'Login failed. Please try again.')
      // json.message comes from the backend's errorHandler.ts
      setServerError(err.message)

    } finally {
      setLoading(false)
      // finally always runs — whether login succeeded or failed.
      // Always re-enable the button so the user can try again.
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <Card style={S.card} shadow="md">

        {/* ── Header ── */}
        <div style={S.header}>
          <h1 style={S.title}>Sign in</h1>
          <p style={S.subtitle}>Högskolan Kristianstad IF</p>
        </div>

        {/* ── Server error — shown when API returns an error ── */}
        {serverError && (
          <div style={S.errorBanner} role="alert">
            {/* role="alert" tells screen readers to announce this immediately */}
            {serverError}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate style={S.form}>
          {/* noValidate: disables the browser's built-in HTML5 validation
              bubbles. We show our own error messages instead which are
              styled consistently with the rest of the app. */}

          <Input
            label="Email address"
            type="email"
            placeholder="you@student.hkr.se"
            value={email}
            onChange={e => setEmail(e.target.value)}
            // e.target.value is the current text in the input field.
            // Calling setEmail updates state, React re-renders,
            // the input shows the new value. This is a controlled input.
            error={fieldErrors.email}
            // Input component shows this string in red below the field.
            // undefined (no error) means nothing is shown.
            autoFocus
            // autoFocus: browser moves the cursor here when the page loads.
            // Saves the user a click.
            autoComplete="email"
            // Tells the browser this is an email field — enables autofill.
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            // type="password" masks the characters as the user types.
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={fieldErrors.password}
            autoComplete="current-password"
            // "current-password" tells password managers this is a login,
            // not a "create new password" field. Enables correct autofill.
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            style={{ marginTop: 'var(--space-2)' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

        </form>

        {/* ── Register link ── */}
        <div style={S.footer}>
          <p style={S.footerText}>
            No account yet?{' '}
            {/* {' '} adds a space — JSX removes whitespace between elements */}
            <Link to="/register" style={S.footerLink}>
              Sign up here
            </Link>
          </p>
        </div>

      </Card>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────
const S = {
  page: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    minHeight:      'calc(100vh - var(--nav-height))',
    // Fill the full viewport minus the navbar height.
    // calc() mixes units: 100vh (viewport) - 64px (navbar).
    padding:        'var(--space-6)',
    background:     'var(--color-surface)',
  },
  card: {
    width:    '100%',
    maxWidth: '400px',
    // maxWidth caps the card width on large screens.
    // width: 100% makes it fill the screen on mobile.
  },
  header: {
    borderBottom:  '3px solid var(--color-primary)',
    paddingBottom: 'var(--space-4)',
    marginBottom:  'var(--space-6)',
  },
  title: {
    fontFamily:   'var(--font-serif)',
    fontSize:     'var(--text-2xl)',
    fontWeight:   700,
    color:        'var(--color-text)',
    marginBottom: 'var(--space-1)',
  },
  subtitle: {
    fontSize: 'var(--text-sm)',
    color:    'var(--color-text-muted)',
  },
  errorBanner: {
    background:   'var(--color-danger-light)',
    borderLeft:   '4px solid var(--color-danger)',
    color:        'var(--color-danger)',
    padding:      'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-sm)',
    fontSize:     'var(--text-sm)',
    marginBottom: 'var(--space-4)',
    lineHeight:   1.5,
  },
  form: {
    display:       'flex',
    flexDirection: 'column',
    gap:           'var(--space-4)',
    // gap between Input fields — cleaner than marginBottom on each
  },
  footer: {
    marginTop:  'var(--space-6)',
    paddingTop: 'var(--space-4)',
    borderTop:  '1px solid var(--color-border)',
    textAlign:  'center',
  },
  footerText: {
    fontSize: 'var(--text-sm)',
    color:    'var(--color-text-muted)',
  },
  footerLink: {
    color:      'var(--color-primary-dark)',
    fontWeight: 600,
  },
}