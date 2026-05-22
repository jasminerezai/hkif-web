// Skeleton placeholder for SchedulePage.
//
// Renders the same visual chrome as the real schedule (title,
// view toggle, filter bar, month label, 7-column grid) so the
// page doesn't flash in chunks when data arrives.
//
// Only the weekly (7-day) layout is faked — when the user lands
// on the schedule the default view is 'weekly' anyway. If we ever
// need a monthly skeleton we can add a prop here.

import React from 'react'
import { Card, Skeleton } from '../ui'

// ── How many activity blocks per day cell ─────────────────────
// A real day has 0–4 activities. Showing 2 per cell makes the
// grid feel populated without claiming there's more there than
// there actually is.
const BLOCKS_PER_DAY = 2

export default function ScheduleSkeleton() {
  return (
    <div
      style={{
        padding:  'var(--space-6)',
        maxWidth: '1400px',
        margin:   '0 auto',
      }}
    >
      {/* ── Header row: page title + view toggle ─────────── */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   'var(--space-6)',
          flexWrap:       'wrap',
          gap:            '16px',
        }}
      >
        <Skeleton height="2.4rem" width="280px" />

        <div style={{ display: 'flex', gap: '12px' }}>
          <Skeleton height="2.2rem" width="90px" radius="sm" />
          <Skeleton height="2.2rem" width="90px" radius="sm" />
        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────── */}
      {/* Approximates ScheduleFilters' three dropdowns +
          favorites checkbox + clear button. Doesn't need to
          be pixel-perfect — same visual weight is enough. */}
      <Card padding="md" shadow="sm" style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            display:    'flex',
            gap:        'var(--space-4)',
            flexWrap:   'wrap',
            alignItems: 'center',
          }}
        >
          <Skeleton height="2.2rem" width="160px" radius="sm" />
          <Skeleton height="2.2rem" width="160px" radius="sm" />
          <Skeleton height="2.2rem" width="140px" radius="sm" />
          <Skeleton height="2.2rem" width="100px" radius="sm" />
        </div>
      </Card>

      {/* ── Month label ──────────────────────────────────── */}
      <Skeleton
        height="2rem"
        width="200px"
        style={{ marginBottom: '24px' }}
      />

      {/* ── 7-column day grid ────────────────────────────── */}
      <div
        style={{
          border:     '1px solid var(--color-border)',
          background: 'var(--color-surface-raised)',
        }}
      >
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap:                 '0',
          }}
        >
          {Array.from({ length: 7 }).map((_, dayIndex) => (
            <div
              key={dayIndex}
              style={{
                minHeight:     '220px',
                borderRight:   '1px solid var(--color-border)',
                borderBottom:  '1px solid var(--color-border)',
                padding:       '16px',
                background:    'var(--color-surface-raised)',
                display:       'flex',
                flexDirection: 'column',
                gap:           '12px',
              }}
            >
              {/* Day header — date number + weekday */}
              <div
                style={{
                  borderBottom:  '1px solid var(--color-border)',
                  paddingBottom: '10px',
                }}
              >
                <Skeleton height="2rem" width="40px" style={{ marginBottom: '6px' }} />
                <Skeleton height="1rem" width="70px" />
              </div>

              {/* Activity placeholder blocks */}
              <div
                style={{
                  display:       'flex',
                  flexDirection: 'column',
                  gap:           '10px',
                }}
              >
                {Array.from({ length: BLOCKS_PER_DAY }).map((_, slotIndex) => (
                  <div
                    key={slotIndex}
                    style={{
                      background: 'var(--color-primary-light)',
                      borderLeft: '4px solid var(--color-primary)',
                      padding:    '12px',
                      display:    'flex',
                      flexDirection: 'column',
                      gap:        '6px',
                    }}
                  >
                    <Skeleton height="1rem" width="70%" />
                    <Skeleton height="0.85rem" width="50%" />
                    <Skeleton height="0.85rem" width="40%" />
                    <Skeleton height="0.85rem" width="60%" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}