// Skeleton placeholder for ActivitiesPage's card list.
// Renders N cards that visually mirror the shape of a real
// activity card (title + meta lines + time-slot block) so the
// page doesn't visually jump when data arrives.
//
// Why use the real <Card> component instead of just grey rectangles:
//   The border, shadow and padding need to match the loaded state
//   exactly. Using <Card> means we don't have to keep the skeleton
//   in sync if Card.jsx changes in the future.

import React from 'react'
import { Card, Skeleton } from '../ui'

// ── How many skeletons to show ────────────────────────────────
// 4 is a balance: enough to fill the viewport on most screens so
// the page feels "full" while loading, but not so many that we
// waste DOM nodes on a page that often has 5-10 real items anyway.
const DEFAULT_COUNT = 4

export default function ActivityListSkeleton({ count = DEFAULT_COUNT }) {
  return (
    <>
      {/* aria-busy on the wrapping list (in the parent page) handles
          the screen reader announcement — these individual cards are
          aria-hidden via the Skeleton primitive itself. */}
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          padding="md"
          shadow="sm"
          style={{ position: 'relative' }}
        >
          {/* Title bar — mimics the h2 inside a real activity card */}
          <Skeleton
            height="1.6rem"
            width="55%"
            style={{ marginBottom: 'var(--space-4)' }}
          />

          {/* Location line */}
          <Skeleton
            height="1rem"
            width="40%"
            style={{ marginBottom: 'var(--space-2)' }}
          />

          {/* Capacity line */}
          <Skeleton
            height="1rem"
            width="30%"
            style={{ marginBottom: 'var(--space-2)' }}
          />

          {/* Description — wider, slightly taller */}
          <Skeleton
            height="1rem"
            width="80%"
            style={{ marginBottom: 'var(--space-4)' }}
          />

          {/* Time-slot block — heading + two slot lines.
              Real cards don't always render time slots, but showing
              them in the skeleton avoids a noticeable shrink when
              the data arrives. Slight over-render is safer than
              a layout shift. */}
          <Skeleton height="1rem" width="25%" style={{ marginBottom: 'var(--space-2)' }} />
          <Skeleton height="1rem" width="45%" style={{ marginBottom: 'var(--space-1)' }} />
          <Skeleton height="1rem" width="45%" />

          {/* Heart button placeholder — circle, top-right.
              Mirrors the absolutely-positioned heart button in the
              real card. Keeps the visual rhythm consistent. */}
          <Skeleton
            radius="full"
            width="28px"
            height="28px"
            style={{
              position: 'absolute',
              top:      '16px',
              right:    '16px',
            }}
          />
        </Card>
      ))}
    </>
  )
}