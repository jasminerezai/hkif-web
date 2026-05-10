// A dialog that appears centred over the page with a dark backdrop.
// Traps focus and closes on Escape key or backdrop click.
//
// Props:
//   open      — boolean: controls whether the modal is visible
//   onClose   — function: called when user closes the modal
//   title     — string: shown in the modal header
//   children  — content rendered inside the modal body
//   maxWidth  — string: max-width of the modal box (default '440px')

import React, { useEffect, useRef } from 'react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = '440px',
}) {

  // ── Close on Escape key ───────────────────────────────────────
  // useEffect runs after render. The return function "cleans up"
  // by removing the event listener when the modal closes or unmounts.
  useEffect(() => {
    if (!open) return
    // If modal is closed there's no listener to add

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      // Cleanup: remove the listener when modal closes.
      // Without this, old listeners would stack up every time
      // the modal opens and closes.
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])
  // Re-run this effect when open or onClose changes

  // ── Prevent background scrolling while open ───────────────────
  // When a modal is open you don't want the page behind it to scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      // Always restore scrolling when component unmounts
      document.body.style.overflow = ''
    }
  }, [open])

  // ── Focus management ──────────────────────────────────────────
  // Move focus into the modal when it opens so keyboard users
  // don't have to tab all the way from the top of the page
  const modalRef = useRef(null)

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus()
    }
  }, [open])

  // ── Don't render when closed ──────────────────────────────────
  // Returning null removes the modal from the DOM entirely.
  // This is better than just hiding it with display:none because
  // screen readers won't pick it up when it's not rendered.
  if (!open) return null

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────── */}
      {/* Semi-transparent overlay behind the modal.
          Clicking it closes the modal — common expected behaviour. */}
      <div
        onClick={onClose}
        aria-hidden="true"
        // aria-hidden: backdrop is decorative — screen readers ignore it
        style={{
          position:   'fixed',
          // fixed: stays in place even when page is scrolled
          inset:      0,
          // inset: 0 is shorthand for top:0, right:0, bottom:0, left:0
          // covers the entire viewport
          background: 'rgba(0, 0, 0, 0.45)',
          zIndex:     200,
        }}
      />

      {/* ── Modal box ─────────────────────────────────────────── */}
      <div
        ref={modalRef}
        role="dialog"
        // role="dialog": tells screen readers this is a modal dialog
        aria-modal="true"
        // aria-modal: tells screen readers to ignore content behind it
        aria-labelledby="modal-title"
        // aria-labelledby points to the heading inside the modal
        tabIndex={-1}
        // tabIndex=-1: allows the div to receive focus programmatically
        // (via modalRef.current.focus()) without appearing in tab order
        style={{
          position:   'fixed',
          top:        '50%',
          left:       '50%',
          transform:  'translate(-50%, -50%)',
          // This combination of top/left/transform perfectly centres
          // the modal regardless of its dimensions
          zIndex:     201,
          // One above the backdrop so it renders on top
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow:  'var(--shadow-lg)',
          padding:    'var(--space-8)',
          width:      '90%',
          // 90% width on small screens so it doesn't touch the edges
          maxWidth:   maxWidth,
          maxHeight:  '90vh',
          // Limit height so the modal doesn't overflow the viewport
          overflowY:  'auto',
          // If content is taller than 90vh, scroll inside the modal
          outline:    'none',
          // Remove the default focus outline from the div —
          // the modal itself is visually obvious enough
        }}
      >

        {/* ── Modal header ────────────────────────────────────── */}
        <div style={{
          display:        'flex',
          alignItems:     'flex-start',
          justifyContent: 'space-between',
          gap:            'var(--space-4)',
          borderBottom:   '3px solid var(--color-primary)',
          paddingBottom:  'var(--space-4)',
          marginBottom:   'var(--space-6)',
        }}>
          <h2
            id="modal-title"
            // id matches aria-labelledby above —
            // screen readers announce this heading when modal opens
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize:   'var(--text-xl)',
              color:      'var(--color-text)',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background:   'none',
              border:       'none',
              fontSize:     '1.1rem',
              color:        'var(--color-text-muted)',
              cursor:       'pointer',
              padding:      '2px 6px',
              borderRadius: 'var(--radius-sm)',
              lineHeight:   1,
              flexShrink:   0,
              // flexShrink:0 — don't let the close button compress
              // when the title is long
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Modal body — whatever is passed as children ──────── */}
        {children}

      </div>
    </>
  )
}