import React from 'react'
import { MonPanel, MonPanelHeader, ResourceTypeIcon, StatusDot, TONE_TEXT } from './ui'

function currentMetric(r) {
  if (r.type === 'EC2 Instance' || r.type === 'RDS Database') return `CPU ${r.cpu}% · Mem ${r.memory}%`
  if (r.type === 'NAT Gateway') return `CPU ${r.cpu}%`
  if (r.type === 'Load Balancer') return `Requests ${r.network}`
  if (r.type === 'VPC' || r.type === 'S3 Bucket') return `Net ${r.network} GB`
  return `CPU ${r.cpu}%`
}

/**
 * ResourceHealth — قائمة الموارد المراقبة مع الصحة الحالية واختيار مورد.
 * الضغط على مورد بيحدّده (ويفتح ResourceDetailsPanel في الصفحة).
 */
export default function ResourceHealth({ resources = [], selectedId, onSelect }) {
  return (
    <MonPanel className="flex flex-col min-h-0 h-full">
      <MonPanelHeader
        title="Resource Health"
        subtitle={`${resources.length} monitored resources`}
        right={<span className="text-slate-500 text-[10.5px]">Click to inspect</span>}
      />
      <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-2 pb-2 space-y-1">
        {resources.map((r) => {
          const active = r.id === selectedId
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border text-left transition-colors ${
                active
                  ? 'bg-blue-600/15 border-blue-500/40'
                  : 'border-transparent hover:bg-base-panel2/60'
              }`}
            >
              <ResourceTypeIcon
                type={r.type}
                tint={active ? 'text-blue-400' : TONE_TEXT[r.statusTone] || 'text-slate-400'}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <StatusDot tone={r.statusTone} />
                  <p className="text-slate-200 text-[12px] font-medium truncate">{r.name}</p>
                </div>
                <p className="text-slate-500 text-[10.5px] truncate">{r.type} · {r.region}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-[11px] font-medium ${TONE_TEXT[r.statusTone] || 'text-slate-300'}`}>{r.status}</p>
                <p className="text-slate-500 text-[10px]">{currentMetric(r)}</p>
              </div>
            </button>
          )
        })}
      </div>
    </MonPanel>
  )
}