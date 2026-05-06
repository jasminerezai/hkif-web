// A labelled form field with built-in error and hint display.
// Handles its own focus styling so pages don't need any input CSS.
//
// Props:
//   label    — string shown above the field
//   error    — string shown below in red when validation fails
//   hint     — string shown below in grey as helper text
//   id       — ties the label to the input for accessibility
//              auto-generated from label if not provided
//   style    — extra styles on the wrapper div
//   ...rest  — any valid <input> props: type, value, onChange,
//              placeholder, disabled, autoFocus, autoComplete, etc.

import React, { useState } from 'react'

export default function Input({
  label,
  error,
  hint,
  id,
  style: extraStyle = {},
  ...rest
  // ...rest captures type, value, onChange, placeholder, disabled,
  // autoFocus, autoComplete, required, name, min, max, etc.
  // They all get spread onto the <input> element below.
}) {
  const [focused, setFocused] = useState(false)
  // focused: true when the user has clicked into this field.
  // We use this to show a green focus ring — CSS :focus doesn't
  // work reliably when mixing inline styles and class styles.

  // Auto-generate an id from the label text if none is provided.
  // This ties the <label> to the <input> for screen readers:
  // clicking the label focuses the input.
  // e.g. label="Email address" → id="email-address"
  const inputId = id || (label
    ? label.toLowerCase().replace(/\s+/g, '-')
    : undefined)

  // ── Border colour logic ─────────────────────────────────────
  // Priority: error (red) > focused (green) > default (grey)
  let borderColor = 'var(--color-border)'
  if (error)   borderColor = 'var(--color-danger)'
  if (focused && !error) borderColor = 'var(--color-primary)'

  // ── Focus ring (box-shadow) ─────────────────────────────────
  // A soft coloured glow behind the border — matches the HKR
  // design system and helps users with low vision find the cursor.
  let boxShadow = 'none'
  if (focused && !error) boxShadow = '0 0 0 3px rgba(90,158,31,0.15)'
  if (error)             boxShadow = '0 0 0 3px rgba(192,57,43,0.12)'

  return (
    <div style={{
      // The wrapper stacks: label → input → error/hint
      display:       'flex',
      flexDirection: 'column',
      gap:           'var(--space-1)',
      // gap between label and input, and input and helper text
      width:         '100%',
      ...extraStyle,
    }}>

      {/* Label — only rendered if the label prop is provided */}
      {label && (
        <label
          htmlFor={inputId}
          // htmlFor must match the input's id for accessibility
          style={{
            fontSize:   'var(--text-sm)',
            fontWeight: 600,
            color:      error ? 'var(--color-danger)' : 'var(--color-text)',
            // Label turns red when there's a validation error
            // so the user immediately sees which field has a problem
            lineHeight: 1.3,
          }}
        >
          {label}
        </label>
      )}

      {/* The actual input element */}
      <input
        id={inputId}

        onFocus={() => setFocused(true)}
        // Called when user clicks or tabs into the field

        onBlur={() => setFocused(false)}
        // Called when user leaves the field
        // We keep error visible after blur so users see what to fix

        style={{
          width:        '100%',
          padding:      '9px 13px',
          border:       `1.5px solid ${borderColor}`,
          borderRadius: 'var(--radius-sm)',
          fontSize:     'var(--text-base)',
          fontFamily:   'var(--font-body)',
          // Must set — inputs don't inherit font-family
          color:        'var(--color-text)',
          background:   rest.disabled ? 'var(--color-surface)' : '#ffffff',
          // Dimmed background when disabled so it looks non-interactive
          outline:      'none',
          // Remove browser default focus ring — we use box-shadow instead
          boxShadow,
          transition:   'border-color 0.15s, box-shadow 0.15s',
          cursor:       rest.disabled ? 'not-allowed' : 'text',
          opacity:      rest.disabled ? 0.65 : 1,
          lineHeight:   1.5,
        }}

        {...rest}
        // Spread all other props: type, value, onChange,
        // placeholder, disabled, autoFocus, autoComplete, etc.
      />

      {/* Error message — shown when error prop is set */}
      {error && (
        <p style={{
          fontSize:  'var(--text-xs)',
          color:     'var(--color-danger)',
          marginTop: '1px',
          lineHeight: 1.3,
        }}>
          {error}
        </p>
      )}

      {/* Hint text — shown when hint is set and there's no error */}
      {hint && !error && (
        <p style={{
          fontSize:  'var(--text-xs)',
          color:     'var(--color-text-muted)',
          marginTop: '1px',
          lineHeight: 1.3,
        }}>
          {hint}
        </p>
      )}

    </div>
  )
}