import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ChevronDown } from 'lucide-react'
import { cpuUtilizationData } from '../data/mockData'

// Tooltip مخصص يطابق شكل التصميم (كارت غامق فيه الوقت + النسبة)
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-base-panel2 border border-base-border rounded-lg px-3 py-2 text-center">
      <p className="text-slate-400 text-[11px]">{label}</p>
      <p className="text-white text-[13px] font-semibold">{payload[0].value}%</p>
    </div>
  )
}

/**
 * CpuChart
 * كارت "CPU Utilization" الكبير - چارت مساحي (area) يعرض متوسط استخدام الـ CPU
 * على مدار 24 ساعة، مع فلتر وقت بسيط في الأعلى.
 */
export default function CpuChart() {
  return (
    <div className="bg-base-panel border border-base-border rounded-xl p-4 flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-white text-[14px] font-semibold">CPU Utilization</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-slate-500 text-[11px]">Average CPU (%)</span>
          </div>
        </div>
        <button className="flex items-center gap-1.5 bg-base-panel2 border border-base-border rounded-md px-2.5 py-1.5 text-[11px] text-slate-300">
          Last 24 hours
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cpuUtilizationData} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1B2839" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={{ stroke: '#1B2839' }}
              tickLine={false}
              interval={1}
            />
            <YAxis
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cpu"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#cpuGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6', stroke: '#09121F', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
