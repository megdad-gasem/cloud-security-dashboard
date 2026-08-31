import React, { useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { cpuMemorySeries } from '../../data/monitoringMockData'
import { MonPanel, MonPanelHeader, MonChip } from './ui'

const COLORS = { cpu: '#3B82F6', memory: '#A855F7' }

/**
 * CpuMemoryChart — خط زمني لـ CPU + Memory على مدار آخر ساعة.
 * - Tooltip تفاعلي، محور وقت، محور نسبة، Legend، Grid.
 * - إمكانية إظهار/إخفاء كل خط (CPU / Memory) بنفس لغة الـ Aegis.
 * - بياخد كامل ارتفاع الحاوية الوالدة (flex-1 min-h-0).
 */
export default function CpuMemoryChart({ series = cpuMemorySeries }) {
  const [show, setShow] = useState({ cpu: true, memory: true })

  const toggle = (key) => setShow((s) => ({ ...s, [key]: !s[key] }))

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* أزرار التبديل */}
      <div className="flex items-center gap-2 px-4 pb-2">
        <MonChip active={show.cpu} onClick={() => toggle('cpu')}>
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1.5" />CPU
        </MonChip>
        <MonChip active={show.memory} onClick={() => toggle('memory')}>
          <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1.5" />Memory
        </MonChip>
        <span className="text-slate-500 text-[10.5px] ml-auto hidden sm:block">Last 60 minutes</span>
      </div>

      <div className="flex-1 min-h-0 px-2 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#1B2839" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: '#1B2839' }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#101D30', border: '1px solid #1B2839', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: '#94A3B8' }}
              itemStyle={{ color: '#E2E8F0' }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: '#94A3B8' }} iconType="plainline" />
            {show.cpu && (
              <Line type="monotone" dataKey="cpu" name="CPU" stroke={COLORS.cpu} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            )}
            {show.memory && (
              <Line type="monotone" dataKey="memory" name="Memory" stroke={COLORS.memory} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}