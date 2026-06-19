import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useChartTheme } from '../../hooks/useChartTheme';

export function BarChartCard({ data }) {
  const { tooltipWrapperClass, cardClass, tickColor, gridColor } = useChartTheme();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { month, leads } = payload[0].payload;
      return (
        <div className={tooltipWrapperClass}>
          <p className="font-bold mb-1">{month}</p>
          <p className="text-blue-500 dark:text-blue-400 font-semibold">{leads} Leads</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Leads Trend</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Total number of inbound leads ingested over last 6 months.</p>
      </div>

      <div className="h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="leadsBlueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 6 }}
            />
            <Bar
              dataKey="leads"
              fill="url(#leadsBlueGradient)"
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default React.memo(BarChartCard);
