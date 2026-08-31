import React from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { networkTrafficSeries } from '../../data/monitoringMockData'

const COLORS = { in: '#22D3EE', out: '#8B5CF6' }

/**
 * NetworkTrafficChart — Network In/Out بجانب بعض (MB/s).
 * Tooltip تفاعلي، محور وقت، Units واضحة، Legend، Grid مناسبة للثيم.
 */
export default function NetworkTrafficChart({ series = networkTrafficSeries }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center gap-2 px-4 pb-2">
        <span className="inline-flex items-center text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 mr-1.5" />In
        </span>
        <span className="inline-flex items-center text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-violet-400 mr-1.5" />Out
        </span>
        <span className="text-slate-500 text-[10.5px] ml-auto hidden sm:block">MB/s · Last 60 minutes</span>
      </div>

      <div className="flex-1 min-h-0 px-2 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="netInGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.in} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLORS.in} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="netOutGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.out} stopOpacity={0.3} />
                <stop offset="100%" stopColor={COLORS.out} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1B2839" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: '#1B2839' }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#101D30', border: '1px solid #1B2839', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: '#94A3B8' }}
              itemStyle={{ color: '#E2E8F0' }}
              formatter={(value, name) => [`${value} MB/s`, name === 'in' ? 'Network In' : 'Network Out']}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: '#94A3B8' }} iconType="plainline" />
            <Area type="monotone" dataKey="in" name="in" stroke={COLORS.in} strokeWidth={2} fill="url(#netInGrad)" dot={false} activeDot={{ r: 3 }} />
            <Area type="monotone" dataKey="out" name="out" stroke={COLORS.out} strokeWidth={2} fill="url(#netOutGrad)" dot={false} activeDot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}