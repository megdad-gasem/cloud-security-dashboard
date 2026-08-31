import React, { useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { metricsTimeSeries } from '../../data/monitoringMockData'
import { MonPanel, MonPanelHeader, MonChip } from './ui'

const METRICS = [
  { key: 'cpu', label: 'CPU', color: '#3B82F6' },
  { key: 'memory', label: 'Memory', color: '#A855F7' },
  { key: 'networkIn', label: 'Network In', color: '#22D3EE' },
  { key: 'networkOut', label: 'Network Out', color: '#8B5CF6' },
  { key: 'disk', label: 'Disk', color: '#F59E0B' },
]

const TITLES = {
  cpu: 'CPU Utilization',
  memory: 'Memory Utilization',
  networkIn: 'Network In (MB/s)',
  networkOut: 'Network Out (MB/s)',
  disk: 'Disk Utilization',
}

/**
 * MetricsOverview — اختيار المقياس (CPU/Memory/Network In/Out/Disk) + الرسم.
 * تغيير المقياس بيغيّر الـ chart من بيانات mock time-series.
 */
export default function MetricsOverview({ metrics = metricsTimeSeries }) {
  const [active, setActive] = useState('cpu')
  const metric = METRICS.find((m) => m.key === active)
  const data = metrics[active] || []

  return (
    <MonPanel className="flex flex-col min-h-0">
      <MonPanelHeader
        title="Metrics Overview"
        subtitle={TITLES[active]}
        right={
          <div className="flex items-center gap-1.5 overflow-x-auto thin-scrollbar">
            {METRICS.map((m) => (
              <MonChip key={m.key} active={m.key === active} onClick={() => setActive(m.key)}>
                {m.label}
              </MonChip>
            ))}
          </div>
        }
      />

      <div className="flex-1 min-h-0 px-3 pb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1B2839" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: '#1B2839' }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#101D30', border: '1px solid #1B2839', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: '#94A3B8' }}
              itemStyle={{ color: '#E2E8F0' }}
            />
            <Area type="monotone" dataKey="value" name={metric.label} stroke={metric.color} strokeWidth={2} fill="url(#metricsGrad)" dot={false} activeDot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </MonPanel>
  )
}