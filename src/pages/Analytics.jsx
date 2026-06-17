import React from 'react';
import { useLeads } from '../context/LeadContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Percent, 
  Activity, 
  ChevronUp, 
  CheckCircle2 
} from 'lucide-react';

export default function Analytics() {
  const { leads } = useLeads();

  // 1. Data Aggregation: Funnel Conversion Stages
  // Stages: Lead Ingested -> Contact Established -> Deal Qualified -> Deal Won
  const stagesCount = {
    Ingested: leads.length,
    Contacted: leads.filter(l => ['Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won'].includes(l.status)).length,
    Qualified: leads.filter(l => ['Meeting Scheduled', 'Proposal Sent', 'Won'].includes(l.status)).length,
    Won: leads.filter(l => l.status === 'Won').length
  };

  const funnelData = [
    { name: '1. Ingested', count: stagesCount.Ingested, rate: '100%' },
    { name: '2. Contacted', count: stagesCount.Contacted, rate: stagesCount.Ingested ? `${Math.round((stagesCount.Contacted / stagesCount.Ingested) * 100)}%` : '0%' },
    { name: '3. Qualified', count: stagesCount.Qualified, rate: stagesCount.Contacted ? `${Math.round((stagesCount.Qualified / stagesCount.Contacted) * 100)}%` : '0%' },
    { name: '4. Closed Won', count: stagesCount.Won, rate: stagesCount.Qualified ? `${Math.round((stagesCount.Won / stagesCount.Qualified) * 100)}%` : '0%' }
  ];

  // 2. Data Aggregation: Pipeline Deal Value by Stage
  const stageValues = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + lead.value;
    return acc;
  }, {});

  const pipelineValueData = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'].map(status => ({
    status,
    value: stageValues[status] || 0
  }));

  // Colors mapping for charts
  const BAR_COLORS = {
    New: '#2563EB',
    Contacted: '#F59E0B',
    'Meeting Scheduled': '#8B5CF6',
    'Proposal Sent': '#6366F1',
    Won: '#22C55E',
    Lost: '#EF4444'
  };

  // 3. Sales Representative Leaderboard Calculation
  const ownerStats = leads.reduce((acc, lead) => {
    const owner = lead.owner;
    if (!acc[owner]) {
      acc[owner] = { name: owner, total: 0, wonCount: 0, activeValue: 0, wonValue: 0 };
    }
    acc[owner].total += 1;
    if (lead.status === 'Won') {
      acc[owner].wonCount += 1;
      acc[owner].wonValue += lead.value;
    } else if (lead.status !== 'Lost') {
      acc[owner].activeValue += lead.value;
    }
    return acc;
  }, {});

  const leaderboard = Object.values(ownerStats).sort((a, b) => b.wonValue - a.wonValue);

  // 4. Source Channel Conversion Efficiency (ROI)
  const sourceStats = leads.reduce((acc, lead) => {
    const source = lead.source;
    if (!acc[source]) {
      acc[source] = { name: source, count: 0, wonCount: 0, totalValue: 0 };
    }
    acc[source].count += 1;
    acc[source].totalValue += lead.value;
    if (lead.status === 'Won') {
      acc[source].wonCount += 1;
    }
    return acc;
  }, {});

  const sourceROI = Object.values(sourceStats).map(s => ({
    ...s,
    conversionRate: s.count ? Math.round((s.wonCount / s.count) * 100) : 0
  })).sort((a, b) => b.totalValue - a.totalValue);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-main">Performance Analytics</h1>
        <p className="text-sm text-text-muted">High-fidelity metrics breakdown, conversion funnel rates, and ROI analysis.</p>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Conversion Funnel (Vertical Bar Chart) */}
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-subtle">
          <div>
            <h2 className="text-sm font-bold text-text-main">Pipeline Funnel Efficiency</h2>
            <p className="text-xs text-text-muted">Absolute volume conversion across deal phases.</p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-subtle)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 500 }} />
                <Tooltip 
                  formatter={(value) => [`${value} Leads`]}
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#22C55E' : '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Conversion ratios footer */}
          <div className="mt-4 pt-4 border-t border-border-subtle grid grid-cols-4 gap-2 text-center">
            {funnelData.map((d, i) => (
              <div key={d.name}>
                <p className="text-[10px] font-semibold text-text-muted uppercase">Stage {i+1}</p>
                <p className="text-xs font-bold text-text-main mt-0.5">{d.rate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Pipeline Deal Value By Stage */}
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-subtle">
          <div>
            <h2 className="text-sm font-bold text-text-main">Value Allocation By Stage</h2>
            <p className="text-xs text-text-muted">Total value distribution ($) relative to active pipeline status.</p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineValueData} margin={{ top: 10, right: 10, left: -5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${v / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Deal Value']}
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {pipelineValueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[entry.status] || '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid structure: Representative Leaderboard (Left) & Channel ROI (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Leaderboard (2/3 width) */}
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-subtle lg:col-span-2 overflow-hidden">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-text-main">Rep Conversion Index</h2>
            <p className="text-xs text-text-muted">Closed deal volume, value, and pipeline velocity comparison.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-base/30 text-text-muted font-semibold">
                  <th className="p-3">Representative</th>
                  <th className="p-3 text-center">Deals Closed</th>
                  <th className="p-3 text-right">Active Pipe Value</th>
                  <th className="p-3 text-right">Won Revenue Value</th>
                  <th className="p-3 text-right">Success Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {leaderboard.map((rep, idx) => (
                  <tr key={rep.name} className="hover:bg-bg-base/40">
                    <td className="p-3 font-semibold text-text-main flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-primary-light text-primary font-bold dark:bg-primary/20 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{rep.name}</span>
                    </td>
                    <td className="p-3 text-center text-text-main font-medium">{rep.wonCount} / {rep.total}</td>
                    <td className="p-3 text-right text-text-muted font-medium">${rep.activeValue.toLocaleString()}</td>
                    <td className="p-3 text-right text-success font-bold">${rep.wonValue.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <span className="font-semibold text-text-main">
                        {rep.total ? Math.round((rep.wonCount / rep.total) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Source ROI Breakdown (1/3 width) */}
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-subtle">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-text-main">Channel conversion ROI</h2>
            <p className="text-xs text-text-muted">Lead quality indexing categorized by acquisition channel.</p>
          </div>

          <div className="space-y-4">
            {sourceROI.map((source) => (
              <div key={source.name} className="p-3 rounded-lg border border-border-subtle bg-bg-base/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-main capitalize">{source.name}</span>
                  <span className="text-xs font-bold text-primary">${source.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span>Count: {source.count} leads</span>
                  <div className="flex items-center gap-1 font-semibold text-success">
                    <Percent className="h-3 w-3" />
                    <span>{source.conversionRate}% won</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: `${source.conversionRate}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
