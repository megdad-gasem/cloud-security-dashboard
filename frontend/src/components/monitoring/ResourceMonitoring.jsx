import React from 'react'
import ResourceHealth from './ResourceHealth'
import ResourceDetailsPanel from './ResourceDetailsPanel'
import { MousePointerClick } from 'lucide-react'
import { MonPanel } from './ui'

/**
 * ResourceMonitoring — العمود الأيمن: قائمة صحة الموارد، وعند اختيار مورد
 * بتتبدل للوحة التفاصيل (ResourceDetailsPanel). كلاهما محصور جوه كارت واحد
 * مرن (flex-1 min-h-0) عشان ميحصلش overflow.
 */
export default function ResourceMonitoring({ resources = [], selectedId, onSelect, onClose }) {
  const selected = resources.find((r) => r.id === selectedId) || null

  if (selected) {
    return <ResourceDetailsPanel resource={selected} onClose={onClose} />
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      <ResourceHealth resources={resources} selectedId={null} onSelect={onSelect} />
      {resources.length === 0 && (
        <MonPanel className="h-full flex flex-col items-center justify-center text-center px-4 py-6 min-h-0">
          <MousePointerClick className="w-5 h-5 text-slate-400 mb-2" />
          <p className="text-slate-300 text-[12px] font-semibold">No monitored resources</p>
        </MonPanel>
      )}
    </div>
  )
}