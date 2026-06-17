import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Users, Briefcase, DollarSign, TrendingUp } from 'lucide-react';

// Import newly created dashboard sub-components
import StatsCard from '../components/dashboard/StatsCard';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentLeads from '../components/dashboard/RecentLeads';
import QuickActions from '../components/dashboard/QuickActions';

/**
 * Sample leads data reflecting the structure used by LeadContext.jsx.
 * Used for Phase 7 display. In Phase 8, this data will be consumed
 * directly from the Context API state.
 *
 * @type {Array<Object>}
 */
const sampleLeads = [
  {
    id: 'lead-1',
    name: 'Sarah Connor',
    company: 'Cyberdyne Systems',
    email: 's.connor@cyberdyne.io',
    phone: '+1 (555) 019-2831',
    value: 48000,
    status: 'Meeting Scheduled',
    source: 'Website',
    owner: 'Sarah Chen',
    lastContacted: '2026-06-12T10:30:00Z',
    createdAt: '2026-05-15T09:00:00Z',
    notes: 'Very interested in our API integrations. Demanded high security standards.'
  },
  {
    id: 'lead-2',
    name: 'Miles Dyson',
    company: 'Neural Net Corp',
    email: 'm.dyson@neuralnet.com',
    phone: '+1 (555) 014-9988',
    value: 125000,
    status: 'Won',
    source: 'Referral',
    owner: 'Marcus Vance',
    lastContacted: '2026-06-14T15:20:00Z',
    createdAt: '2026-05-20T11:30:00Z',
    notes: 'Deal closed! Contract signed for enterprise-wide subscription.'
  },
  {
    id: 'lead-3',
    name: 'Bruce Wayne',
    company: 'Wayne Enterprises',
    email: 'bruce@wayne.corp',
    phone: '+1 (555) 911-1939',
    value: 250000,
    status: 'Proposal Sent',
    source: 'Referral',
    owner: 'Alex Rivera',
    lastContacted: '2026-06-11T18:00:00Z',
    createdAt: '2026-06-01T08:15:00Z',
    notes: 'Requires custom on-premise components. High contract value potential.'
  },
  {
    id: 'lead-4',
    name: 'Peter Parker',
    company: 'Daily Bugle Press',
    email: 'p.parker@dailybugle.com',
    phone: '+1 (555) 321-9876',
    value: 8500,
    status: 'Contacted',
    source: 'LinkedIn',
    owner: 'Sarah Chen',
    lastContacted: '2026-06-13T09:45:00Z',
    createdAt: '2026-06-05T14:20:00Z',
    notes: 'Sent initial discovery pricing grid. Follow up next Tuesday.'
  },
  {
    id: 'lead-5',
    name: 'Tony Stark',
    company: 'Stark Industries',
    email: 'tony@stark.ventures',
    phone: '+1 (555) 300-3000',
    value: 500000,
    status: 'New',
    source: 'Website',
    owner: 'Alex Rivera',
    lastContacted: '2026-06-15T12:00:00Z',
    createdAt: '2026-06-15T11:45:00Z',
    notes: 'Signed up through the sandbox platform. Needs dedicated cloud capacity details.'
  },
  {
    id: 'lead-6',
    name: 'Selina Kyle',
    company: 'Gotham Antiques',
    email: 'selina@kyle.net',
    phone: '+1 (555) 888-2424',
    value: 12000,
    status: 'Lost',
    source: 'Cold Call',
    owner: 'Marcus Vance',
    lastContacted: '2026-06-08T16:10:00Z',
    createdAt: '2026-05-18T10:00:00Z',
    notes: 'Decided to build an in-house open source tool instead of a commercial CRM license.'
  },
  {
    id: 'lead-7',
    name: 'Clark Kent',
    company: 'Planet Media Group',
    email: 'c.kent@dailyplanet.co',
    phone: '+1 (555) 902-8811',
    value: 35000,
    status: 'Meeting Scheduled',
    source: 'Referral',
    owner: 'Sarah Chen',
    lastContacted: '2026-06-14T10:15:00Z',
    createdAt: '2026-06-02T13:40:00Z',
    notes: 'Budget approved. Reviewing compliance document details.'
  }
];

/**
 * Dashboard page coordinates stats rendering, pipeline segmentation analysis,
 * recent lead grids, and administration tasks in an elegant responsive workspace.
 *
 * @returns {React.JSX.Element} The rendered Dashboard page
 */
export default function Dashboard() {
  const navigate = useNavigate();

  // Metric computations from mock lead data
  const totalLeads = sampleLeads.length;
  
  const activeLeads = sampleLeads.filter(
    (lead) => lead.status !== 'Won' && lead.status !== 'Lost'
  ).length;

  const pipelineValue = sampleLeads.reduce(
    (sum, lead) => sum + lead.value,
    0
  );

  const wonValue = sampleLeads
    .filter((lead) => lead.status === 'Won')
    .reduce((sum, lead) => sum + lead.value, 0);

  /**
   * Navigates to the Leads ledger and triggers the Lead creation dialog/modal.
   */
  const handleAddNewLead = () => {
    navigate('/leads');
    // Delay slightly to allow the Leads page to mount and trigger the add button click
    setTimeout(() => {
      const addBtn = document.getElementById('add-lead-btn');
      if (addBtn) {
        addBtn.click();
      }
    }, 120);
  };

  /**
   * Navigates to the Leads ledger page.
   */
  const handleViewAllLeads = () => {
    navigate('/leads');
  };

  /**
   * Exports the mock leads database to a standard CSV download file.
   */
  const handleExportData = () => {
    try {
      const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Value', 'Status', 'Source', 'Owner', 'Date Added'];
      
      const rows = sampleLeads.map((lead) => [
        `"${lead.id}"`,
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${lead.company.replace(/"/g, '""')}"`,
        `"${lead.email}"`,
        `"${lead.phone}"`,
        lead.value,
        `"${lead.status}"`,
        `"${lead.source}"`,
        `"${lead.owner}"`,
        `"${lead.createdAt}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' 
        + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      
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
      console.error(error);
    }
  };

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

      {/* KPI Cards Grid - Responsive layout: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        {/* Left Side Panel: Visual Pipeline Progress & History Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <PipelineOverview leads={sampleLeads} />
          <RecentLeads leads={sampleLeads} />
        </div>

        {/* Right Side Panel: Direct Tasks Controls */}
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
