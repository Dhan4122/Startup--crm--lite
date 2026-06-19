import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Users, Briefcase, DollarSign, TrendingUp } from 'lucide-react';

// Context
import { useLeads } from '../context/LeadContext';
import { useFilters } from '../context/FilterContext';

// Dashboard sub-components
import StatsCard from '../components/dashboard/StatsCard';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentLeads from '../components/dashboard/RecentLeads';
import QuickActions from '../components/dashboard/QuickActions';

/**
 * Dashboard page — the CRM control centre.
 *
 * **Filter sharing:** Dashboard reads from the same `FilterContext` as the Leads
 * page, so any active filter is shared across both views. KPI stat cards always
 * reflect the **total** (unfiltered) leads for a full-pipeline overview, while
 * `PipelineOverview` and `RecentLeads` receive the **filtered** set so the
 * dashboard stays in sync with whatever the user last searched for on the Leads page.
 *
 * @returns {React.JSX.Element} The rendered Dashboard page
 */
export default function Dashboard() {
  const navigate = useNavigate();

  /**
   * Full, unfiltered lead store — source of truth for global KPI metrics.
   * KPI cards always show totals across ALL leads regardless of filter state.
   * @type {{ leads: import('../context/LeadContext').Lead[] }}
   */
  const { leads } = useLeads();

  /**
   * Shared persistent filter state from FilterContext.
   * The same state drives the Leads page — picking it up here means
   * PipelineOverview and RecentLeads stay in sync with the Leads filter bar.
   */
  const { search, status, source, sortBy } = useFilters();

  // ─── Global KPI metrics (always unfiltered) ────────────────────────────────

  /** @type {number} Total lead count in the CRM */
  const totalLeads = leads.length;

  /** @type {number} Leads still being actively worked (not Won or Lost) */
  const activeLeads = leads.filter(
    (lead) => lead.status !== 'Won' && lead.status !== 'Lost'
  ).length;

  /** @type {number} Sum of all estimated deal values */
  const pipelineValue = leads.reduce(
    (sum, lead) => sum + (Number(lead.value) || 0),
    0
  );

  /** @type {number} Sum of deal values for Won leads only */
  const wonValue = leads
    .filter((lead) => lead.status === 'Won')
    .reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);

  // ─── Filtered leads (shared with Leads page via FilterContext) ──────────────

  /**
   * Applies the active FilterContext state to produce the same subset that
   * the Leads page renders. PipelineOverview and RecentLeads receive this
   * so the dashboard reflects the current search/filter session without
   * duplicating the filter *logic* in multiple places.
   *
   * Filtering rules (mirrors Leads.jsx exactly):
   *  - search  → case-insensitive substring on name / company / email
   *  - status  → exact match ('' = all)
   *  - source  → exact match ('' = all)
   *  - sortBy  → createdAt desc | value desc | name asc | company asc
   *
   * @type {import('../context/LeadContext').Lead[]}
   */
  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase().trim();

    const filtered = leads.filter((lead) => {
      // Text search across name / company / email
      if (q) {
        const matchesSearch =
          lead.name.toLowerCase().includes(q) ||
          lead.company.toLowerCase().includes(q) ||
          (lead.email && lead.email.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      // Status exact match
      if (status && lead.status !== status) return false;
      // Source exact match
      if (source && lead.source !== source) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':    return a.name.localeCompare(b.name);
        case 'company': return a.company.localeCompare(b.company);
        case 'value':   return (Number(b.value) || 0) - (Number(a.value) || 0);
        case 'createdAt':
        default:        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [leads, search, status, source, sortBy]);

  // ─── Action handlers ────────────────────────────────────────────────────────

  /**
   * Navigates to the Leads ledger and programmatically triggers the
   * "Add Lead" dialog by simulating a click on the button with id `add-lead-btn`.
   * The slight timeout allows the Leads page to fully mount before the click.
   *
   * @returns {void}
   */
  const handleAddNewLead = () => {
    navigate('/leads');
    setTimeout(() => {
      const addBtn = document.getElementById('add-lead-btn');
      if (addBtn) addBtn.click();
    }, 120);
  };

  /**
   * Navigates to the Leads ledger page.
   *
   * @returns {void}
   */
  const handleViewAllLeads = () => {
    navigate('/leads');
  };

  /**
   * Exports ALL current leads (unfiltered) to a CSV file and triggers a
   * browser download. Wraps string fields in double-quotes and escapes internal
   * double-quotes to produce a valid RFC 4180 CSV.
   *
   * @returns {void}
   */
  const handleExportData = () => {
    try {
      const headers = [
        'ID', 'Name', 'Company', 'Email', 'Phone',
        'Value', 'Status', 'Source', 'Owner', 'Date Added',
      ];

      const rows = leads.map((lead) => [
        `"${lead.id}"`,
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${lead.company.replace(/"/g, '""')}"`,
        `"${lead.email}"`,
        `"${lead.phone}"`,
        lead.value,
        `"${lead.status}"`,
        `"${lead.source}"`,
        `"${lead.owner ?? ''}"`,
        `"${lead.createdAt}"`,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('href', encodedUri);
      downloadLink.setAttribute(
        'download',
        `startup_crm_leads_${new Date().toISOString().slice(0, 10)}.csv`
      );

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success('Leads spreadsheet downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export leads data.');
      console.error('[Dashboard] Export error:', error);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">
            Control Center
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Analyze conversions, visualize pipeline health, and review operational metrics.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid — always unfiltered totals for a full-pipeline overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Leads"
          value={totalLeads}
          icon={Users}
          change={14.2}
          color="primary"
        />
        <StatsCard
          title="Active Deals"
          value={activeLeads}
          icon={Briefcase}
          change={5.8}
          color="warning"
        />
        <StatsCard
          title="Pipeline Value"
          value={`$${pipelineValue.toLocaleString()}`}
          icon={DollarSign}
          change={11.5}
          color="success"
        />
        <StatsCard
          title="Won Revenue"
          value={`$${wonValue.toLocaleString()}`}
          icon={TrendingUp}
          change={24.7}
          color="success"
        />
      </div>

      {/* Analytical & Tactical Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/*
         * Left panel: PipelineOverview and RecentLeads receive `filteredLeads`
         * so they reflect the same FilterContext state as the Leads page.
         * On mobile/tablet they stack vertically. On desktop, they display side-by-side in a 2-column grid.
         */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:col-span-2">
          <PipelineOverview leads={filteredLeads} />
          <RecentLeads leads={filteredLeads} />
        </div>

        {/* Right panel: Quick action shortcuts */}
        <div className="h-full">
          <QuickActions
            onAddNewLead={handleAddNewLead}
            onViewAllLeads={handleViewAllLeads}
            onExportData={handleExportData}
          />
        </div>
      </div>
    </div>
  );
}
