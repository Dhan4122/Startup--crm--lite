import React from 'react';
import { Users, Target, Briefcase, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/analyticsHelpers';

export function StatsCards({ stats }) {
  const cards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/45',
      trend: { value: '14.2%', isPositive: true },
      borderColor: 'border-blue-100 dark:border-blue-900/40',
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: Target,
      color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/45',
      trend: { value: '2.4%', isPositive: true },
      borderColor: 'border-green-100 dark:border-green-900/40',
    },
    {
      title: 'Pipeline Value',
      value: formatCurrency(stats.pipelineValue),
      icon: Briefcase,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/45',
      trend: { value: '8.1%', isPositive: true },
      borderColor: 'border-amber-100 dark:border-amber-900/40',
    },
    {
      title: 'Won Revenue',
      value: formatCurrency(stats.wonRevenue),
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/45',
      trend: { value: '18.7%', isPositive: true },
      borderColor: 'border-emerald-100 dark:border-emerald-900/40',
    },
    {
      title: 'Average Sales Cycle',
      value: `${stats.averageSalesCycle} Days`,
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/45',
      trend: { value: '4 days faster', isPositive: true },
      borderColor: 'border-purple-100 dark:border-purple-900/40',
    },
    {
      title: 'Lost Rate',
      value: `${stats.lostRate}%`,
      icon: AlertCircle,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/45',
      trend: { value: '1.2%', isPositive: false },
      borderColor: 'border-rose-100 dark:border-rose-900/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            style={{ animationDelay: `${i * 75}ms` }}
            className={`
              flex flex-col justify-between p-5
              bg-white dark:bg-slate-900 border rounded-2xl shadow-sm
              transition-all duration-200 ease-out animate-fadeIn
              hover:shadow-xl dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)]
              hover:scale-[1.03]
              hover:border-slate-300 dark:hover:border-slate-700
              cursor-default
              ${card.borderColor}
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    card.trend.isPositive
                      ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/40'
                      : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40'
                  }`}
                >
                  {card.trend.isPositive ? '↑' : '↓'} {card.trend.value}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  vs prev period
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(StatsCards);
