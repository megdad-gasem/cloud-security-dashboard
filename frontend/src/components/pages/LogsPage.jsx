import React, { useMemo, useState, useEffect } from 'react'
import { ScrollText, Search } from 'lucide-react'
import { PageHeader, Panel, PanelHeader, SearchInput, ActionRow, ActionButton, SeverityChip, StatusText, Chip } from './ui'
import { securityCenter, useSecurityCenter } from '../../store/securityCenter'

const SEV_DOT = { Critical: 'bg-red-500', High: 'bg-red-400', Medium: 'bg-amber-500', Low: 'bg-blue-500', Info: 'bg-slate-400' }
// Source is metadata, never severity-colored. All sources share one neutral style.
const SOURCES = ['All', 'GuardDuty', 'CloudTrail', 'Config', 'Inspector', 'WAF', 'VPC Flow']

// Contextual event actions — derived strictly from the event's real attributes.
// Inspect Event is always available (the baseline investigation action). View
// Resource only when the event has an identifiable resource. Promote to Incident
// only when the event is a meaningful security condition (incidentEligible) and
// not already promoted. Block Source only when the event carries a blockable
// source (e.g. an IP) and has not already been blocked.
function eventActions(l) {
  const s = new Set()
  s.add('investigate')
  if (l.resource) s.add('view_resource')
  if (l.incidentEligible && !l.incidentCreated) s.add('create_incident')
  if (l.blockableSource && !l.sourceBlocked) s.add('block_respond')
  return [...s]
}

// Exactly one visually dominant "next recommended" action per event, derived
// from context (not just severity): a blockable threat → Block Source; a
// High/Critical security condition → Promote to Incident; otherwise Inspect.
function recommendedEventAction(l) {
  if (l.blockableSource && !l.sourceBlocked) return 'block_respond'
  if ((l.severity === 'High' || l.severity === 'Critical') && l.incidentEligible && !l.incidentCreated) return 'create_incident'
  return 'investigate'
}

function Field({ label, value, mono }) {
  if (value === undefined || value === null || value === '' || value === '—') return null
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 border-b border-base-border/60 last:border-0">
      <span className="text-slate-500 text-[11px] shrink-0">{label}</span>
      <span className={`text-slate-200 text-[11.5px] text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

export default function LogsPage() {
  useSecurityCenter()
  const state = securityCenter.state
  const [q, setQ] = useState(() => securityCenter.uiGet('logs.q', ''))
  const [source, setSource] = useState(() => securityCenter.uiGet('logs.source', 'All'))
  const [selected, setSelected] = useState(() => securityCenter.uiGet('logs.selected', state.logs[0]?.id || null))

  // Persist investigation context (search / source / selected event) across page navigation
  useEffect(() => {
    securityCenter.uiSet('logs.q', q)
    securityCenter.uiSet('logs.source', source)
    securityCenter.uiSet('logs.selected', selected)
  }, [q, source, selected])

  const logs = state.logs
  const filtered = useMemo(
    () => logs.filter((l) =>
      (source === 'All' || l.source === source) &&
      (!q ||
        l.message.toLowerCase().includes(q.toLowerCase()) ||
        (l.id || '').toLowerCase().includes(q.toLowerCase()) ||
        l.source.toLowerCase().includes(q.toLowerCase()) ||
        (l.resource || '').toLowerCase().includes(q.toLowerCase()) ||
        (l.actor || '').toLowerCase().includes(q.toLowerCase()))
    ),
    [q, source, logs]
  )
  const selectedLog = logs.find((l) => l.id === selected) || null

  const onLog = (l) => (actionType) =>
    securityCenter.requestAction({ collection: 'logs', id: l.id, actionType, item: l })

  // Counters reflect actual executed state.
  const responded = logs.filter((l) => l.status === 'Responded').length
  const incidents = logs.filter((l) => l.incidentCreated).length

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
      <PageHeader title="Logs" subtitle="Security event investigation workspace" />

      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search events, IDs, sources, resources…" />
          <div className="flex items-center gap-1.5 overflow-x-auto thin-scrollbar">
            {SOURCES.map((s) => (
              <Chip key={s} active={source === s} onClick={() => setSource(s)}>{s}</Chip>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10.5px] text-slate-500 shrink-0">
          <span>Responded: <span className="text-slate-300">{responded}</span></span>
          <span>Incidents: <span className="text-slate-300">{incidents}</span></span>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
        {/* Event stream */}
        <Panel className="flex flex-col min-h-0 overflow-hidden">
          <PanelHeader title="Event Stream" subtitle={`${filtered.length} events`} />
          <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-3 py-2 space-y-1">
            {filtered.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelected(l.id)}
                className={`w-full text-left flex items-start gap-2.5 px-2 py-2 rounded-lg border transition-colors ${selected === l.id ? 'bg-blue-600/15 border-blue-500/40' : 'border-transparent hover:bg-base-panel2/60'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${SEV_DOT[l.severity] || 'bg-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-slate-100 text-[12.5px] font-medium truncate">{l.message}</p>
                    <span className="text-slate-600 text-[11px] shrink-0">{l.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-semibold border border-base-border bg-base-panel2 text-slate-300`}>{l.severity}</span>
                    <span className="text-slate-500 text-[11px] truncate">{l.source}</span>
                    <span className="text-slate-600 text-[11px] truncate">· {l.resource}</span>
                    {l.sourceBlocked && <span className="text-[9.5px] text-red-300">· blocked</span>}
                    {l.incidentCreated && <span className="text-[9.5px] text-blue-300">· incident</span>}
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-slate-500 text-[11px] px-2 py-3">No events match.</p>}
          </div>
        </Panel>

        {/* Event details / investigation */}
        <Panel className="flex flex-col min-h-0 overflow-hidden">
          <PanelHeader title="Event Details" subtitle="investigation" />
          <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-4 py-3 space-y-3">
            {selectedLog ? (
              <>
                <div>
                  <p className="text-slate-100 text-[13px] font-medium leading-snug">{selectedLog.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <SeverityChip severity={selectedLog.severity} />
                    <span className="text-slate-400 text-[11px]">{selectedLog.source}</span>
                    <span className="text-slate-600 text-[11px] ml-auto">{selectedLog.time}</span>
                  </div>
                </div>

                <Field label="Event ID" value={selectedLog.id} mono />
                <Field label="What happened" value={selectedLog.details} />

                <div>
                  <p className="text-slate-500 text-[10.5px] uppercase tracking-wide mb-1">Investigation Context</p>
                  <Field label="Actor" value={selectedLog.actor} />
                  <Field label="Source IP" value={selectedLog.sourceIp} mono />
                  <Field label="Region" value={selectedLog.region} />
                  <Field label="Operation" value={selectedLog.operation} mono />
                  <Field label="Result" value={selectedLog.result} />
                  <Field label="Resource" value={selectedLog.resource ? `${selectedLog.resource}${selectedLog.resourceType ? ` (${selectedLog.resourceType})` : ''}` : undefined} />
                  <Field label="Detection source" value={selectedLog.detectionSource} />
                </div>

                {/* Related finding / incident — subtle, not giant buttons */}
                {(selectedLog.relatedFinding || selectedLog.relatedIncident) && (
                  <div className="space-y-1">
                    {selectedLog.relatedFinding && (
                      <p className="text-[11px] text-slate-400">
                        Related Finding <span className="text-blue-300 font-mono">{selectedLog.relatedFinding}</span>
                      </p>
                    )}
                    {selectedLog.relatedIncident && (
                      <p className="text-[11px] text-slate-400">
                        Related Incident <span className="text-blue-300 font-mono">{selectedLog.relatedIncident}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Post-action state, shown in place of the action it replaces */}
                {selectedLog.incidentCreated && (
                  <div className="text-[11px] text-blue-300">Incident Created · <span className="font-mono">{selectedLog.incidentId}</span></div>
                )}
                {selectedLog.sourceBlocked && (
                  <div className="text-[11px] text-red-300">Source Blocked</div>
                )}

                {/* Actions: one dominant recommendation + secondary context */}
                <div className="pt-1">
                  {(() => {
                    const actions = eventActions(selectedLog)
                    if (actions.length === 0) {
                      return <p className="text-[11px] text-slate-500">No response action required for this event.</p>
                    }
                    const rec = recommendedEventAction(selectedLog)
                    const secondary = actions.filter((a) => a !== rec)
                    return (
                      <>
                        <ActionRow collection="logs" id={selectedLog.id} actions={[rec]} onAction={onLog(selectedLog)} />
                        {secondary.length > 0 && (
                          <div className="mt-1.5">
                            <ActionRow collection="logs" id={selectedLog.id} actions={secondary} variant="secondary" onAction={onLog(selectedLog)} />
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <ScrollText className="w-6 h-6 text-slate-500 mb-2" />
                <p className="text-slate-400 text-[12px]">Select an event to inspect</p>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}
