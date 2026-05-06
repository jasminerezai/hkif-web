// Single button component to be used across the entire app.
//
// Props:
//   variant   — 'primary' | 'outline' | 'ghost' | 'danger'
//   size      — 'sm' | 'md' | 'lg'
//   loading   — boolean: shows spinner and disables the button
//   disabled  — boolean: dims and blocks interaction
//   fullWidth — boolean: stretches to fill its container
//   as        — lets you render as <a> or react-router <Link>
//               e.g. <Button as={Link} to="/register">Join</Button>
//   type      — 'button' | 'submit' | 'reset' (only for <button> tag)
//   onClick   — click handler
//   children  — the label text or content inside the button

import React, { useState } from 'react'

// ── Variant definitions ────────────────────────────────────────
// Each variant has a default style and a hovered style.
// We swap between them on mouseEnter/mouseLeave because
// CSS :hover doesn't work reliably with inline styles.
const VARIANTS = {
  primary: {
    // Solid green — used for the main action on any page
    default: {
      background:  'var(--color-primary)',
      color:       '#ffffff',
      border:      '2px solid var(--color-primary)',
    },
    hover: {
      background:  'var(--color-primary-dark)',
      color:       '#ffffff',
      border:      '2px solid var(--color-primary-dark)',
    },
  },
  outline: {
    // Transparent with green border — secondary action
    default: {
      background:  'transparent',
      color:       'var(--color-primary-dark)',
      border:      '2px solid var(--color-primary)',
    },
    hover: {
      background:  'var(--color-primary-light)',
      color:       'var(--color-primary-dark)',
      border:      '2px solid var(--color-primary)',
    },
  },
  ghost: {
    // Subtle grey border — tertiary/low-emphasis action
    default: {
      background:  'transparent',
      color:       'var(--color-text-muted)',
      border:      '2px solid var(--color-border)',
    },
    hover: {
      background:  'var(--color-surface)',
      color:       'var(--color-text)',
      border:      '2px solid var(--color-border)',
    },
  },
  danger: {
    // Red — destructive actions like delete or deactivate
    default: {
      background:  'var(--color-danger)',
      color:       '#ffffff',
      border:      '2px solid var(--color-danger)',
    },
    hover: {
      background:  '#a93226',
      color:       '#ffffff',
      border:      '2px solid #a93226',
    },
  },
}

// ── Size definitions ───────────────────────────────────────────
const SIZES = {
  sm: {
    padding:    '5px 12px',
    fontSize:   'var(--text-sm)',
    gap:        '4px',
  },
  md: {
    padding:    '9px 20px',
    fontSize:   'var(--text-base)',
    gap:        '6px',
  },
  lg: {
    padding:    '12px 28px',
    fontSize:   'var(--text-lg)',
    gap:        '8px',
  },
}

// ── LoadingSpinner ─────────────────────────────────────────────
// Tiny inline spinner shown inside the button while loading.
// Uses currentColor so it always matches the button text colour.
function LoadingSpinner() {
  return (
    <span
      aria-hidden="true"
      style={{
        display:      'inline-block',
        width:        '13px',
        height:       '13px',
        border:       '2px solid rgba(255,255,255,0.35)',
        borderTop:    '2px solid currentColor',
        borderRadius: '50%',
        animation:    'spin 0.7s linear infinite',
        flexShrink:   0,
      }}
    />
  )
}

// ── Button ────────────────────────────────────────────────────
export default function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  disabled  = false,
  fullWidth = false,
  as: Tag   = 'button',
  // 'as' allows: <Button as="a" href="..."> or <Button as={Link} to="...">
  // We rename it to 'Tag' so we can use it as a JSX element name.
  // JSX element names must start with a capital letter.
  onClick,
  type      = 'button',
  style:    extraStyle = {},
  className = '',
  ...rest
  // ...rest captures any other props (href, to, aria-label, etc.)
  // and forwards them to the rendered element
}) {
  const [hovered, setHovered] = useState(false)

  // Merge disabled states: the button is non-interactive
  // if explicitly disabled OR if a loading operation is in progress
  const isDisabled = disabled || loading

  // Look up the style objects for the chosen variant and size
  const v = VARIANTS[variant] || VARIANTS.primary
  const s = SIZES[size]       || SIZES.md

  // Choose between default and hover styles
  const variantStyle = hovered && !isDisabled ? v.hover : v.default

  const buttonStyle = {
    // Layout
    display:        'inline-flex',
    // inline-flex: sits in text flow like inline, but lets us
    // use flexbox inside to centre the spinner + label
    alignItems:     'center',
    justifyContent: 'center',
    gap:            s.gap,
    width:          fullWidth ? '100%' : 'auto',

    // Sizing
    padding:    s.padding,
    fontSize:   s.fontSize,

    // Typography
    fontWeight:     600,
    fontFamily:     'var(--font-body)',
    // Must set fontFamily — buttons don't inherit it by default
    lineHeight:     1.2,
    textDecoration: 'none',
    // Prevents underline when Button is rendered as an <a> tag
    whiteSpace:     'nowrap',

    // Shape
    borderRadius: 'var(--radius-sm)',

    // Colour — comes from the variant
    ...variantStyle,

    // State
    cursor:  isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,

    // Transition — smooths out the hover colour change
    transition: 'background 0.15s, color 0.15s, border-color 0.15s, opacity 0.15s',

    // Allow caller to pass extra overrides
    ...extraStyle,
  }

  return (
    <Tag
      // Only pass type="submit" etc. when rendering as a <button>
      // <a> tags don't have a type attribute
      type={Tag === 'button' ? type : undefined}

      onClick={isDisabled ? undefined : onClick}
      // Prevent click when disabled — even if the caller passes onClick

      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}

      disabled={Tag === 'button' ? isDisabled : undefined}
      // The disabled HTML attribute only works on <button>, not <a>

      aria-busy={loading}
      // Tells screen readers the button is processing

      aria-disabled={isDisabled}
      // Tells screen readers this element is not interactive

      style={buttonStyle}
      className={className}

      {...rest}
      // Forward href, to, aria-label, data-* etc.
    >
      {loading && <LoadingSpinner />}
      {children}
    </Tag>
  )
}