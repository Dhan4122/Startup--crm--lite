import React from 'react';
import { ResponsiveContainer, FunnelChart, Funnel, Cell, LabelList, Tooltip } from 'recharts';
import { useChartTheme } from '../../hooks/useChartTheme';

export function FunnelChartCard({ data }) {
  const { tooltipWrapperClass, cardClass } = useChartTheme();

  // Map funnel data for Recharts
  // recharts expects shape: { value: number, name: string, fill: string }
  const chartData = data.map((item) => ({
    value: item.count,
    name: item.stage,
    fill: item.fill,
    convRate: item.convRate,
    dropOff: item.dropOff,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className={tooltipWrapperClass}>
          <p className="font-bold mb-1.5">{d.name}</p>
          <div className="space-y-1 opacity-80">
            <p>Leads Count: <span className="font-semibold opacity-100">{d.value}</span></p>
            <p>Conversion from Prev: <span className="font-semibold text-green-500 dark:text-green-400">{d.convRate}%</span></p>
            {d.name !== 'New' && (
              <p>Drop-off Rate: <span className="font-semibold text-rose-500 dark:text-rose-400">{d.dropOff}%</span></p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Sales Pipeline Funnel</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Full funnel drop-offs and stage conversions.</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6 mt-6">
        {/* Recharts Funnel Container */}
        <div className="w-full lg:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip content={<CustomTooltip />} />
              <Funnel
                dataKey="value"
                data={chartData}
                isAnimationActive
                labelKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  position="right"
                  fill="currentColor"
                  className="fill-slate-600 dark:fill-slate-400 text-[10px] font-bold"
                  dataKey="name"
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic Funnel Stages Details — with hover states */}
        <div className="w-full lg:w-1/2 flex flex-col gap-2">
          {data.map((item, idx) => {
            return (
              <div
                key={item.stage}
                className={
                  'flex items-center justify-between p-2.5 rounded-xl border ' +
                  'border-slate-100 dark:border-slate-800/60 ' +
                  'bg-slate-50/50 dark:bg-slate-800/20 ' +
                  'transition-all duration-200 ease-out cursor-default ' +
                  'hover:bg-white dark:hover:bg-slate-800/50 ' +
                  'hover:border-slate-200 dark:hover:border-slate-700 ' +
                  'hover:shadow-sm dark:hover:shadow-[0_2px_12px_rgba(0,0,0,0.4)] ' +
                  'hover:scale-[1.01]'
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-6 rounded-md shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.stage}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {item.count} Active Leads
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">
                      {item.convRate}%
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Conversion
                    </span>
                  </div>
                  {idx > 0 && (
                    <div className="flex flex-col border-l border-slate-200 dark:border-slate-800 pl-3">
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        {item.dropOff}%
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Drop-off
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(FunnelChartCard);
