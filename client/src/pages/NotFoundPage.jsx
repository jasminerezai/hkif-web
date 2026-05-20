// Renders when the user lands on a URL that doesn't match any route.
// Wired into App.jsx as the catch-all (path="*").
//
// Auth-aware: if the user is logged in we offer them shortcuts back
// to the pages most likely to be useful (Schedule, Activities, their
// Profile). Logged-out users get the public shortcuts only — no
// point pointing them at a route they'd be redirected away from.
//
// Why not just redirect to / silently:
//   The previous App.jsx catch-all did exactly that. The trade-off
//   was that any broken internal link looked like "home page opened
//   for no reason" — impossible to spot in QA. A real 404 surface
//   makes routing bugs obvious during development and tells users
//   pasting bad URLs what actually happened.

import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Button, Card } from '../components/ui'

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div
      style={{
        // page-wrapper spacing matches LoginPage / RegisterPage so
        // the 404 doesn't feel visually disconnected from the rest
        // of the app — same vertical rhythm as the auth pages.
        padding:        'var(--space-12) var(--space-6) var(--space-20)',
        maxWidth:       '720px',
        margin:         '0 auto',
        textAlign:      'center',
      }}
    >
      {/* ── 404 — oversized, serif, brand-aligned ─────────── */}
      <p
        aria-hidden="true"
        // aria-hidden because the "404" is decorative — the
        // <h1> below carries the actual page meaning for
        // screen readers.
        style={{
          fontFamily:    'var(--font-serif)',
          fontSize:      'clamp(5rem, 18vw, 9rem)',
          // clamp() scales the giant 404 between 5rem and 9rem
          // based on viewport width — keeps it readable on phones
          // without dominating on desktop.
          fontWeight:    700,
          lineHeight:    1,
          color:         'var(--color-primary)',
          marginBottom:  'var(--space-4)',
          letterSpacing: '-0.04em',
        }}
      >
        404
      </p>

      {/* ── Headline ──────────────────────────────────────── */}
      <h1
        style={{
          fontFamily:    'var(--font-serif)',
          fontSize:      'var(--text-3xl)',
          marginBottom:  'var(--space-3)',
          color:         'var(--color-text)',
        }}
      >
        Page not found
      </h1>

      {/* ── Explainer ─────────────────────────────────────── */}
      <p
        style={{
          color:        'var(--color-text-muted)',
          fontSize:     'var(--text-lg)',
          marginBottom: 'var(--space-8)',
          lineHeight:   1.5,
        }}
      >
        We couldn&apos;t find what you were looking for. The link may
        be broken, or the page may have moved.
      </p>

      {/* ── Quick links card ──────────────────────────────── */}
      {/* Wrapping the shortcuts in a Card keeps them visually
          anchored on the page (a row of bare buttons would
          float awkwardly in the centred layout). */}
      <Card padding="lg" shadow="sm">
        <p
          style={{
            fontSize:     'var(--text-sm)',
            fontWeight:   600,
            color:        'var(--color-text-muted)',
            marginBottom: 'var(--space-4)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          Try one of these instead
        </p>

        <div
          style={{
            display:        'flex',
            gap:            'var(--space-3)',
            justifyContent: 'center',
            flexWrap:       'wrap',
            // flex-wrap so the row collapses to two-up / one-up on
            // narrow viewports instead of overflowing horizontally.
          }}
        >
          {/* Schedule = home. Always shown (public route). */}
          <Button as={Link} to="/" size="md">
            Schedule
          </Button>

          {/* Activities — also public. */}
          <Button as={Link} to="/activities" variant="outline" size="md">
            Activities
          </Button>

          {/* Logged-in users get a profile shortcut; logged-out
              users get a login shortcut instead. We deliberately
              don't show "Profile" to anonymous users — clicking
              it would just bounce them through ProtectedRoute
              to /login anyway, which is a confusing extra hop. */}
          {isAuthenticated ? (
            <Button as={Link} to="/profile" variant="ghost" size="md">
              My profile
            </Button>
          ) : (
            <Button as={Link} to="/login" variant="ghost" size="md">
              Log in
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}