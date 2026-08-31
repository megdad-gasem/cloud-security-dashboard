import React, { useState } from 'react'
import { ClipboardCheck, ShieldCheck, ShieldX, ShieldAlert, ShieldOff } from 'lucide-react'
import { PageHeader, Panel, PanelHeader, StatTile, StatusText, ActionRow } from './ui'
import { securityCenter, useSecurityCenter, navigate } from '../../store/securityCenter'

const STATUS_ICON = { Passed: ShieldCheck, Failed: ShieldX, Warning: ShieldAlert, Exception: ShieldOff }
const STATUS_COLOR = {
  Passed: 'bg-green-500/15 text-green-400',
  Failed: 'bg-red-500/15 text-red-400',
  Warning: 'bg-amber-500/15 text-amber-400',
  Exception: 'bg-slate-500/15 text-slate-300',
}

// Failed / warning controls get remediation actions; passed controls are
// effectively remediated and only keep "view finding" when one is linked.
function controlActions(c) {
  if (c.status === 'Passed') {
    return c.finding && c.finding !== '—' ? ['view_finding'] : []
  }
  if (c.status === 'Exception') return c.finding && c.finding !== '—' ? ['view_finding'] : []
  const a = ['remediate_control']
  if (c.resource) a.push('view_resource')
  if (c.finding && c.finding !== '—') a.push('view_finding')
  a.push('accept_exception')
  return a
}

export default function CompliancePage() {
  useSecurityCenter()
  const state = securityCenter.state
  const frameworks = state.frameworks
  const controls = state.controls
  const [fwId, setFwId] = useState(frameworks[0]?.id || null)

  const passed = controls.filter((c) => c.status === 'Passed').length
  const failed = controls.filter((c) => c.status === 'Failed').length
  const exceptions = controls.filter((c) => c.status === 'Exception').length
  const score = Math.round((passed / (controls.length || 1)) * 100)

  const onControl = (c) => (actionType) =>
    securityCenter.requestAction({
      collection: 'controls',
      id: c.id,
      actionType,
      item: c,
      onNavigate: (to) => navigate(to),
    })

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
      <PageHeader title="Compliance" subtitle="Posture, frameworks, and control status" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <StatTile icon={ClipboardCheck} accent="bg-green-500/15 text-green-400" title="Posture Score" value={`${score}%`} sub="overall" />
        <StatTile icon={ShieldCheck} accent="bg-green-500/15 text-green-400" title="Passed" value={passed} sub="controls" />
        <StatTile icon={ShieldX} accent="bg-red-500/15 text-red-400" title="Failed" value={failed} sub="controls" />
        <StatTile icon={ShieldAlert} accent="bg-purple-500/15 text-purple-400" title="Frameworks" value={frameworks.length} sub={`${exceptions} exceptions`} />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1fr_1.6fr] gap-4">
        {/* Frameworks */}
        <Panel className="flex flex-col min-h-0 overflow-hidden">
          <PanelHeader title="Framework Overview" subtitle="click to filter" />
          <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-3 pb-3 space-y-1.5">
            {frameworks.map((f) => {
              const Icon = STATUS_ICON[f.status] || ShieldCheck
              return (
                <button
                  key={f.id}
                  onClick={() => setFwId(f.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg border transition-colors ${fwId === f.id ? 'bg-blue-600/15 border-blue-500/40' : 'border-base-border hover:bg-base-panel2/50'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${STATUS_COLOR[f.status]}`}>
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-[12px] font-medium truncate">{f.name}</p>
                    <p className="text-slate-500 text-[10px]">Score {f.score}%</p>
                  </div>
                  <StatusText status={f.status} />
                </button>
              )
            })}
          </div>
        </Panel>

        {/* Controls — live, actionable */}
        <Panel className="flex flex-col min-h-0 overflow-hidden">
          <PanelHeader title="Controls" subtitle="pass / fail per framework · remediate failed" />
          <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-3 pb-3">
            <div className="rounded-lg border border-base-border overflow-hidden">
              <div className="grid grid-cols-[64px_56px_1fr_76px] text-slate-500 text-[10px] px-2 py-1.5 bg-base-panel2/60 gap-1">
                <span>ID</span><span>FW</span><span>Control</span><span>Status</span>
              </div>
              <div className="divide-y divide-base-border">
                {controls.map((c) => (
                  <div key={c.id} className="grid grid-cols-[64px_56px_1fr_76px] items-start gap-1 px-2 py-2">
                    <span className="text-slate-500 text-[10.5px]">{c.id}</span>
                    <span className="text-slate-400 text-[10px]">{c.framework}</span>
                    <div className="min-w-0">
                      <p className="text-slate-200 text-[11.5px] truncate">{c.title}</p>
                      {c.resource && <p className="text-slate-500 text-[9.5px] truncate">Resource: {c.resource}{c.finding && c.finding !== '—' ? ` · finding ${c.finding}` : ''}</p>}
                      <div className="mt-1">
                        <ActionRow collection="controls" id={c.id} actions={controlActions(c)} onAction={onControl(c)} />
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusText status={c.status} />
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
