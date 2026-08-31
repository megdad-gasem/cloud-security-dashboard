import React from 'react'
import { Gauge, MemoryStick, Network, HeartPulse, BellRing, ShieldCheck } from 'lucide-react'
import { TONE_TEXT, TONE_BG } from './ui'

const ICONS = { Gauge, MemoryStick, Network, HeartPulse, BellRing, ShieldCheck }

function SummaryCard({ icon: Icon, title, value, unit, status, tone }) {
  return (
    <div className="bg-base-panel border border-base-border rounded-xl p-3.5 min-w-0 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${TONE_BG[tone] || 'bg-base-panel2'}`}>
        <Icon className={`w-5 h-5 ${TONE_TEXT[tone] || 'text-slate-400'}`} strokeWidth={2.1} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-[11px] truncate">{title}</p>
        <p className="text-white text-xl font-semibold leading-tight">
          {value}
          {unit && <span className="text-slate-400 text-[13px] font-medium ml-0.5">{unit}</span>}
        </p>
        <p className={`text-[10.5px] truncate ${TONE_TEXT[tone] || 'text-slate-500'}`}>{status}</p>
      </div>
    </div>
  )
}

/**
 * MonitoringSummary — 6 كروت مقاييس علوية (CPU/Memory/Network/Healthy/Alerts/Availability)
 * القيم محسوبة من monitoringSummary اللي جاي من data layer (mock أو API مستقبلاً).
 *
 * ملاحظة: summary مش ممكن يكون فارغ/ناقص في أول render (قبل ما الـ async data تجي)،
 * فكل مقياس بيستخدم قيمة افتراضية آمنة (default) من وِلّا ما يجي اللود حقيقي.
 * ده بيمنع أي TypeError من إنه يهبّط الصفحة كلها (blank screen).
 */
export default function MonitoringSummary({ summary }) {
  const cpu = summary?.cpu || {}
  const memory = summary?.memory || {}
  const network = summary?.network || {}
  const healthy = summary?.healthyResources || {}
  const alerts = summary?.alerts || {}
  const availability = summary?.availability || {}

  return (
    <div className="grid grid-cols-3 xl:grid-cols-6 gap-3 shrink-0">
      <SummaryCard icon={ICONS.Gauge} title="CPU Utilization" value={cpu.value ?? '-'} unit={cpu.unit} status={cpu.status ?? ''} tone={cpu.statusTone || 'slate'} />
      <SummaryCard icon={ICONS.MemoryStick} title="Memory Utilization" value={memory.value ?? '-'} unit={memory.unit} status={memory.status ?? ''} tone={memory.statusTone || 'slate'} />
      <SummaryCard icon={ICONS.Network} title="Network Traffic" value={network.value ?? '-'} unit={network.unit} status={network.status ?? ''} tone={network.statusTone || 'slate'} />
      <SummaryCard icon={ICONS.HeartPulse} title="Healthy Resources" value={healthy.value ?? '-'} status={healthy.status ?? ''} tone={healthy.statusTone || 'slate'} />
      <SummaryCard icon={ICONS.BellRing} title="Active Monitoring Alerts" value={alerts.value ?? '-'} status={alerts.status ?? ''} tone={alerts.statusTone || 'slate'} />
      <SummaryCard icon={ICONS.ShieldCheck} title="Availability" value={availability.value ?? '-'} status={availability.status ?? ''} tone={availability.statusTone || 'slate'} />
    </div>
  )
}