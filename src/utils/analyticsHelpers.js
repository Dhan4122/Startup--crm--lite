/**
 * @fileoverview Pure analytics helper functions for Startup CRM Lite.
 *
 * All functions are:
 *   - Pure (no side effects, deterministic)
 *   - Memoization-friendly (stable references for same inputs)
 *   - Defensively null-safe
 *
 * Lead statuses:  'New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Won' | 'Lost'
 * Lead sources:   'Website' | 'Referral' | 'LinkedIn' | 'Cold Call' | 'Email Campaign' | 'Other'
 */

const ACTIVE_STATUSES = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent'];
const WON_STATUS = 'Won';
const LOST_STATUS = 'Lost';

// ─── Date Filtering ─────────────────────────────────────────────────────────

/**
 * Returns only the leads that fall within the specified date range.
 *
 * @param {object[]} leads
 * @param {'7d'|'30d'|'90d'|'year'|'all'} range
 * @returns {object[]}
 */
export function filterLeadsByDateRange(leads, range) {
  if (!Array.isArray(leads)) return [];
  if (range === 'all') return leads;

  const now = new Date();
  let cutoff;

  switch (range) {
    case '7d':
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case '30d':
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      break;
    case '90d':
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
      break;
    case 'year':
      cutoff = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      return leads;
  }

  return leads.filter((l) => {
    if (!l?.createdAt) return false;
    return new Date(l.createdAt) >= cutoff;
  });
}

// ─── KPI Calculations ────────────────────────────────────────────────────────

/**
 * Total pipeline value = sum of deal values for all NON-Lost leads.
 * Includes stages: New, Contacted, Meeting Scheduled, Proposal Sent, Won.
 * @param {object[]} leads
 * @returns {number}
 */
export function getPipelineValue(leads) {
  if (!Array.isArray(leads)) return 0;
  return leads
    .filter((l) => l?.status !== LOST_STATUS)
    .reduce((sum, l) => sum + (Number(l?.value) || 0), 0);
}

/**
 * Won revenue = sum of values for 'Won' leads only.
 * @param {object[]} leads
 * @returns {number}
 */
export function getWonRevenue(leads) {
  if (!Array.isArray(leads)) return 0;
  return leads
    .filter((l) => l?.status === WON_STATUS)
    .reduce((sum, l) => sum + (Number(l?.value) || 0), 0);
}

/**
 * Conversion rate = Won leads / Total leads (0–1).
 * @param {object[]} leads
 * @returns {number}
 */
export function getConversionRate(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return 0;
  const won = leads.filter((l) => l?.status === WON_STATUS).length;
  return won / leads.length;
}

/**
 * Lost rate = Lost leads / Total leads (0–1).
 * @param {object[]} leads
 * @returns {number}
 */
export function getLostRate(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return 0;
  const lost = leads.filter((l) => l?.status === LOST_STATUS).length;
  return lost / leads.length;
}

/**
 * Average sales cycle in days for Won leads.
 * Uses (lastContacted - createdAt) as a proxy for the sales cycle.
 * @param {object[]} leads
 * @returns {number} Days (integer), or 0 if no Won leads
 */
export function getAverageSalesCycle(leads) {
  if (!Array.isArray(leads)) return 0;
  const wonLeads = leads.filter(
    (l) => l?.status === WON_STATUS && l?.createdAt && l?.lastContacted
  );
  if (wonLeads.length === 0) return 0;

  const totalDays = wonLeads.reduce((sum, l) => {
    const diff =
      new Date(l.lastContacted).getTime() - new Date(l.createdAt).getTime();
    return sum + Math.max(0, diff / (1000 * 60 * 60 * 24));
  }, 0);

  return Math.round(totalDays / wonLeads.length);
}

// ─── Distribution Helpers ────────────────────────────────────────────────────

/**
 * Status distribution for pie / donut chart.
 * @param {object[]} leads
 * @returns {{ name: string, value: number, percentage: number }[]}
 */
export function getStatusDistribution(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return [];

  const counts = {};
  for (const l of leads) {
    const s = l?.status || 'Unknown';
    counts[s] = (counts[s] || 0) + 1;
  }

  const total = leads.length;
  return Object.entries(counts)
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Lead source stats sorted by count descending.
 * @param {object[]} leads
 * @returns {{ name: string, count: number, percentage: number }[]}
 */
export function getLeadSourceStats(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return [];

  const counts = {};
  for (const l of leads) {
    const src = l?.source || 'Other';
    counts[src] = (counts[src] || 0) + 1;
  }

  const total = leads.length;
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

// ─── Funnel ──────────────────────────────────────────────────────────────────

/**
 * Funnel stage data with conversion and drop-off percentages.
 * @param {object[]} leads
 * @returns {{ stage: string, count: number, convRate: number, dropOff: number, fill: string }[]}
 */
export function getFunnelData(leads) {
  if (!Array.isArray(leads)) return [];

  const stages = [
    {
      stage: 'New',
      statuses: ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
      fill: '#94A3B8',
    },
    {
      stage: 'Contacted',
      statuses: ['Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
      fill: '#2563EB',
    },
    {
      stage: 'Meeting',
      statuses: ['Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
      fill: '#F59E0B',
    },
    {
      stage: 'Proposal',
      statuses: ['Proposal Sent', 'Won'],
      fill: '#7C3AED',
    },
    {
      stage: 'Won',
      statuses: ['Won'],
      fill: '#22C55E',
    },
  ];

  const counts = stages.map(({ stage, statuses, fill }) => ({
    stage,
    count: leads.filter((l) => statuses.includes(l?.status)).length,
    fill,
  }));

  return counts.map((item, i) => {
    const prev = i === 0 ? item.count : counts[i - 1].count;
    const convRate = prev > 0 ? Math.round((item.count / prev) * 100) : 0;
    const dropOff = 100 - convRate;
    return { ...item, convRate, dropOff };
  });
}

// ─── Time Series ─────────────────────────────────────────────────────────────

/** Returns the last N month labels as short strings e.g. ['Jan','Feb',...] */
function getLastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}

/**
 * Monthly leads count for the last 6 months.
 * @param {object[]} leads
 * @returns {{ month: string, leads: number }[]}
 */
export function getMonthlyLeads(leads) {
  const months = getLastNMonths(6);
  if (!Array.isArray(leads)) return months.map((m) => ({ month: m.label, leads: 0 }));

  return months.map(({ label, year, month }) => {
    const count = leads.filter((l) => {
      if (!l?.createdAt) return false;
      const d = new Date(l.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;
    return { month: label, leads: count };
  });
}

/**
 * Monthly conversion rate (Won / Total) for the last 6 months.
 * @param {object[]} leads
 * @returns {{ month: string, rate: number }[]}
 */
export function getConversionByMonth(leads) {
  const months = getLastNMonths(6);
  if (!Array.isArray(leads)) return months.map((m) => ({ month: m.label, rate: 0 }));

  return months.map(({ label, year, month }) => {
    const monthLeads = leads.filter((l) => {
      if (!l?.createdAt) return false;
      const d = new Date(l.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const won = monthLeads.filter((l) => l?.status === WON_STATUS).length;
    const rate = monthLeads.length > 0 ? Math.round((won / monthLeads.length) * 100) : 0;
    return { month: label, rate };
  });
}

/**
 * Monthly Won revenue for the last 6 months.
 * @param {object[]} leads
 * @returns {{ month: string, revenue: number }[]}
 */
export function getRevenueByMonth(leads) {
  const months = getLastNMonths(6);
  if (!Array.isArray(leads)) return months.map((m) => ({ month: m.label, revenue: 0 }));

  return months.map(({ label, year, month }) => {
    const revenue = leads
      .filter((l) => {
        if (l?.status !== WON_STATUS || !l?.createdAt) return false;
        const d = new Date(l.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, l) => sum + (Number(l?.value) || 0), 0);
    return { month: label, revenue };
  });
}

// ─── Sales Velocity ──────────────────────────────────────────────────────────

/**
 * Sales velocity in revenue per day.
 * Formula: (Opportunities × Win Rate × Avg Deal Size) / Sales Cycle Length
 * @param {object[]} leads
 * @returns {number}
 */
export function getSalesVelocity(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return 0;

  const opportunities = leads.filter((l) =>
    ACTIVE_STATUSES.includes(l?.status)
  ).length;

  const winRate = getConversionRate(leads);

  const wonLeads = leads.filter((l) => l?.status === WON_STATUS);
  const avgDealSize =
    wonLeads.length > 0
      ? wonLeads.reduce((s, l) => s + (Number(l?.value) || 0), 0) / wonLeads.length
      : 0;

  const cycleDays = getAverageSalesCycle(leads) || 30;

  return Math.round((opportunities * winRate * avgDealSize) / cycleDays);
}

// ─── Revenue Forecast ────────────────────────────────────────────────────────

/**
 * Forecasts next month's revenue based on the last 6 months trend.
 * Returns predicted revenue and a 0–100 confidence score.
 * @param {object[]} leads
 * @returns {{ predicted: number, confidence: number, growth: number }}
 */
export function getForecastRevenue(leads) {
  const monthly = getRevenueByMonth(leads);
  const values = monthly.map((m) => m.revenue);

  const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);

  // Simple linear trend via last-vs-first halves
  const firstHalf = values.slice(0, 3).reduce((s, v) => s + v, 0) / 3;
  const secondHalf = values.slice(3).reduce((s, v) => s + v, 0) / 3;
  const growthRate = firstHalf > 0 ? (secondHalf - firstHalf) / firstHalf : 0;

  const predicted = Math.round(avg * (1 + growthRate));

  // Confidence: higher when we have more non-zero months
  const nonZero = values.filter((v) => v > 0).length;
  const confidence = Math.min(95, Math.round((nonZero / 6) * 80 + 15));

  return {
    predicted,
    confidence,
    growth: Math.round(growthRate * 100),
  };
}

// ─── Top Performers ──────────────────────────────────────────────────────────

/**
 * Ranks sales reps by Won revenue.
 * @param {object[]} leads
 * @returns {{ name: string, wonRevenue: number, wonCount: number, totalLeads: number, convRate: number }[]}
 */
export function getTopPerformers(leads) {
  if (!Array.isArray(leads)) return [];

  const map = {};
  for (const l of leads) {
    const owner = l?.owner || 'Unknown';
    if (!map[owner]) {
      map[owner] = { name: owner, wonRevenue: 0, wonCount: 0, totalLeads: 0 };
    }
    map[owner].totalLeads += 1;
    if (l?.status === WON_STATUS) {
      map[owner].wonCount += 1;
      map[owner].wonRevenue += Number(l?.value) || 0;
    }
  }

  return Object.values(map)
    .map((rep) => ({
      ...rep,
      convRate:
        rep.totalLeads > 0
          ? Math.round((rep.wonCount / rep.totalLeads) * 100)
          : 0,
    }))
    .sort((a, b) => b.wonRevenue - a.wonRevenue);
}

// ─── Activity Heatmap ────────────────────────────────────────────────────────

/**
 * Returns a 52-week × 7-day activity grid for a GitHub-style heatmap.
 * Each cell: { date: string, count: number }
 * @param {object[]} leads
 * @returns {{ date: string, count: number }[][]} 7 rows × 52 columns
 */
export function getActivityHeatmapData(leads) {
  if (!Array.isArray(leads)) return [];

  // Build a date-count map
  const countMap = {};
  for (const l of leads) {
    if (!l?.createdAt) continue;
    const dateKey = new Date(l.createdAt).toISOString().slice(0, 10);
    countMap[dateKey] = (countMap[dateKey] || 0) + 1;
  }

  // Build 52 weeks of cells
  const now = new Date();
  // Start on a Sunday 52 weeks ago
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 364);
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const weeks = [];
  for (let w = 0; w < 52; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const key = date.toISOString().slice(0, 10);
      week.push({ date: key, count: countMap[key] || 0 });
    }
    weeks.push(week);
  }

  return weeks;
}

// ─── Formatting Helpers ──────────────────────────────────────────────────────

/**
 * Formats a number as Indian-locale currency (₹).
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
  if (value === 0) return '₹0';
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

/**
 * Returns an initials string (up to 2 chars) from a full name.
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}
