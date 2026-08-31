import React from 'react'
import { History } from 'lucide-react'
import { MonPanel, MonPanelHeader, ResourceTypeIcon, SeverityBadge } from './ui'

/**
 * RecentActivity — خط زمني مضغوط لأحداث المراقبة (started/stopped/alerts/restored...).
 * بيبقى compact ومش بياخد مساحة كبيرة عشان ميحصلش overflow.
 */
export default function RecentActivity({ activity = [] }) {
  return (
    <MonPanel className="flex flex-col min-h-0 h-full">
      <MonPanelHeader
        title="Recent Activity"
        subtitle="Latest monitoring events"
        right={<History className="w-4 h-4 text-slate-500" />}
      />
      <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-2 pb-2 space-y-1">
        {activity.map((e) => (
          <div key={e.id} className="flex items-center gap-2.5 px-2 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
            <ResourceTypeIcon type={e.type === 'database' ? 'RDS Database' : e.type === 'alb' ? 'Load Balancer' : 'EC2 Instance'} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-[11.5px] truncate">
                <span className="font-medium">{e.action}</span>{' '}
                <span className="text-slate-400">· {e.resource}</span>
              </p>
            </div>
            {e.severity && <SeverityBadge severity={e.severity} />}
            <span className="text-slate-500 text-[10px] shrink-0">{e.time}</span>
          </div>
        ))}
      </div>
    </MonPanel>
  )
}