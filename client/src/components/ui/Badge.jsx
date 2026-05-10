// A small coloured pill label.
// Can be used for status indicators and role tags throughout the app.
//
// Props:
//   variant  — controls the colour scheme
//   style    — extra inline styles
//   children — the label text
//
// Variants:
//   success  — green  — active sessions, positive states
//   danger   — red    — cancelled, errors, destructive
//   warning  — amber  — delayed, pending, caution
//   neutral  — grey   — inactive, default role (USER)
//   info     — blue   — informational, board member role

import React from 'react'

// ── Variant colour map ─────────────────────────────────────────
// Each variant has a background tint and a darker text colour.
// The tint is always the light version of the semantic colour
// from index.css so they stay consistent with the design tokens.
const VARIANTS = {
  success: {
    background: 'var(--color-primary-light)',
    color:      'var(--color-primary-dark)',
  },
  danger: {
    background: 'var(--color-danger-light)',
    color:      'var(--color-danger)',
  },
  warning: {
    background: 'var(--color-warning-light)',
    color:      'var(--color-warning)',
  },
  neutral: {
    background: '#f0f0ee',
    color:      '#555555',
  },
  info: {
    background: '#e8f0fc',
    color:      '#1a5fac',
  },
}

// ── STATUS_VARIANT ─────────────────────────────────────────────
// Tryed to match status strings backend returns
// to the correct badge variant.
//
// can bu used on ActivitiesPage or WeeklyCalendar:
//   import Badge, { STATUS_VARIANT } from '../components/ui/Badge.jsx'
//   <Badge variant={STATUS_VARIANT[activity.status]}>
//     {activity.status}
//   </Badge>
//
// The values match the backend's ActivityStatus enum in schema.prisma
export const STATUS_VARIANT = {
  ACTIVE:    'success',
  INACTIVE:  'neutral',
  CANCELLED: 'danger',
  DELAYED:   'warning',
}

// ── ROLE_VARIANT ───────────────────────────────────────────────
// Maps the backend's ProfileRole enum values to badge variants.
//
// Usage in ProfilePage:
//   import Badge, { ROLE_VARIANT } from '../components/ui/Badge.jsx'
//   <Badge variant={ROLE_VARIANT[user.role]}>{user.role}</Badge>
export const ROLE_VARIANT = {
  USER:         'neutral',
  LEADER:       'success',
  BOARD_MEMBER: 'info',
  ADMIN:        'warning',
}

// ── Badge component ────────────────────────────────────────────
export default function Badge({
  children,
  variant = 'success',
  style:  extraStyle = {},
}) {
  const v = VARIANTS[variant] || VARIANTS.neutral
  // Fall back to neutral if an unknown variant is passed

  return (
    <span style={{
      display:       'inline-block',
      // inline-block: sits in text flow but respects
      // padding and border-radius
      padding:       '2px 10px',
      borderRadius:  'var(--radius-xl)',
      // radius-xl = 20px — creates the pill shape

      fontSize:      'var(--text-xs)',
      fontWeight:    700,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      // Uppercase + letter-spacing makes short labels
      // like "USER" more readable at small sizes

      whiteSpace:    'nowrap',
      // Prevent the badge text from wrapping to a second line

      background:    v.background,
      color:         v.color,

      ...extraStyle,
    }}>
      {children}
    </span>
  )
}