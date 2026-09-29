import React from 'react'
import { StatusDot, TONE_TEXT } from './ui'

// Monitoring command/telemetry strip — ONE continuous surface (not cards):
//   System Health (compact left anchor) | CPU + Memory (primary, thin ~2px micro
//   bars reflecting the existing percentages) | Network + Healthy Resources +
//   Availability (secondary). Same values from the data layer — composition only.
// Safe defaults ('-') are preserved until the real async data arrives.
const TONE_FILL = {
  green: 'bg-green-400',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
  cyan: 'bg-cyan-400',
  slate: 'bg-slate-500',
}

export default function MonitoringSummary({ summary }) {
  const cpu = summary?.cpu || {}
  const memory = summary?.memory || {}
  const network = summary?.network || {}
  const healthy = summary?.healthyResources || {}
  const availability = summary?.availability || {}

  const healthTone = healthy.statusTone || 'slate'
  // Existing health/status wording (e.g. "1 warning") — no invented text.
  const healthWording = healthy.status || healthy.value || '-'

  // Primary telemetry metrics — stronger numbers + micro progress bars.
  const primary = [
    {
      key: 'cpu', title: 'CPU', value: cpu.value ?? '-', unit: cpu.unit,
      status: cpu.status ?? '', tone: cpu.statusTone || 'slate',
      pct: Math.max(0, Math.min(100, Number(cpu.value) || 0)),
    },
    {
      key: 'memory', title: 'Memory', value: memory.value ?? '-', unit: memory.unit,
      status: memory.status ?? '', tone: memory.statusTone || 'slate',
      pct: Math.max(0, Math.min(100, Number(memory.value) || 0)),
    },
  ]

  // Secondary metrics — deliberately lighter weight, no bars.
  const secondary = [
    { key: 'network', title: 'Network', value: network.value ?? '-', unit: network.unit ?? '', status: network.status ?? '', tone: network.statusTone || 'slate', warn: false },
    { key: 'healthy', title: 'Healthy Resources', value: healthy.value ?? '-', unit: '', status: '', tone: healthTone, warn: healthTone === 'amber' },
    { key: 'availability', title: 'Availability', value: availability.value ?? '-', unit: '', status: availability.status ?? '', tone: availability.statusTone || 'slate', warn: false },
  ]

  return (
    <div className="shrink-0 border border-base-border rounded-xl bg-base-panel px-3.5 py-2 flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {/* System Health — compact left anchor */}
      <div className="flex items-center gap-2 shrink-0">
        <StatusDot tone={healthTone} />
        <div className="min-w-0">
          <p className="text-slate-200 text-[11.5px] font-semibold leading-tight">System Health</p>
          <p className={`text-[10.5px] font-medium leading-tight ${TONE_TEXT[healthTone] || 'text-slate-400'}`}>{healthWording}</p>
        </div>
      </div>

      <span className="w-[1px] self-stretch bg-slate-700 shrink-0" />

      {/* Primary cluster — CPU + Memory (existing percentages as thin bars) */}
      <div className="flex items-center gap-4 min-w-0">
        {primary.map((m) => (
          <div key={m.key} className="min-w-0 shrink-0">
            <p className="text-slate-500 text-[10px] uppercase tracking-wide truncate max-w-[110px]">{m.title}</p>
            <p className="text-white text-[15px] font-semibold leading-tight">
              {m.value}
              {m.unit && <span className="text-slate-500 text-[10px] ml-0.5">{m.unit}</span>}
              {m.status && (
                <span className={`ml-1.5 text-[9.5px] font-medium truncate ${TONE_TEXT[m.tone] || 'text-slate-500'}`}>{m.status}</span>
              )}
            </p>
            <div className="mt-0.5 h-0.5 rounded-full overflow-hidden bg-base-panel2 w-16" title={`${m.title}: ${m.pct}%`}>
              <div className={`h-0.5 ${TONE_FILL[m.tone] || 'bg-slate-500'}`} style={{ width: `${m.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <span className="w-[1px] self-stretch bg-slate-700 shrink-0" />

      {/* Secondary cluster — Network / Healthy Resources / Availability */}
      <div className="flex items-center gap-3 min-w-0">
        {secondary.map((m) => (
          <div key={m.key} className="min-w-0 shrink-0">
            <p className="text-slate-500 text-[10px] uppercase tracking-wide truncate max-w-[110px]">{m.title}</p>
            <p className="text-white text-[12.5px] font-medium leading-tight">
              {m.warn && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />}
              {m.value}
              {m.unit && <span className="text-slate-500 text-[9.5px] ml-0.5">{m.unit}</span>}
              {m.status && (
                <span className={`ml-1.5 text-[9.5px] font-medium truncate ${TONE_TEXT[m.tone] || 'text-slate-500'}`}>{m.status}</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}