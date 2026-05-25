// Chart color tokens — single source of truth for the recharts
// fills and strokes used across the statistics dashboard.
//
// Why this file exists:
//   The three chart components all reference the same CSS custom
//   properties for their bars, gridlines, and axis text. Duplicating
//   the strings ('var(--color-primary)' etc.) across three files
//   means three places to update if the design system changes.
//
//   Keeping them as named exports also gives the values a semantic
//   label — `CHART_COLOR_BAR_PRIMARY` reads better than a raw CSS
//   var string scattered through chart props.
//
// All values resolve to CSS custom properties already defined in
// index.css — no new colors introduced here.

export const CHART_COLOR_BAR_PRIMARY   = 'var(--color-primary)'
export const CHART_COLOR_BAR_SECONDARY = 'var(--color-primary-mid)'
export const CHART_COLOR_BAR_DANGER    = 'var(--color-danger)'

// Used for axis labels and the "no data yet" empty-state text.
export const CHART_COLOR_TEXT_MUTED    = 'var(--color-text-muted)'

// CartesianGrid stroke — kept distinct from the muted text color
// in case the grid ever wants a different (probably lighter) shade.
export const CHART_COLOR_GRID          = 'var(--color-border)'