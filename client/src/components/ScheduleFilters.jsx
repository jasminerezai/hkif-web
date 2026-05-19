import React from 'react'
import Button from './ui/Button.jsx'

// ─────────────────────────────────────────────────────────────
// ScheduleFilters
//
// Filter bar shown above the calendar on SchedulePage.
//
// Controls:
//   - Sport type dropdown (auto-populated from the activities list)
//   - Day-of-week dropdown (Any / Monday / Tuesday / ...)
//   - "Favorites only" toggle (only visible when logged in)
//   - Clear button (resets all three filters at once)
//
// This component is purely presentational — it does NOT fetch
// anything or own state. All state lives on SchedulePage so the
// calendar can react to changes. This makes the component easy
// to reuse later (e.g. on ActivitiesPage).
//
// Props:
//   sportTypes              — string[]  list of unique sports to show in the dropdown
//   filterSport             — string    currently selected sport ('ALL' = no filter)
//   onFilterSportChange     — fn(value) called when sport dropdown changes
//
//   filterDay               — string    'ALL' | 'MONDAY' | 'TUESDAY' | ... | 'SUNDAY'
//   onFilterDayChange       — fn(value) called when day dropdown changes
//
//   isAuthenticated         — boolean   hides favorites toggle if false
//   filterFavoritesOnly     — boolean   true = only show user's favorited sports
//   onFilterFavoritesChange — fn(value) called when favorites toggle is clicked
//
//   onClear                 — fn()      called when "Clear" button is clicked
// ─────────────────────────────────────────────────────────────

// Day-of-week options. Kept as a constant so the dropdown order
// is stable and we don't recompute this array on every render.
const DAYS_OF_WEEK = [
  { value: 'ALL',       label: 'Any day'  },
  { value: 'MONDAY',    label: 'Monday'    },
  { value: 'TUESDAY',   label: 'Tuesday'   },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY',  label: 'Thursday'  },
  { value: 'FRIDAY',    label: 'Friday'    },
  { value: 'SATURDAY',  label: 'Saturday'  },
  { value: 'SUNDAY',    label: 'Sunday'    },
]

// Shared <select> style so the two dropdowns look identical.
// Defined outside the component so the object reference is stable
// across renders (small perf nicety + cleaner JSX below).
const selectStyle = {
  padding:      '8px 12px',
  border:       '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  background:   '#ffffff',
  color:        'var(--color-text)',
  fontFamily:   'var(--font-body)',
  fontSize:     'var(--text-sm)',
  cursor:       'pointer',
  outline:      'none',
  minWidth:     '160px',
}

const labelStyle = {
  display:    'flex',
  flexDirection: 'column',
  gap:        '4px',
  fontSize:   'var(--text-sm)',
  fontWeight: 600,
  color:      'var(--color-text)',
}

export default function ScheduleFilters({
  sportTypes,
  filterSport,
  onFilterSportChange,
  filterDay,
  onFilterDayChange,
  isAuthenticated,
  filterFavoritesOnly,
  onFilterFavoritesChange,
  onClear,
}) {

  // True if any filter is currently active — used to enable/disable
  // the "Clear" button so it doesn't sit there looking pointless.
  const hasActiveFilter =
    filterSport !== 'ALL' ||
    filterDay   !== 'ALL' ||
    filterFavoritesOnly === true

  return (
    <div
      style={{
        display:      'flex',
        flexWrap:     'wrap',
        alignItems:   'flex-end',
        gap:          '16px',
        padding:      '16px',
        marginBottom: 'var(--space-6)',
        background:   'var(--color-surface-raised)',
        border:       '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
    >

      {/* ── Sport filter ──────────────────────────────────── */}
      <label style={labelStyle}>
        Sport
        <select
          value={filterSport}
          onChange={(e) => onFilterSportChange(e.target.value)}
          style={selectStyle}
        >
          <option value="ALL">All sports</option>
          {sportTypes.map(sport => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </label>

      {/* ── Day-of-week filter ───────────────────────────── */}
      <label style={labelStyle}>
        Day of week
        <select
          value={filterDay}
          onChange={(e) => onFilterDayChange(e.target.value)}
          style={selectStyle}
        >
          {DAYS_OF_WEEK.map(day => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
      </label>

      {/* ── Favorites toggle ─────────────────────────────────
          Only rendered when the user is logged in — for guests
          this filter doesn't make sense and would always be empty.
      ────────────────────────────────────────────────────── */}
      {isAuthenticated && (
        <label
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '8px',
            fontSize:   'var(--text-sm)',
            fontWeight: 600,
            color:      'var(--color-text)',
            cursor:     'pointer',
            // Aligns the checkbox row with the bottom of the dropdowns
            // (which have a label stacked above them, so they're taller).
            paddingBottom: '10px',
          }}
        >
          <input
            type="checkbox"
            checked={filterFavoritesOnly}
            onChange={(e) => onFilterFavoritesChange(e.target.checked)}
            style={{
              width:  '16px',
              height: '16px',
              accentColor: 'var(--color-primary)',
              // accentColor tints the native checkbox to HKR green
              // so we don't have to build a custom checkbox component.
              cursor: 'pointer',
            }}
          />
          Favorites only
        </label>
      )}

      {/* ── Clear filters button ─────────────────────────────
          Pushed to the right with margin-left: auto so it sits
          at the end of the filter bar regardless of flex wrap.
      ────────────────────────────────────────────────────── */}
      <div style={{ marginLeft: 'auto', paddingBottom: '2px' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={!hasActiveFilter}
        >
          Clear filters
        </Button>
      </div>

    </div>
  )
}