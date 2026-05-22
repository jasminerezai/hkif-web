// Generic shimmering placeholder bar.
// Drop this anywhere content is about to load — title, paragraph,
// avatar circle, button — and size it to roughly match the real
// thing it's standing in for.
//
// Props:
//   width    — string (e.g. '100%', '60%', '120px'). Default '100%'.
//   height   — string. Default '1em' so it matches body text by default.
//   radius   — 'sm' | 'md' | 'lg' | 'full'. Default 'sm'.
//   style    — extra inline overrides (e.g. margin).
//
// Usage:
//   <Skeleton />                                 ← full-width text line
//   <Skeleton width="60%" height="2rem" />       ← title bar
//   <Skeleton width="40px" height="40px" radius="full" />   ← avatar
//
// Visual style is built from the existing design tokens so skeletons
// blend with the rest of the UI — no new colors introduced.

import React from 'react'

// ── Radius lookup ─────────────────────────────────────────────
const RADIUS = {
  sm:   'var(--radius-sm)',
  md:   'var(--radius-md)',
  lg:   'var(--radius-lg)',
  full: 'var(--radius-full)',
}

export default function Skeleton({
  width  = '100%',
  height = '1em',
  radius = 'sm',
  style:  extraStyle = {},
  ...rest
}) {
  return (
    <div
      aria-hidden="true"
      // aria-hidden because a screen reader doesn't need to be told
      // about placeholder boxes — it should announce the real content
      // once it lands. The parent component should handle the loading
      // announcement (aria-busy / aria-live) at a higher level.
      style={{
        width,
        height,
        borderRadius: RADIUS[radius] || RADIUS.sm,

        // Gradient goes border → surface → border so the shine looks
        // like a brighter band passing across a grey bar. Both colors
        // are existing design tokens — nothing new added to the palette.
        background: `linear-gradient(
          90deg,
          var(--color-border),
          var(--color-surface),
          var(--color-border)
        )`,
        backgroundSize: '200% 100%',
        // 200% width means the gradient is twice as wide as the
        // element. Combined with the keyframe sweeping from 200%
        // to -200%, the bright band fully crosses the element.

        animation: 'hkif-shimmer 1.4s linear infinite',
        // 1.4s feels gentle enough not to be distracting but quick
        // enough to register as "active loading".

        // Inherit display from caller via style override if needed;
        // default block-level is fine for the common cases.
        display: 'block',

        ...extraStyle,
      }}
      {...rest}
    />
  )
}