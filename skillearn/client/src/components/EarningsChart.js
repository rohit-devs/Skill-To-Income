import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-s-highest border border-outline-v/30 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-on-sv mb-1">{label}</p>
      <p className="font-black text-success">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
    </div>
  );
};

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/**
 * EarningsChart — 6-month earnings area chart
 * @param {Array<{month:string, earned:number}>} data - external data if available
 * @param {number} totalEarned - fallback to generate mock data
 */
export default function EarningsChart({ data, totalEarned = 0 }) {
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;

    // Generate plausible-looking 6-month mock from totalEarned
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const base = totalEarned > 0 ? Math.round((totalEarned / 6) * (0.4 + Math.random() * 0.9)) : 0;
      return {
        month: MONTH_SHORT[d.getMonth()],
        earned: base,
      };
    });
  }, [data, totalEarned]);

  const maxVal = Math.max(...chartData.map(d => d.earned), 1);

  return (
    <div className="w-full" style={{ height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#4ADE80" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(70,69,85,0.25)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--on-sv)', fontSize: 10, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, maxVal * 1.2]}
            tick={{ fill: 'var(--on-sv)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v === 0 ? '0' : `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(74,222,128,0.3)', strokeWidth: 2 }} />
          <Area
            type="monotone"
            dataKey="earned"
            stroke="#4ADE80"
            strokeWidth={2}
            fill="url(#earnGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#4ADE80', stroke: 'var(--s-highest)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
