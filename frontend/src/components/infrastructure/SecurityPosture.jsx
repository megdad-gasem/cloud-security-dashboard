import React, { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Panel, PanelHeader, SeverityChip } from './ui'

/**
 * SecurityPosture
 * قسم "Infrastructure Security Posture" — findings متعلقة بالبنية التحتية
 * مع فلتر حسب الخطورة + زر "View resource" يحدّد ويركز العقدة في الـ topology.
 */
export default function SecurityPosture({ findings = [], onViewResource }) {
  const [severity, setSeverity] = useState('All')
  const levels = ['All', 'Critical', 'High', 'Medium', 'Low']
  const filtered = severity === 'All' ? findings : findings.filter((f) => f.severity === severity)

  return (
    <Panel className="flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 pt-3 shrink-0">
        <div className="min-w-0">
          <h3 className="text-white text-[13px] font-semibold truncate">Security Posture</h3>
          <p className="text-slate-500 text-[10px] truncate">{findings.length} findings</p>
        </div>
        <div className="flex items-center gap-1">
          {levels.map((lv) => (
            <button
              key={lv}
              onClick={() => setSeverity(lv)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-medium border transition-colors ${
                severity === lv
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-base-panel2 text-slate-400 border-base-border hover:text-slate-200'
              }`}
            >
              {lv}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 px-3 py-2">
        <div className="rounded-lg border border-base-border overflow-hidden h-full flex flex-col">
          <div className="grid grid-cols-[70px_1fr_70px] text-slate-500 text-[9.5px] px-2 py-1.5 bg-base-panel2/60 shrink-0">
            <span>Severity</span>
            <span>Finding</span>
            <span className="text-right">Action</span>
          </div>
          <div className="flex-1 min-h-0 divide-y divide-base-border overflow-y-auto thin-scrollbar">
            {filtered.length === 0 && (
              <p className="text-slate-500 text-[11px] px-2 py-3">No findings for this severity.</p>
            )}
            {filtered.map((f) => (
              <div key={f.id} className="grid grid-cols-[70px_1fr_70px] items-center gap-1 px-2 py-1.5 hover:bg-base-panel2/40 transition-colors">
                <div className="justify-self-start">
                  <SeverityChip severity={f.severity} />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-200 text-[10.5px] font-medium truncate">{f.title}</p>
                  <p className="text-slate-500 text-[9px] truncate">{f.affectedResource}</p>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => onViewResource && onViewResource(f.nodeId)}
                    className="text-[9px] text-blue-400 hover:text-blue-300 border border-blue-500/30 bg-blue-600/10 rounded px-1.5 py-0.5 transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  )
}