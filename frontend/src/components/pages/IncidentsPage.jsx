import React, { useState } from 'react'
import { AlertCircle, ListFilter } from 'lucide-react'
import { PageHeader, Panel, PanelHeader, StatTile, SeverityChip, StatusText, ActionRow, ActionButton } from './ui'
import { securityCenter, useSecurityCenter } from '../../store/securityCenter'

// Severity is the incident's urgency (red/amber/blue). Status is the workflow
// stage and must NOT borrow severity colors. Open = neutral, Investigating =
// restrained blue, Containment = restrained amber, Resolved = restrained green.
function IncidentStatus({ status }) {
  const map = {
    Open: 'text-slate-400',
    Investigating: 'text-blue-400',
    Containment: 'text-amber-400',
    Resolved: 'text-green-400',
  }
  return <span className={`text-[11px] font-medium ${map[status] || 'text-slate-400'}`}>{status}</span>
}

// Timeline event kinds carry limited semantic color; most are neutral.
const KIND_DOT = {
  detection: 'bg-blue-400',
  investigation: 'bg-slate-400',
  response: 'bg-amber-400',
  containment: 'bg-amber-400',
  resolution: 'bg-green-400',
}
const KIND_LABEL = {
  detection: 'Detection', investigation: 'Investigation', response: 'Response',
  containment: 'Containment', resolution: 'Resolution',
}

// Contextual incident actions — derived strictly from the incident's live state
// so a Resolved incident can only be reopened, and a containment/response action
// disappears once it has been executed. Each flag (containable / accessRisk /
// publicExposed) represents a real attribute of the incident, not a generic
// "show everything" list — so Contain Resource, Revoke Access, and Disable Public
// Access appear only when the incident actually warrants them.
function incidentActions(inc) {
  if (inc.status === 'Resolved') return ['reopen_incident']
  if (inc.status === 'Open') return ['start_investigation'] // begin response first
  const a = []
  if (inc.containable && !inc.resourcesIsolated) a.push('isolate_resource')
  if (inc.accessRisk && !inc.accessRevoked) a.push('revoke_access')
  if (inc.publicExposed && !inc.publicAccessDisabled) a.push('disable_public_access')
  a.push('resolve_incident')
  return a
}

// Exactly one visually dominant "next recommended" action per active incident,
// following the IR priority: begin → contain → revoke access → remove public
// exposure → close. This is what the analyst should do next.
function recommendedAction(inc) {
  if (inc.status === 'Resolved') return 'reopen_incident'
  if (inc.status === 'Open') return 'start_investigation'
  if (inc.containable && !inc.resourcesIsolated) return 'isolate_resource'
  if (inc.accessRisk && !inc.accessRevoked) return 'revoke_access'
  if (inc.publicExposed && !inc.publicAccessDisabled) return 'disable_public_access'
  return 'resolve_incident'
}

export default function IncidentsPage() {
  useSecurityCenter()
  const state = securityCenter.state
  const [selectedId, setSelectedId] = useState(state.incidents[0]?.id || null)

  const incidents = state.incidents
  const selected = incidents.find((i) => i.id === selectedId) || incidents[0] || null

  const active = incidents.filter((i) => i.status !== 'Resolved').length
  const investigating = incidents.filter((i) => i.status === 'Investigating').length
  const containment = incidents.filter((i) => i.status === 'Containment').length
  const resolved = incidents.filter((i) => i.status === 'Resolved').length

  const onAction = (inc) => (actionType) =>
    securityCenter.requestAction({ collection: 'incidents', id: inc.id, actionType, item: inc })

  // Per-incident response activity (operational evidence) from the audit trail.
  const incidentActivity = selected
    ? state.audit.filter((a) => a.target === selected.id).slice(0, 8)
    : []

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
      <PageHeader title="Incidents" subtitle="Incident response and investigation workspace" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <StatTile icon={AlertCircle} accent="bg-slate-500/15 text-slate-300" title="Active" value={active} sub="not resolved" />
        <StatTile icon={AlertCircle} accent="bg-slate-500/15 text-slate-300" title="Investigating" value={investigating} sub="in progress" />
        <StatTile icon={AlertCircle} accent="bg-slate-500/15 text-slate-300" title="Containment" value={containment} sub="isolating" />
        <StatTile icon={AlertCircle} accent="bg-slate-500/15 text-slate-300" title="Resolved" value={resolved} sub="closed" />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4">
        {/* Incident list */}
        <Panel className="flex flex-col min-h-0 overflow-hidden">
          <PanelHeader title="Incidents" subtitle={`${incidents.length} total`} />
          <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-3 pb-3 space-y-1.5">
            {incidents.map((inc) => {
              const rec = recommendedAction(inc)
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedId(inc.id)}
                  className={`cursor-pointer flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg border transition-colors ${selectedId === inc.id ? 'bg-blue-600/15 border-blue-500/40' : 'border-base-border hover:bg-base-panel2/50'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${SEV_DOT[inc.severity] || 'bg-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-100 text-[12.5px] font-medium truncate">{inc.title}</p>
                    <p className="text-slate-500 text-[11px] truncate">{inc.id} · {inc.assignee} · {inc.updated}</p>
                  </div>
                  <div className="text-right shrink-0 mr-1">
                    <SeverityChip severity={inc.severity} />
                    <p className="mt-1"><IncidentStatus status={inc.status} /></p>
                  </div>
                  {/* one dominant recommended action per row */}
                  <ActionButton actionType={rec} collection="incidents" id={inc.id} onClick={() => onAction(inc)(rec)} />
                </div>
              )
            })}
          </div>
        </Panel>

        {/* Investigation workspace */}
        <Panel className="flex flex-col min-h-0 overflow-hidden">
          <PanelHeader title="Investigation" subtitle={selected ? `${selected.id} · ${selected.assignee}` : ''} />
          <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-4 py-3 space-y-3">
            {selected ? (
              <>
                {/* Severity + status (status never uses severity color) */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${SEV_BADGE[selected.severity] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'}`}>{selected.severity}</span>
                  <IncidentStatus status={selected.status} />
                </div>
                <p className="text-slate-100 text-[14px] font-semibold">{selected.title}</p>

                {/* Affected resources */}
                <div>
                  <p className="text-slate-500 text-[10.5px] mb-1.5 uppercase tracking-wide">Affected Resources</p>
                  <div className="space-y-1.5">
                    {selected.resourcesDetail.map((r) => (
                      <div key={r.name} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md border border-base-border bg-base-panel2/40">
                        <div className="min-w-0">
                          <p className="text-slate-200 text-[11.5px] font-medium truncate">{r.name}</p>
                          <p className="text-slate-500 text-[10.5px] truncate">{r.type}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-[10.5px] ${r.status.toLowerCase().includes('comprom') || r.status.toLowerCase().includes('expos') ? 'text-red-300' : 'text-slate-400'}`}>{r.status}</p>
                          <p className={`text-[10px] mt-0.5 ${r.contained ? 'text-green-400' : 'text-slate-500'}`}>{r.contained ? 'Isolated' : 'Not isolated'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response actions: one dominant recommended + secondary context */}
                <div>
                  <p className="text-slate-500 text-[10.5px] mb-1.5 uppercase tracking-wide">Response Actions</p>
                  {(() => {
                    const all = incidentActions(selected)
                    if (all.length === 0) return <p className="text-slate-500 text-[11px]">No further actions available.</p>
                    const rec = recommendedAction(selected)
                    const secondary = all.filter((a) => a !== rec)
                    return (
                      <>
                        <ActionRow collection="incidents" id={selected.id} actions={[rec]} onAction={onAction(selected)} />
                        {secondary.length > 0 && (
                          <div className="mt-1.5">
                            <ActionRow collection="incidents" id={selected.id} actions={secondary} variant="secondary" onAction={onAction(selected)} />
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>

                {/* Investigation timeline */}
                <div>
                  <p className="text-slate-500 text-[10.5px] mb-1.5 uppercase tracking-wide">Timeline</p>
                  <div className="space-y-2.5">
                    {selected.timeline.map((t, i) => (
                      <div key={i} className="flex gap-2.5">
                        <div className="flex flex-col items-center">
                          <span className={`w-2 h-2 rounded-full mt-1 ${KIND_DOT[t.kind] || 'bg-slate-400'}`} />
                          {i < selected.timeline.length - 1 && <span className="w-px flex-1 bg-base-border" />}
                        </div>
                        <div className="min-w-0 pb-1">
                          <p className="text-slate-300 text-[11.5px]">{t.text}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">{KIND_LABEL[t.kind] || 'Event'} · {t.by} · {t.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response activity — operational evidence for this incident */}
                <div>
                  <p className="text-slate-500 text-[10.5px] mb-1.5 uppercase tracking-wide">Response Activity</p>
                  {incidentActivity.length === 0 ? (
                    <p className="text-slate-500 text-[11px]">No response actions recorded yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {incidentActivity.map((a, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-base-border bg-base-panel2/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-[11.5px] truncate"><span className="font-medium capitalize">{a.action.replace(/_/g, ' ')}</span> · {a.detail}</p>
                            <p className="text-slate-500 text-[10.5px] truncate">actor: {a.actor} · {a.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-[11px] py-3">No incident selected.</p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}

const SEV_DOT = { Critical: 'bg-red-500', High: 'bg-red-400', Medium: 'bg-amber-500', Low: 'bg-blue-500' }
const SEV_BADGE = {
  Critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  High: 'bg-red-400/15 text-red-400 border-red-400/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
}
