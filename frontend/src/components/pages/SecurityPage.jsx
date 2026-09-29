import React, { useState } from 'react'
import { Filter } from 'lucide-react'
import { PageHeader, Panel, PanelHeader, SeverityChip, DistributionBar, ActionButton, Chip } from './ui'
import { securityCenter, useSecurityCenter, navigate } from '../../store/securityCenter'

const SEV_COLOR = { Critical: 'bg-red-500', High: 'bg-red-400', Medium: 'bg-amber-500', Low: 'bg-blue-500' }

// Detection -> Investigation -> Response -> Verification -> Resolved
// Context-appropriate actions per finding state. After remediation is applied,
// Verification is the required next stage before an item can be closed (Resolved).
function findingActions(f) {
  if (f.status === 'Resolved' || f.status === 'Accepted') return ['view_resource']
  if (f.status === 'Remediated') return ['verify', 'view_resource']
  if (f.status === 'Investigating') return ['remediate', 'verify', 'view_resource', 'accept_risk']
  // Open
  return ['remediate', 'investigate_finding', 'view_resource', 'accept_risk']
}

// Visual emphasis only — does not change membership, labels, or engine behavior.
function findingActionVariant(status, actionType) {
  if (status === 'Remediated') {
    return actionType === 'verify' ? 'primary' : 'neutral'
  }
  if (status === 'Investigating') {
    if (actionType === 'remediate') return 'primary'
    if (actionType === 'verify') return 'secondary'
    return 'neutral'
  }
  if (status === 'Resolved' || status === 'Accepted') return 'neutral'
  // Open
  if (actionType === 'remediate') return 'primary'
  if (actionType === 'investigate_finding') return 'secondary'
  return 'neutral'
}

// Status is a workflow state, NOT a severity — it must never compete with the
// severity badge. Open is muted/neutral; Investigating is a restrained blue;
// Remediated / Resolved are restrained success tones. (Kept local so the shared
// StatusText on other pages is untouched.)
function FindingStatus({ status }) {
  const map = {
    Open: 'text-slate-400',
    Investigating: 'text-blue-400',
    Remediated: 'text-green-400',
    Resolved: 'text-slate-400',
    Accepted: 'text-slate-500',
  }
  return <span className={`text-[11px] font-medium ${map[status] || 'text-slate-400'}`}>{status}</span>
}

// Severity tokens for the distribution legend (same palette as the findings list).
const SEV_LABEL = {
  Critical: 'text-red-400', High: 'text-red-400', Medium: 'text-amber-400', Low: 'text-blue-400',
}

export default function SecurityPage() {
  useSecurityCenter()
  const state = securityCenter.state
  const [sev, setSev] = useState('All')

  const findings = state.findings
  const distribution = [
    { label: 'Critical', value: findings.filter((f) => f.severity === 'Critical').length, color: SEV_COLOR.Critical },
    { label: 'High', value: findings.filter((f) => f.severity === 'High').length, color: SEV_COLOR.High },
    { label: 'Medium', value: findings.filter((f) => f.severity === 'Medium').length, color: SEV_COLOR.Medium },
    { label: 'Low', value: findings.filter((f) => f.severity === 'Low').length, color: SEV_COLOR.Low },
  ]
  const open = findings.filter((f) => f.status !== 'Resolved' && f.status !== 'Remediated' && f.status !== 'Accepted').length
  const critical = findings.filter((f) => f.severity === 'Critical').length
  const high = findings.filter((f) => f.severity === 'High').length
  const affected = new Set(findings.map((f) => f.resource)).size
  const risk = Math.round((critical * 10 + high * 5) / (findings.length || 1))

  const filtered = sev === 'All' ? findings : findings.filter((f) => f.severity === sev)
  const levels = ['All', 'Critical', 'High', 'Medium', 'Low']

  const onAction = (f) => (actionType) =>
    // requestAction handles confirmation (for destructive ops), duplicate
    // prevention during processing, the state transition, audit entry, and toast.
    securityCenter.requestAction({
      collection: 'findings',
      id: f.id,
      actionType,
      item: f,
      onNavigate: (to) => navigate(to),
    })

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
      <PageHeader
        title="Security"
        subtitle="Findings, risk distribution, and affected resources"
        right={<span className="text-slate-500 text-[11.5px] hidden xl:block">Last scan: <span className="text-slate-300">2m ago</span></span>}
      />

      {/* Risk posture rail — same existing posture values (open/critical/high/affected/risk) */}
      <div className="shrink-0 border border-base-border rounded-xl bg-base-panel px-3.5 py-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="text-slate-500 text-[10px] uppercase tracking-wider shrink-0">Risk posture</span>
        <div className="flex items-center gap-2">
          {/* Each severity is a shortcut into the existing severity filter (same setSev as the chips below) */}
          {distribution.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => setSev(d.label)}
              aria-pressed={sev === d.label}
              title={`Filter findings: ${d.label}`}
              className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold transition-colors cursor-pointer ${
                sev === d.label
                  ? 'bg-base-panel2 ring-1 ring-blue-500/40'
                  : 'hover:bg-base-panel2/60 hover:ring-1 hover:ring-blue-500/30 focus-visible:ring-1 focus-visible:ring-blue-500/40'
              } ${SEV_LABEL[d.label] || 'text-slate-400'}`}
            >
              <span className={`w-2 h-2 rounded-full ${d.color}`} />
              {d.label}
              <span className="text-white font-semibold">{d.value}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-400">
          <span>Open <span className="text-white font-semibold">{open}</span></span>
          <span className="text-slate-600">·</span>
          <span>Affected <span className="text-white font-semibold">{affected}</span></span>
          <span className="text-slate-600">·</span>
          <span>Risk <span className="text-white font-semibold">{risk}</span></span>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
        {/* Findings — actionable cards */}
        <Panel className="flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2 shrink-0">
            <PanelHeader title="Security Findings" subtitle={`${filtered.length} shown`} />
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              {levels.map((l) => (
                <Chip key={l} active={sev === l} onClick={() => setSev(l)}>{l}</Chip>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-3 pb-3 space-y-1.5">
            {filtered.map((f) => (
              <div key={f.id} className="px-2.5 py-2 rounded-lg border border-base-border bg-base-panel2/30">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px] shrink-0">{f.id}</span>
                  <SeverityChip severity={f.severity} />
                  <FindingStatus status={f.status} />
                  <span className="text-slate-500 text-[11px] truncate ml-auto">{f.source} · {f.detected}</span>
                </div>
                <p className="text-slate-100 text-[13px] font-medium mt-1 truncate">{f.title}</p>
                <p className="text-slate-500 text-[11.5px] truncate">Resource: <span className="text-slate-400">{f.resource}</span> - {f.resourceType}</p>
                <div className="mt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {findingActions(f).map((a) => (
                      <ActionButton
                        key={a}
                        actionType={a}
                        collection="findings"
                        id={f.id}
                        variant={findingActionVariant(f.status, a)}
                        onClick={() => onAction(f)(a)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Right column: distribution + activity */}
        <div className="min-h-0 flex flex-col gap-4">
          <Panel className="shrink-0 p-4">
            <PanelHeader title="Severity Distribution" subtitle="by findings" />
            <div className="mt-3">
              <DistributionBar segments={distribution} />
              <div className="flex items-center justify-between mt-2 text-[11px]">
                {distribution.map((d) => (
                  <span key={d.label} className={`flex items-center gap-1 ${SEV_LABEL[d.label] || 'text-slate-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${d.color}`} />{d.label} {d.value}
                  </span>
                ))}
              </div>
            </div>
          </Panel>

          <Panel className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <PanelHeader title="Response Activity" subtitle="live audit trail" />
            <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-3 pb-3 space-y-1.5">
              {state.audit.slice(0, 12).map((a) => (
                <div key={a.id} className="flex items-center gap-2.5 px-1.5 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-[11.5px] truncate"><span className="font-medium capitalize">{a.action.replace(/_/g, ' ')}</span> - {a.target}</p>
                    <p className="text-slate-500 text-[10.5px]">{a.detail}</p>
                  </div>
                  <span className="text-slate-400 text-[11px] shrink-0">{a.time}</span>
                </div>
              ))}
              {state.audit.length === 0 && (
                <p className="text-slate-400 text-[11px] px-1.5 py-2">No response actions taken yet — use the finding actions to respond.</p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
