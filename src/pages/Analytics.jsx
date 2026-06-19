import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadContext';
import { useAnalytics } from '../hooks/useAnalytics';

// Components
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import StatsCards from '../components/analytics/StatsCards';
import PieChartCard from '../components/analytics/PieChartCard';
import FunnelChartCard from '../components/analytics/FunnelChartCard';
import BarChartCard from '../components/analytics/BarChartCard';
import LineChartCard from '../components/analytics/LineChartCard';
import RevenueChartCard from '../components/analytics/RevenueChartCard';
import LeadSourceChart from '../components/analytics/LeadSourceChart';
import SalesVelocityCard from '../components/analytics/SalesVelocityCard';
import ForecastCard from '../components/analytics/ForecastCard';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';
import TopPerformersCard from '../components/analytics/TopPerformersCard';
import EmptyAnalyticsState from '../components/analytics/EmptyAnalyticsState';
import LoadingSkeleton from '../components/analytics/LoadingSkeleton';

export default function Analytics() {
  const navigate = useNavigate();
  const { leads } = useLeads();
  const [isLoading, setIsLoading] = useState(true);

  // Use the custom hook to compute all analytics data
  const {
    dateRange,
    setDateRange,
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
  } = useAnalytics(leads);

  // Simulate short loading state on mount for aesthetic polish
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleAddLeadRedirect = () => {
    navigate('/leads');
    // Programmatically open add lead form
    setTimeout(() => {
      const addBtn = document.getElementById('add-lead-btn');
      if (addBtn) addBtn.click();
    }, 150);
  };

  // If no leads exist, show Empty Analytics State
  if (!leads || leads.length === 0) {
    return (
      <div className="py-8 animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Track sales performance, pipeline metrics, and growth trends.
          </p>
        </div>
        <EmptyAnalyticsState onAddLead={handleAddLeadRedirect} />
      </div>
    );
  }

  // Show skeletal loader during initial hydration
  if (isLoading) {
    return (
      <div className="space-y-8 pt-1 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-48 h-6 bg-gray-200 dark:bg-slate-800 rounded-md animate-pulse" />
            <div className="w-72 h-4 bg-gray-100 dark:bg-slate-800/60 rounded-md animate-pulse" />
          </div>
          <div className="w-64 h-10 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pt-1 pb-12">
      {/* Header section with Title & Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-200 dark:border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Track sales performance, pipeline metrics, and growth trends.
          </p>
        </div>
        <AnalyticsFilters activeFilter={dateRange} onChange={setDateRange} />
      </div>

      {/* KPI Stats Cards Section */}
      <StatsCards stats={stats} />

      {/* Row 1: Pie Distribution & Funnel Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PieChartCard data={statusDistribution} totalLeads={stats.totalLeads} />
        <FunnelChartCard data={funnelData} />
      </div>

      {/* Row 2: Bar leads count & Line conversion rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChartCard data={monthlyLeads} />
        <LineChartCard data={conversionByMonth} />
      </div>

      {/* Row 3: Revenue Area & Lead Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueChartCard data={revenueByMonth} />
        <LeadSourceChart data={leadSourceStats} />
      </div>

      {/* Row 4: Deal ingestion heatmap & Top Reps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityHeatmap data={heatmapData} />
        <TopPerformersCard performers={topPerformers} />
      </div>

      {/* Row 5: Revenue forecasts & Sales Velocity metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ForecastCard forecast={forecast} />
        <SalesVelocityCard velocity={salesVelocity} />
      </div>
    </div>
  );
}
