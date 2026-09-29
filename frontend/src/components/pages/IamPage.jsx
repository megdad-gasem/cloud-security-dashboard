import React, { useMemo, useState } from 'react'
import { PageHeader, Panel, PanelHeader, StatusDot, StatusText, SearchInput, ActionRow, ActionButton, Chip } from './ui'
import { securityCenter, useSecurityCenter } from '../../store/securityCenter'

// Posture stamp: label + value chip for the IAM access-posture strip.
// No icons — the emphasis stays on the identity/access numbers themselves.
function PostureStamp({ label, value, tone = 'text-white' }) {
  return (
    <div className="shrink-0 bg-base-panel2 border border-base-border rounded-lg pl-2.5 pr-2 py-1.5 flex items-center gap-1.5">
      <span className="text-slate-500 text-[9.5px] uppercase tracking-wide">{label}</span>
      <span className={`text-[13px] font-semibold ${tone}`}>{value}</span>
    </div>
  )
}

// Maps an access-anomaly principal to the corresponding identity id so the
// anomaly actions and the identity card stay consistent.
function principalToId(principal) {
  if (principal === 'root') return 'u-root'
  if (principal === 'omar.sec') return 'u-omar'
  if (principal === 'svc-deploy') return 'u-deploy'
  if (principal === 'u-ana' || principal === 'ana.ops') return 'u-ana'
  return null
}

// Identities that are currently flagged by an access anomaly.
function anomalyIdentityIds(anomalies) {
  return new Set(anomalies.map((a) => principalToId(a.principal)).filter(Boolean))
}

// Contextual identity actions — driven by the identity's real state, not a
// fixed button set. The recommended next action should be obvious:
//   Review Access is the baseline for every identity; investigation appears
//   only when the identity is flagged by an anomaly; credential/session
//   responses appear only when a credential or live session actually exists.
function identityActions(i, flaggedIds) {
  const actions = ['review_permissions'] // baseline: review is always appropriate
  if (flaggedIds.has(i.id) && !i.investigating) actions.push('investigate_iam')
  if (i.activeSession && !i.sessionRevoked) actions.push('revoke_session')
  if (i.credential === 'access-key' && !i.accessKeyDisabled) actions.push('disable_access_key')
  return actions
}

// Contextual anomaly actions — only what the anomaly type supports. A console
// login implies a live session (Revoke Session); a service principal with an
// access key supports Suspend Access Key. Investigation is always offered.
function anomalyActions(a, identities) {
  const id = principalToId(a.principal)
  const ident = id ? identities.find((x) => x.id === id) : null
  const isService = ident && ident.credential === 'access-key'
  const impliesSession = /console|login|session/i.test(a.type)
  const actions = ['investigate_iam']
  if (impliesSession) actions.push('revoke_session')
  if (isService) actions.push('disable_access_key')
  return actions
}

// Which identities currently use a given role (for the Roles section).
function identitiesForRole(roles, identities) {
  const map = {}
  for (const r of roles) map[r.name] = identities.filter((i) => i.roles.includes(r.name)).map((i) => i.name)
  return map
}

export default function IamPage() {
  useSecurityCenter()
  const state = securityCenter.state
  const [q, setQ] = useState('')
  const [mfaOnly, setMfaOnly] = useState(false)

  const identities = state.identities
  const roles = state.roles
  const anomalies = state.anomalies

  const flaggedIds = useMemo(() => anomalyIdentityIds(anomalies), [anomalies])
  const roleUsers = useMemo(() => identitiesForRole(roles, identities), [roles, identities])

  const filtered = useMemo(
    () => identities.filter((i) => {
      const matchesQ = !q || i.name.toLowerCase().includes(q.toLowerCase()) || i.type.toLowerCase().includes(q.toLowerCase())
      const matchesMfa = !mfaOnly || i.mfa === 'Disabled'
      return matchesQ && matchesMfa
    }),
    [q, mfaOnly, identities]
  )

  const privileged = identities.filter((i) => i.privileged).length
  const anomaliesCount = anomalies.length
  const mfaOff = identities.filter((i) => i.mfa === 'Disabled').length
  const reviewed = identities.filter((i) => i.permissionsReviewed).length
  const sessionsRevoked = identities.filter((i) => i.sessionRevoked).length
  const rolesReviewed = roles.filter((r) => r.reviewed).length

  const onIdentity = (i) => (actionType) =>
    securityCenter.requestAction({ collection: 'identities', id: i.id, actionType, item: i })
  const onAnomaly = (a) => (actionType) =>
    securityCenter.requestAction({ collection: 'anomalies', id: a.id, actionType, item: a })
  const onRole = (r) => (actionType) =>
    securityCenter.requestAction({ collection: 'roles', id: r.id, actionType, item: r })

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
      <PageHeader title="IAM" subtitle="Identity, role, and access-anomaly security" />

      {/* Access posture stamps — same existing identity/role/permission numbers */}
      <div className="shrink-0 flex flex-wrap items-center gap-2">
        <PostureStamp label="Identities" value={identities.length} />
        <PostureStamp label="Roles" value={roles.length} />
        <PostureStamp label="Privileged" value={privileged} tone="text-red-400" />
        <PostureStamp label="Anomalies" value={anomaliesCount} tone="text-amber-400" />
        <PostureStamp label="MFA Off" value={mfaOff} tone="text-red-400" />
      </div>

      {mfaOnly && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-md bg-blue-600/10 border border-blue-500/30 shrink-0">
          <p className="text-[11px] text-blue-300">Showing only identities with MFA disabled ({filtered.length})</p>
          <button onClick={() => setMfaOnly(false)} className="text-[11px] text-slate-300 hover:text-white underline underline-offset-2">Clear filter</button>
        </div>
      )}

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr_1fr] gap-4">
        {/* Identities */}
        <Panel className="flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2 shrink-0">
            <PanelHeader title="Identities" subtitle={`${filtered.length} shown`} />
            <div className="flex items-center gap-2">
              <Chip active={mfaOnly} onClick={() => setMfaOnly((v) => !v)}>MFA Disabled</Chip>
              <SearchInput value={q} onChange={setQ} />
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-3 pb-3 space-y-1.5">
            {filtered.map((i) => (
              <div key={i.id} className="px-2.5 py-2 rounded-lg border border-base-border bg-base-panel2/30">
                <div className="flex items-center gap-2.5">
                  <StatusDot status={i.mfa === 'Enabled' ? 'active' : i.mfa === 'Disabled' ? 'critical' : 'stopped'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-[12px] font-medium truncate">{i.name}</p>
                    <p className="text-slate-500 text-[10px] truncate">{i.type} · {i.roles.join(', ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[10.5px] font-medium ${i.privileged ? 'text-red-400' : 'text-slate-300'}`}>{i.privileged ? 'Privileged' : 'Standard'}</p>
                    <p className="text-slate-500 text-[9.5px]">MFA {i.mfa}</p>
                  </div>
                </div>
                {/* state badges — reflect prior actions, no buttons */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {i.permissionsReviewed && <span className="text-[9.5px] text-green-400">reviewed</span>}
                  {i.accessKeyDisabled && <span className="text-[9.5px] text-red-300">access key suspended</span>}
                  {i.sessionRevoked && <span className="text-[9.5px] text-red-300">session revoked</span>}
                </div>
                <div className="mt-1.5">
                  <ActionRow collection="identities" id={i.id} actions={identityActions(i, flaggedIds)} onAction={onIdentity(i)} />
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-slate-500 text-[11px] px-1.5 py-3">No identities match this filter.</p>
            )}
          </div>
        </Panel>

        {/* Roles */}
        <Panel className="flex flex-col min-h-0 overflow-hidden">
          <PanelHeader title="Roles" subtitle={`${roles.length} roles · ${rolesReviewed} reviewed`} />
          <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-3 pb-3 space-y-1.5">
            {roles.map((r) => {
              const usedBy = roleUsers[r.name] || []
              const highRisk = r.risk === 'High'
              return (
                <div key={r.id} className="px-2.5 py-2 rounded-lg border border-base-border bg-base-panel2/30">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-slate-200 text-[12px] font-medium truncate">{r.name}</p>
                    <span className={`text-[10px] font-medium ${r.risk === 'High' ? 'text-red-400' : r.risk === 'Medium' ? 'text-amber-400' : 'text-green-400'}`}>{r.risk} risk</span>
                  </div>
                  <p className="text-slate-500 text-[10px] mt-0.5">
                    {r.permissions} permissions · used by {r.usedBy} {r.usedBy === 1 ? 'identity' : 'identities'}
                  </p>
                  {usedBy.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {usedBy.map((u) => (
                        <span key={u} className="text-[9.5px] text-slate-300 bg-base-panel border border-base-border rounded px-1.5 py-0.5 truncate max-w-full">{u}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-1.5">
                    {r.reviewed ? (
                      <span className="text-[9.5px] text-green-400">permissions reviewed</span>
                    ) : highRisk ? (
                      <ActionButton actionType="review_role" collection="roles" id={r.id} onClick={() => onRole(r)('review_role')} />
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        {/* Access anomalies */}
        <Panel className="flex flex-col min-h-0 overflow-hidden">
          <PanelHeader title="Access Anomalies" subtitle="response required" />
          <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-3 pb-3 space-y-1.5">
            {anomalies.map((a) => (
              <div key={a.id} className="px-2.5 py-2 rounded-lg border border-base-border bg-base-panel2/30">
                <div className="flex items-center justify-between">
                  <p className="text-slate-200 text-[11.5px] font-medium truncate">{a.principal}</p>
                  <span className={`text-[10px] font-semibold ${a.severity === 'Critical' ? 'text-red-400' : a.severity === 'High' ? 'text-red-400' : a.severity === 'Medium' ? 'text-amber-400' : 'text-blue-400'}`}>{a.severity}</span>
                </div>
                <p className="text-slate-400 text-[10px] mt-0.5">{a.type}</p>
                <p className="text-slate-500 text-[9.5px] mt-0.5">{a.detail}</p>
                <div className="flex items-center justify-between mt-1.5">
                  {a.status === 'Investigating' ? <StatusText status="Investigating" /> : <span className="text-slate-600 text-[9px]">{a.time}</span>}
                  {a.sessionRevoked && <span className="text-[9.5px] text-red-300">session revoked</span>}
                </div>
                <div className="mt-1.5">
                  <ActionRow collection="anomalies" id={a.id} actions={anomalyActions(a, identities)} onAction={onAnomaly(a)} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
