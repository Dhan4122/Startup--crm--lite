import { useState, useMemo } from 'react';
import {
  filterLeadsByDateRange,
  getPipelineValue,
  getWonRevenue,
  getConversionRate,
  getLostRate,
  getAverageSalesCycle,
  getStatusDistribution,
  getLeadSourceStats,
  getFunnelData,
  getMonthlyLeads,
  getConversionByMonth,
  getRevenueByMonth,
  getSalesVelocity,
  getForecastRevenue,
  getTopPerformers,
  getActivityHeatmapData,
} from '../utils/analyticsHelpers';

/**
 * Custom hook to aggregate and memoize analytics calculations.
 *
 * @param {object[]} leads - Unfiltered list of lead records
 * @returns {object} Memoized calculations and active date filter state
 */
export function useAnalytics(leads) {
  const [dateRange, setDateRange] = useState('30d'); // '7d' | '30d' | '90d' | 'year' | 'all'

  // Filter leads based on selected date range
  const filteredLeads = useMemo(() => {
    return filterLeadsByDateRange(leads, dateRange);
  }, [leads, dateRange]);

  // Compute metrics
  const stats = useMemo(() => {
    const totalLeads = filteredLeads.length;
    const conversionRate = getConversionRate(filteredLeads);
    const pipelineValue = getPipelineValue(filteredLeads);
    const wonRevenue = getWonRevenue(filteredLeads);
    const averageSalesCycle = getAverageSalesCycle(filteredLeads);
    const lostRate = getLostRate(filteredLeads);

    return {
      totalLeads,
      conversionRate: Math.round(conversionRate * 100),
      pipelineValue,
      wonRevenue,
      averageSalesCycle,
      lostRate: Math.round(lostRate * 100),
    };
  }, [filteredLeads]);

  // Distributions
  const statusDistribution = useMemo(() => getStatusDistribution(filteredLeads), [filteredLeads]);
  const leadSourceStats = useMemo(() => getLeadSourceStats(filteredLeads), [filteredLeads]);
  const funnelData = useMemo(() => getFunnelData(filteredLeads), [filteredLeads]);

  // Time Series (Bar, Line, Area)
  const monthlyLeads = useMemo(() => getMonthlyLeads(filteredLeads), [filteredLeads]);
  const conversionByMonth = useMemo(() => getConversionByMonth(filteredLeads), [filteredLeads]);
  const revenueByMonth = useMemo(() => getRevenueByMonth(filteredLeads), [filteredLeads]);

  // Insights / Cards
  const salesVelocity = useMemo(() => getSalesVelocity(filteredLeads), [filteredLeads]);
  const forecast = useMemo(() => getForecastRevenue(filteredLeads), [filteredLeads]);
  const topPerformers = useMemo(() => getTopPerformers(filteredLeads), [filteredLeads]);
  const heatmapData = useMemo(() => getActivityHeatmapData(filteredLeads), [filteredLeads]);

  return {
    dateRange,
    setDateRange,
    filteredLeads,
    stats,
    statusDistribution,
    leadSourceStats,
    funnelData,
    monthlyLeads,
    conversionByMonth,
    revenueByMonth,
    salesVelocity,
    forecast,
    topPerformers,
    heatmapData,
  };
}
