import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { STATUS_COLORS } from '../../constants/analyticsColors';
import { useChartTheme } from '../../hooks/useChartTheme';

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
    percentage,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 8) * cos;
  const sy = cy + (outerRadius + 8) * sin;
  const mx = cx + (outerRadius + 16) * cos;
  const my = cy + (outerRadius + 16) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 12;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      {/* Active Sector — expanded + subtle outer ring glow */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={1}
      />
      {/* Outer glow ring */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.3}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 6}
        y={ey}
        textAnchor={textAnchor}
        fill="currentColor"
        className="text-xs font-bold fill-slate-800 dark:fill-slate-200"
      >
        {payload.name}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 6}
        y={ey}
        dy={14}
        textAnchor={textAnchor}
        fill="currentColor"
        className="text-[10px] fill-slate-500 dark:fill-slate-400"
      >
        {`${value} Leads (${percentage}%)`}
      </text>
    </g>
  );
};

export function PieChartCard({ data, totalLeads }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { cardClass } = useChartTheme();

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className={cardClass}>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Lead Status Distribution</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Current stages across all qualified leads.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-6">
        {/* Doughnut container */}
        <div className="relative w-full md:w-1/2 h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                dataKey="value"
                onMouseEnter={onPieEnter}
                animationDuration={600}
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={STATUS_COLORS[entry.name] || '#94A3B8'}
                    className="stroke-white dark:stroke-slate-900 stroke-2 outline-none transition-opacity duration-200"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute Center Label */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalLeads}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Leads
            </span>
          </div>
        </div>

        {/* Custom Interactive Legend — stronger hover states */}
        <div className="w-full md:w-1/2 flex flex-col gap-2">
          {data.map((entry, idx) => {
            const color = STATUS_COLORS[entry.name] || '#94A3B8';
            const isActive = activeIndex === idx;
            return (
              <div
                key={entry.name}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`
                  flex items-center justify-between p-2.5 rounded-xl border
                  transition-all duration-200 ease-out cursor-pointer
                  ${isActive
                    ? 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/60 shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.5)] scale-[1.02]'
                    : 'border-transparent hover:bg-white dark:hover:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700/60 hover:shadow-sm hover:scale-[1.01]'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 transition-transform duration-200"
                    style={{
                      backgroundColor: color,
                      boxShadow: isActive ? `0 0 0 3px ${color}28` : 'none',
                    }}
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {entry.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {entry.value}{' '}
                  <span className="text-slate-400 dark:text-slate-500 font-medium">
                    ({entry.percentage}%)
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(PieChartCard);
