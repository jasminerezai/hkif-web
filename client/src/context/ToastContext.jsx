// Global toast notification system.
// Lets any component show a temporary message in the corner of the
// screen without prop-drilling state through the tree.
//
// USAGE in any component:
//   const { showToast } = useToast()
//   showToast('Saved!', 'success')
//   showToast('Failed to load activities', 'error')
//   showToast('Heads up — your changes are unsaved', 'info')
//
// Each toast auto-dismisses after ~4 seconds. They stack vertically
// in the order they were created.

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import Toaster from '../components/ui/Toaster.jsx'

// ── Defaults ──────────────────────────────────────────────────
const DEFAULT_DURATION = 4000
// 4s is long enough to read a one-line message but short enough that
// errors don't pile up forever if a few requests fail in a row.

// ── Context ───────────────────────────────────────────────────
const ToastContext = createContext(null)

export function ToastProvider({ children }) {

  // Each toast: { id, message, type, duration }
  // Array (not Map) because rendering order matters for stacking.
  const [toasts, setToasts] = useState([])

  // Stable id generator. Using a counter ref instead of Date.now()
  // because two toasts created in the same tick would collide on
  // timestamp and React would warn about duplicate keys.
  const nextId = useRef(0)

  // ── removeToast ─────────────────────────────────────────────
  // Pulled out so individual toasts can dismiss themselves
  // (via the close button) without going through showToast.
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // ── showToast ───────────────────────────────────────────────
  // The one function components import.
  // Returns the toast id so the caller can dismiss it early
  // (e.g. clear a "Saving..." toast once save succeeds).
  const showToast = useCallback((
    message,
    type     = 'info',
    duration = DEFAULT_DURATION,
  ) => {
    const id = nextId.current++

    setToasts(prev => [...prev, { id, message, type, duration }])

    // Auto-dismiss. Toaster itself doesn't own this timer because
    // it's purely presentational — keeping all lifecycle logic
    // here in the provider keeps the source of truth in one place.
    //
    // duration <= 0 means "sticky toast" — caller dismisses it manually.
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }

    return id
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Toaster sits inside the provider so it can receive
          the toasts list directly via props. Putting it here
          (rather than in App.jsx) means anyone who uses the
          provider automatically gets the UI for free. */}
      <Toaster toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

// ── useToast ──────────────────────────────────────────────────
// The only hook component code should import from this file.
// Throws loudly if used outside the provider — better than failing
// silently when someone forgets to wrap a route in <ToastProvider>.
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast() must be used inside <ToastProvider>')
  }
  return ctx
}