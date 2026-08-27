import React from 'react'
import { ShieldCheck, Cloud, Settings, Shield, Archive } from 'lucide-react'
import { securityServices } from '../data/mockData'

const ICONS = { ShieldCheck, Cloud, Settings, Shield, Archive }

const COLOR_MAP = {
  green: 'bg-green-500/15 text-green-400',
  purple: 'bg-purple-500/15 text-purple-400',
  amber: 'bg-amber-500/15 text-amber-400',
  teal: 'bg-teal-500/15 text-teal-400',
  blue: 'bg-blue-500/15 text-blue-400',
}

const DETAIL_COLOR = {
  green: 'text-green-400',
  amber: 'text-amber-400',
  gray: 'text-slate-500',
}

/**
 * ServiceStatusRow
 * صف الكروت السفلي - حالة كل خدمة أمان مفعّلة (GuardDuty, CloudTrail, AWS Config, ...)
 */
export default function ServiceStatusRow() {
  return (
    <div className="grid grid-cols-6 gap-4 shrink-0">
      {securityServices.map((svc) => {
        const Icon = ICONS[svc.icon]
        return (
          <div key={svc.id} className="bg-base-panel border border-base-border rounded-xl p-3 flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${COLOR_MAP[svc.color]}`}>
              <Icon className="w-4.5 h-4.5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-slate-200 text-[12.5px] font-medium truncate">{svc.name}</p>
              <p className="text-slate-500 text-[11px] truncate">{svc.status}</p>
              <p className={`text-[10.5px] truncate ${DETAIL_COLOR[svc.detailColor]}`}>{svc.detail}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
