// The register page. Accessible at /register.
// Public route — no authentication required.
//
// What this page does:
//   1. Shows a form: name, email, password, confirm password
//   2. Validates all four fields before hitting the API
//   3. Calls register() from AuthContext on submit
//   4. On success: AuthContext saves the JWT, page redirects to /
//   5. On failure: shows the error message from the server
//
// Backend expects: POST /api/auth/register { email, password, name }
// Backend validates: password must be >= 8 characters (auth.controller.ts)

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Button, Input, Card } from '../components/ui'

export default function RegisterPage() {
  const { register } = useAuth()
  // register() from AuthContext calls registerRequest() in AuthService.js,
  // then saves the JWT and user to state + localStorage automatically.

  const navigate = useNavigate()

  // ── Form state ────────────────────────────────────────────────
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  // Four controlled inputs — each has its own state value.

  // ── Error state ───────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState({})
  // fieldErrors shape: { name: '...', email: '...', password: '...', confirm: '...' }
  // Only the keys that have errors are populated.

  const [serverError, setServerError] = useState('')
  // Catches errors from the backend: duplicate email, server down, etc.

  // ── Loading state ─────────────────────────────────────────────
  const [loading, setLoading] = useState(false)

  // ── Client-side validation ────────────────────────────────────
  // We mirror the backend validation (auth.controller.ts) so users
  // get instant feedback without a round-trip to the server.
  function validate() {
    const errors = {}

    if (!name.trim()) {
      errors.name = 'Full name is required.'
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.'
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.'
    } else if (!email.includes('@') || !email.includes('.')) {
      errors.email = 'Enter a valid email address.'
    }

    if (!password) {
      errors.password = 'Password is required.'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
      // The backend also enforces this (auth.controller.ts line 20).
      // We check it here too so the user doesn't wait for a round-trip.
    }

    if (!confirm) {
      errors.confirm = 'Please confirm your password.'
    } else if (confirm !== password) {
      errors.confirm = 'Passwords do not match.'
      // This is a frontend-only check — the backend doesn't receive
      // the confirm field at all. We just compare the two values here.
    }

    return errors
  }

  // ── Form submit handler ───────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()

    setFieldErrors({})
    setServerError('')

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      await register(email, password, name.trim())
      // name.trim() removes leading/trailing whitespace.
      // The backend stores whatever we send, so trim it before sending.
      //
      // register() in AuthContext calls registerRequest(email, password, name)
      // which POSTs to /api/auth/register.
      // On success: saves JWT and user, returns the user object.
      // On failure: throws an Error with the server's message.

      navigate('/', { replace: true })
      // After successful registration, always go to home.
      // replace: true so the back button doesn't return to /register.

    } catch (err) {
      setServerError(err.message)
      // Common server errors:
      // - "User with this email already exists" (duplicate email)
      // - "Please provide email, password, and name" (missing fields)
      // - "Password must be at least 8 characters long" (backend validation)

    } finally {
      setLoading(false)
    }
  }

  // ── Password strength indicator ───────────────────────────────
  // Visual hint while the user types their password.
  // Not a hard block — validation handles that.
  function getPasswordStrength() {
    if (!password) return null
    if (password.length < 8)  return { label: 'Too short',  color: 'var(--color-danger)'  }
    if (password.length < 12) return { label: 'Acceptable', color: 'var(--color-warning)'  }
    return                           { label: 'Strong',      color: 'var(--color-success)'  }
  }

  const strength = getPasswordStrength()

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <Card style={S.card} shadow="md">

        {/* ── Header ── */}
        <div style={S.header}>
          <h1 style={S.title}>Create account</h1>
          <p style={S.subtitle}>Join Högskolan Kristianstad IF</p>
        </div>

        {/* ── Server error ── */}
        {serverError && (
          <div style={S.errorBanner} role="alert">
            {serverError}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate style={S.form}>

          <Input
            label="Full name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            error={fieldErrors.name}
            autoFocus
            autoComplete="name"
            disabled={loading}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="you@student.hkr.se"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={fieldErrors.email}
            autoComplete="email"
            disabled={loading}
          />

          {/* Password field with strength indicator */}
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={fieldErrors.password}
              autoComplete="new-password"
              // "new-password" tells password managers this is a
              // registration form — they offer to generate a strong password.
              disabled={loading}
            />
            {/* Show strength indicator when user starts typing
                but only when there's no validation error showing */}
            {strength && !fieldErrors.password && (
              <p style={{ fontSize: 'var(--text-xs)', color: strength.color, marginTop: 'var(--space-1)' }}>
                Password strength: {strength.label}
              </p>
            )}
          </div>

          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            error={fieldErrors.confirm}
            autoComplete="new-password"
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            style={{ marginTop: 'var(--space-2)' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </Button>

        </form>

        {/* ── Login link ── */}
        <div style={S.footer}>
          <p style={S.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={S.footerLink}>
              Sign in here
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
    padding:        'var(--space-6)',
    background:     'var(--color-surface)',
  },
  card: {
    width:    '100%',
    maxWidth: '400px',
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