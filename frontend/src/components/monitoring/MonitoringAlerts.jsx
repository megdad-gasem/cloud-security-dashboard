import React from 'react'
import { BellRing } from 'lucide-react'
import { MonPanel, MonPanelHeader, SeverityBadge, StatusDot } from './ui'

/**
 * MonitoringAlerts — تنبيهات المراقبة النشطة/المحلولة.
 * كل تنبيه: العنوان + الخطورة + المورد + القيمة الحالية + العتبة + الوقت + الحالة.
 */
export default function MonitoringAlerts({ alerts = [] }) {
  return (
    <MonPanel className="flex flex-col min-h-0 h-full">
      <MonPanelHeader
        title="Monitoring Alerts"
        subtitle={`${alerts.filter((a) => a.status === 'Active').length} active`}
        right={
          <span className="text-slate-500 text-[10.5px]">
            <BellRing className="w-3.5 h-3.5 inline mr-1" />Thresholds
          </span>
        }
      />
      <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-2 pb-2 space-y-1">
        {alerts.map((a) => (
          <div key={a.id} className="px-2.5 py-2 rounded-lg border border-base-border bg-base-panel2/40">
            <div className="flex items-center justify-between gap-2">
              <p className="text-slate-200 text-[12px] font-medium truncate">{a.title}</p>
              <StatusDot tone={a.status === 'Active' ? 'amber' : 'green'} />
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <SeverityBadge severity={a.severity} />
              <span className="text-slate-400 text-[10.5px]">{a.resource}</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <span className="text-slate-500 text-[10px]">
                <span className="text-slate-300">{a.value}</span> {a.threshold}
              </span>
              <span className="text-slate-500 text-[10px]">{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </MonPanel>
  )
}