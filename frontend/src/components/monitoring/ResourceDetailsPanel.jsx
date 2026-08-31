import React from 'react'
import { X } from 'lucide-react'
import { MonPanel, ResourceTypeIcon, StatusDot, TONE_TEXT } from './ui'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500 text-[10.5px]">{label}</span>
      <span className="text-slate-200 text-[12px] font-medium">{value}</span>
    </div>
  )
}

/**
 * ResourceDetailsPanel — تفاصيل مورد مراقب (بيظهر لما المستخدم يختار مورد).
 * data-driven: بياخد المورد + onClose. لا يغادر صفحة الـ Monitoring.
 */
export default function ResourceDetailsPanel({ resource, onClose }) {
  if (!resource) return null
  return (
    <MonPanel className="flex flex-col min-h-0 h-full">
      <div className="flex items-start justify-between gap-2 px-4 pt-3.5 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-base-panel2 border border-base-border flex items-center justify-center shrink-0">
            <ResourceTypeIcon type={resource.type} tint="text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-semibold truncate">{resource.name}</p>
            <p className="text-slate-500 text-[10.5px] truncate">{resource.type}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 mt-2 shrink-0">
        <span className={`inline-flex items-center gap-1.5 text-[11px] rounded-md px-2 py-0.5 bg-base-panel2 border border-base-border ${TONE_TEXT[resource.statusTone] || 'text-slate-300'}`}>
          <StatusDot tone={resource.statusTone} />
          {resource.status}
        </span>
        <span className="text-slate-500 text-[10.5px]">Updated {resource.lastUpdated}</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-4 py-3 space-y-2.5">
        <Row label="Resource ID" value={resource.resourceId || resource.id} />
        <Row label="Region" value={resource.region} />
        <Row label="Availability Zone" value={resource.az} />
        <Row label="CPU Utilization" value={`${resource.cpu}%`} />
        <Row label="Memory Utilization" value={`${resource.memory}%`} />
        <Row label="Network Traffic" value={`${resource.network} GB`} />
        <Row label="Availability" value={`${resource.availability}%`} />
        <Row label="Last Updated" value={resource.lastUpdated} />
      </div>
    </MonPanel>
  )
}