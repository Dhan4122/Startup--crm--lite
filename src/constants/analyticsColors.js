/**
 * @fileoverview Analytics color palette for Startup CRM Lite.
 * Centralises all chart colours so every visualisation stays consistent.
 */

/** Maps each lead status to its brand colour. */
export const STATUS_COLORS = {
  New: '#94A3B8',
  Contacted: '#2563EB',
  'Meeting Scheduled': '#F59E0B',
  'Proposal Sent': '#7C3AED',
  Won: '#22C55E',
  Lost: '#EF4444',
};

/** Maps each lead source to a distinct accent colour. */
export const SOURCE_COLORS = {
  Website: '#2563EB',
  Referral: '#22C55E',
  LinkedIn: '#0077B5',
  'Cold Call': '#F59E0B',
  'Email Campaign': '#7C3AED',
  Other: '#94A3B8',
};

/** Ordered palette for generic multi-series charts. */
export const CHART_COLORS = [
  '#2563EB',
  '#22C55E',
  '#F59E0B',
  '#7C3AED',
  '#EF4444',
  '#06B6D4',
  '#EC4899',
  '#F97316',
];

/** Gradient definitions reused across area / bar charts. */
export const GRADIENT_COLORS = {
  revenue: { start: '#22C55E', end: 'rgba(34,197,94,0)' },
  leads:   { start: '#2563EB', end: 'rgba(37,99,235,0)' },
  funnel:  { start: '#7C3AED', end: 'rgba(124,58,237,0)' },
};

/** Heatmap intensity scale (GitHub-style). */
export const HEATMAP_SCALE = [
  'transparent',
  'rgba(37,99,235,0.15)',
  'rgba(37,99,235,0.35)',
  'rgba(37,99,235,0.60)',
  'rgba(37,99,235,0.85)',
  '#2563EB',
];
