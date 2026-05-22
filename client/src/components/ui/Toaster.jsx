// Renders the currently-active toasts in a fixed corner of the screen.
// Purely presentational — it doesn't know how toasts are created or
// dismissed, only that it receives a list and an onDismiss callback.
//
// Visual treatment matches the existing design tokens so toasts feel
// like the rest of the app (same red as cancellation banners, same
// green as the primary action color, etc).

import React from 'react'

// ── Per-type styling ──────────────────────────────────────────
// One source of truth so error / success / info stay visually
// consistent with the cancellation badges, form errors, and the
// favorites-load warning already in SchedulePage.
const STYLES = {
  error: {
    background: 'var(--color-danger-light)',
    color:      'var(--color-danger)',
    borderLeft: '4px solid var(--color-danger)',
  },
  success: {
    background: 'var(--color-success-light)',
    color:      'var(--color-success)',
    borderLeft: '4px solid var(--color-success)',
  },
  info: {
    background: 'var(--color-surface-raised)',
    color:      'var(--color-text)',
    borderLeft: '4px solid var(--color-primary)',
  },
}

export default function Toaster({ toasts, onDismiss }) {

  // Nothing to render → return null. Avoids an empty fixed-position
  // <div> sitting on top of everything for no reason (it would also
  // block clicks in the bottom-right corner if pointer-events were
  // ever toggled on by mistake).
  if (toasts.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      // aria-live="polite" lets screen readers announce new toasts
      // without interrupting whatever the user is currently doing.
      style={{
        position:      'fixed',
        bottom:        'var(--space-6)',
        right:         'var(--space-6)',
        display:       'flex',
        flexDirection: 'column-reverse',
        // column-reverse keeps the newest toast visually at the
        // bottom while older ones float upward as new ones arrive.
        gap:           'var(--space-3)',
        zIndex:        9999,
        // Above the Modal component's z-index so error toasts are
        // still visible when an error fires from inside a modal.
        maxWidth:      '360px',
        pointerEvents: 'none',
        // The container itself doesn't catch clicks — only the
        // toast cards do (see pointerEvents: 'auto' below). This
        // means dead space around toasts stays interactive for
        // whatever is underneath them.
      }}
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          style={{
            ...(STYLES[toast.type] || STYLES.info),
            padding:       'var(--space-3) var(--space-4)',
            borderRadius:  'var(--radius-md)',
            boxShadow:     'var(--shadow-md)',
            fontSize:      'var(--text-sm)',
            display:       'flex',
            alignItems:    'flex-start',
            gap:           'var(--space-3)',
            pointerEvents: 'auto',
            animation:     'hkif-toast-in 0.18s ease-out',
            // keyframes are defined in index.css so we can reuse
            // them later for an exit animation if we want one.
          }}
        >
          <span style={{ flex: 1, lineHeight: 1.4 }}>
            {toast.message}
          </span>

          {/* Manual dismiss — useful for long error messages
              the user wants to clear before the auto-timeout. */}
          <button
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            style={{
              background: 'none',
              border:     'none',
              color:      'inherit',
              cursor:     'pointer',
              fontSize:   'var(--text-lg)',
              lineHeight: 1,
              padding:    0,
              opacity:    0.7,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}