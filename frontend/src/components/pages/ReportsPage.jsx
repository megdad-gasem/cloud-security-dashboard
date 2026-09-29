import React from 'react'
import { FileText, ClipboardCheck, AlertCircle, Bug } from 'lucide-react'
import { PageHeader, Panel, PanelHeader, StatTile, StatusText, Button } from './ui'
import { securityCenter, useSecurityCenter } from '../../store/securityCenter'

const TYPE_ICON = { Executive: FileText, Compliance: ClipboardCheck, Incident: AlertCircle, Vulnerability: Bug }
const TYPE_LABEL = { Executive: 'Executive', Compliance: 'Compliance', Incident: 'Incident', Vulnerability: 'Vulnerability' }

export default function ReportsPage() {
  useSecurityCenter()
  const state = securityCenter.state
  const handleGenerate = (type) => {
    // requestAction → store.addReport (simulated backend) → appears in history + audit.
    securityCenter.requestAction({
      collection: 'reports',
      id: '__new__',
      actionType: 'generate_report',
      item: { name: `${type} — ${securityCenter.nowStr()}` },
      meta: { type },
    })
  }

  const handleDownload = (r) =>
    securityCenter.requestAction({ collection: 'reports', id: r.id, actionType: 'download_report', item: r })
  const handleExport = (r) =>
    securityCenter.requestAction({ collection: 'reports', id: r.id, actionType: 'export_report', item: r })

  const reports = state.reports
  const types = state.reportTypes
  const ready = reports.filter((r) => r.status === 'Ready').length
  const expired = reports.filter((r) => r.status === 'Expired').length

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
      <PageHeader
        title="Reports"
        subtitle="Security posture summaries and report history"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <StatTile icon={FileText} accent="bg-blue-500/15 text-blue-400" title="Reports" value={reports.length} sub="in history" />
        <StatTile icon={AlertCircle} accent="bg-amber-500/15 text-amber-400" title="Ready" value={ready} sub="downloadable" />
        <StatTile icon={Bug} accent="bg-slate-500/15 text-slate-300" title="Expired" value={expired} sub="archived" />
        <StatTile icon={ClipboardCheck} accent="bg-purple-500/15 text-purple-400" title="Types" value={types.length} sub="available" />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1fr_1.6fr] gap-4">
        {/* Report types / generation */}
        <Panel className="flex flex-col min-h-0 overflow-hidden">
          <PanelHeader title="Report Types" subtitle="generate on demand" />
          <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-3 pb-3 space-y-1.5">
            {types.map((t) => {
              const Icon = TYPE_ICON[t.icon] || FileText
              return (
                <div key={t.id} className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg border border-base-border bg-base-panel2/30">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-purple-300" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-[12px] font-medium truncate">{t.name}</p>
                    <p className="text-slate-500 text-[10px] truncate">{t.desc}</p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleGenerate(TYPE_LABEL[t.name] || t.name)}
                    disabled={securityCenter.processing}
                  >
                    Generate Report
                  </Button>
                </div>
              )
            })}
          </div>
        </Panel>

        {/* Report history */}
        <Panel className="flex flex-col min-h-0 overflow-hidden">
          <PanelHeader title="Report History" subtitle="recently generated" />
          <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-3 pb-3">
            <div className="rounded-lg border border-base-border overflow-hidden">
              <div className="grid grid-cols-[1fr_80px_90px_70px_minmax(0,1fr)] text-slate-500 text-[10px] px-2 py-1.5 bg-base-panel2/60 gap-1">
                <span>Name</span><span>Type</span><span>Generated</span><span>Format</span><span></span>
              </div>
              <div className="divide-y divide-base-border">
                {reports.map((r) => (
                  <div key={r.id} className="grid grid-cols-[1fr_80px_90px_70px_minmax(0,1fr)] items-center gap-1 px-2 py-2">
                    <div className="min-w-0">
                      <p className="text-slate-200 text-[11.5px] font-medium truncate">{r.name}</p>
                      <p className="text-slate-500 text-[9.5px]">{r.size} · {r.status === 'Expired' ? 'archived' : 'available'}</p>
                    </div>
                    <span className="text-slate-400 text-[10px] truncate">{r.type}</span>
                    <span className="text-slate-500 text-[10px] truncate">{r.generated}</span>
                    <span className="text-slate-400 text-[10px]">{r.format}</span>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="neutral"
                        onClick={() => handleDownload(r)}
                        disabled={r.status === 'Expired' || securityCenter.processing}
                      >
                        Download Report
                      </Button>
                      <Button
                        variant="neutral"
                        onClick={() => handleExport(r)}
                        disabled={r.status === 'Expired' || securityCenter.processing}
                      >
                        Export Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
