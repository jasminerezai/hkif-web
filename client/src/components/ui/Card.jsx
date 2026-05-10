// A generic white container with rounded corners and a shadow.
// Used anywhere content needs to be visually grouped.
//
// Props:
//   padding   — 'none' | 'sm' | 'md' | 'lg'
//   shadow    — 'none' | 'sm' | 'md'
//   border    — 'default' | 'accent' | 'none'
//   radius    — 'md' | 'lg'
//   onClick   — makes the card clickable (adds hover lift effect)
//   as        — render as a different element, e.g. as="article"
//   children  — content inside the card
//   style     — extra inline styles on the card element

import React, { useState } from 'react'

// ── Padding options ────────────────────────────────────────────
const PADDING = {
  none: '0',
  sm:   'var(--space-3) var(--space-4)',
  md:   'var(--space-6)',
  lg:   'var(--space-8)',
}

// ── Shadow options ─────────────────────────────────────────────
const SHADOW = {
  none: 'none',
  sm:   'var(--shadow-sm)',
  md:   'var(--shadow-md)',
}

// ── Border options ─────────────────────────────────────────────
// 'accent' is used when a card needs to stand out —
// e.g. the selected activity or a featured item.
const BORDER = {
  default: '1px solid var(--color-border)',
  accent:  '2px solid var(--color-primary)',
  none:    'none',
}

export default function Card({
  children,
  padding   = 'md',
  shadow    = 'sm',
  border    = 'default',
  radius    = 'md',
  onClick,
  as: Tag   = 'div',
  // 'as' lets pages render Card as <article>, <section>, <li> etc.
  // for correct HTML semantics (activity list → article cards)
  style:    extraStyle = {},
  ...rest
}) {
  const [hovered, setHovered] = useState(false)

  // A card is clickable if an onClick handler is passed.
  // Clickable cards get a hover lift effect.
  const isClickable = typeof onClick === 'function'

  const cardStyle = {
    background:   'var(--color-surface-raised)',
    // surface-raised = white. Sits above the page surface (#f5f5f3)
    borderRadius: radius === 'lg'
                    ? 'var(--radius-lg)'
                    : 'var(--radius-md)',
    border:       BORDER[border] || BORDER.default,
    padding:      PADDING[padding] || PADDING.md,

    // Shadow gets stronger on hover when clickable —
    // gives physical feedback that this card is interactive
    boxShadow: isClickable && hovered
                 ? 'var(--shadow-md)'
                 : SHADOW[shadow] || SHADOW.sm,

    cursor:    isClickable ? 'pointer' : 'default',

    // Lift effect: card rises 2px on hover when clickable.
    // translateY(-2px) moves the element 2px upward.
    transform:   isClickable && hovered
                   ? 'translateY(-2px)'
                   : 'translateY(0)',

    transition: 'box-shadow 0.15s, transform 0.15s',
    // Smooth animation for the hover effect

    ...extraStyle,
  }

  return (
    <Tag
      onClick={onClick}
      onMouseEnter={() => isClickable && setHovered(true)}
      onMouseLeave={() => isClickable && setHovered(false)}
      // Only track hover state when card is clickable —
      // no point running state updates on non-interactive cards
      style={cardStyle}
      {...rest}
    >
      {children}
    </Tag>
  )
}