// Skeleton placeholder for /admin/statistics.
//
// Mirrors the real StatisticsPage layout so the page doesn't
// visually jump when /api/admin/statistics resolves. Sections:
//   1. Header row              — title + meta + action buttons
//   2. KPI tiles               — 4 metric cards in a row
//   3. Popular activities chart card
//   4. Participants per activity chart card
//   5. Cancellation rate chart card
//
// Why a single page-level skeleton instead of one-per-section:
//   All three charts come from a single /api/admin/statistics
//   call — they land at the same moment, so per-section
//   placeholders would never appear independently. One file
//   keeps the layout match obvious during review.

import React from 'react'
import { Card, Skeleton } from '../ui'

// ── Section heading placeholder ────────────────────────────────
// Reused by all three chart cards so titles stay consistent.
function ChartHeadingSkeleton() {
  return (
    <>
      {/* Chart title */}
      <Skeleton
        height="1.3rem"
        width="40%"
        style={{ marginBottom: '8px' }}
      />

      {/* Subtitle / description line — muted text under title */}
      <Skeleton
        height="0.9rem"
        width="60%"
        style={{ marginBottom: '20px' }}
      />
    </>
  )
}

// ── Header row placeholder ─────────────────────────────────────
// Mirrors the real header: page title + "Last updated..." line
// on the left, Refresh + Export CSV buttons on the right.
function HeaderSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >

      {/* Left side: title + last-updated meta */}
      <div>

        {/* Page title — h1 sized */}
        <Skeleton
          height="2rem"
          width="280px"
          style={{ marginBottom: '8px' }}
        />

        {/* "Last updated X ago" line */}
        <Skeleton height="0.9rem" width="180px" />

      </div>

      {/* Right side: two action buttons (Refresh, Export CSV) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <Skeleton height="2rem" width="100px" radius="sm" />
        <Skeleton height="2rem" width="120px" radius="sm" />
      </div>

    </div>
  )
}

// ── KPI tiles placeholder ──────────────────────────────────────
// Four equal-width cards. Each has a small label on top and a
// large number below — matches the real KPI tile shape.
function KpiTilesSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} padding="md" shadow="sm">

          {/* Metric label — small, muted */}
          <Skeleton
            height="0.85rem"
            width="65%"
            style={{ marginBottom: '12px' }}
          />

          {/* Metric value — large number */}
          <Skeleton height="2rem" width="50%" />

        </Card>
      ))}
    </div>
  )
}

// ── Chart card placeholder ─────────────────────────────────────
// Shared by all three chart sections. The `height` prop matches
// the real chart's ResponsiveContainer height so the page
// doesn't shift when the chart renders.
//
// Default 320px matches the real chart height — keep in sync if
// the chart cards change.
function ChartCardSkeleton({ height = 320 }) {
  return (
    <Card
      padding="lg"
      shadow="sm"
      style={{ marginBottom: '24px' }}
    >
      <ChartHeadingSkeleton />

      {/* Chart area — a single tall skeleton block stands in
          for the actual chart. We don't try to mimic individual
          bars because the real chart count varies with data,
          and a plain block reads as "chart loading" cleanly. */}
      <Skeleton
        height={`${height}px`}
        radius="md"
      />
    </Card>
  )
}

// ── Default export: full page skeleton ─────────────────────────
// No props — the statistics page layout is identical for every
// ADMIN viewer, so there's nothing to vary (unlike ProfileSkeleton
// which has a canManage prop).
export default function StatisticsSkeleton() {
  return (
    <div
      style={{
        padding: 'var(--space-6)',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
      aria-busy="true"
      // aria-busy tells assistive tech this region is updating.
      // Individual Skeleton bars are aria-hidden so they don't
      // get announced one by one — only this wrapper does.
    >
      <HeaderSkeleton />

      <KpiTilesSkeleton />

      {/* Three chart cards stacked vertically — same order as
          the real page so layout matches one-to-one. */}
      <ChartCardSkeleton />
      <ChartCardSkeleton />
      <ChartCardSkeleton />
    </div>
  )
}