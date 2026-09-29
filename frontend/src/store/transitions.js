// =====================================================================
// transitions.js
// ط¯ظˆط§ظ„ ط§ظ†طھظ‚ط§ظ„ ط§ظ„ط­ط§ظ„ط© (pure-ish) ظ„ظƒظ„ ط¥ط¬ط±ط§ط،. ظƒظ„ ط¯ط§ظ„ط© ط¨طھط§ط®ط¯ `store` (ط¹ط´ط§ظ†
// طھط¹ط¯ظ‘ظ„ ظ†ط³ط® ظ…ظ† ط§ظ„ط¹ظ†ط§طµط± ظˆطھط¶ظٹظپ ط¢ط«ط§ط± ط¬ط§ظ†ط¨ظٹط© ط²ظٹ ط¥ظ†ط´ط§ط، ط­ط§ط¯ط«ط© ط£ظˆ طھط­ط¯ظٹط« ظ†طھظٹط¬ط©
// ظ…ط±ط¨ظˆط·ط©) ظˆط¨طھظڈط±ط¬ط¹ { message } ط¨ظٹط²ط± ظپظٹ ط§ظ„ظ€ toast ظˆط§ظ„ظ€ audit.
//
// ظ…ظ„ط§ط­ط¸ط© ظ…ظ‡ظ…ط©: ط¯ظٹ ظ…ط­ط§ظƒط§ط© (simulation). ظ„ظ…ط§ ظٹطھظˆظپط± ط§ظ„ظ€ backendطŒ ظƒظ„ ظپط±ط¹ ظ‡ظ†ط§
// ط¨ظٹظƒط§ط¨ظ„ظ‡ ظ†ط¯ط§ط، store.dispatch -> FastAPI -> AWS SDKطŒ ظˆط§ظ„ط­ط§ظ„ط© ظ‡ظ†ط§ ط¨طھط¹ط§ظ„ط¬
// ط¨ط¹ط¯ طھط£ظƒظٹط¯ ظ†ط¬ط§ط­ ط§ظ„ط¹ظ…ظ„ظٹط© ط§ظ„ط­ظ‚ظٹظ‚ظٹط©.
// =====================================================================

import { ACTION_TYPES } from './actionTypes'

// Generated report entries store the same short display label used by the mock
// Report History (e.g. 'Executive'), while the name keeps the full report-type
// title (e.g. 'Executive Summary'). Both derive from the same report-type name.
const REPORT_TYPE_LABEL = {
  'Executive Summary': 'Executive',
  'Compliance Report': 'Compliance',
  'Incident Report': 'Incident',
  'Vulnerability Report': 'Vulnerability',
}

/** ط®ط±ظٹط·ط© principal (ط²ظٹ root / omar.sec) -> id ط§ظ„ظ‡ظˆظٹط© ظپظٹ collection identities */ 
function principalToId(principal) {
  if (principal === 'root') return 'u-root'
  if (principal === 'omar.sec') return 'u-omar'
  if (principal === 'svc-deploy') return 'u-deploy'
  if (principal === 'u-ana' || principal === 'ana.ops') return 'u-ana'
  return null
}

export function applyTransition(store, { collection, id, actionType, item, meta }) {
  const now = store.nowStr()
  const by = 'aegis'

  // ---- Security findings ----
  if (collection === 'findings') {
    if (actionType === 'remediate') {
      store.replace('findings', id, (f) => { f.status = 'Remediated' })
      return { message: `${item.title}: remediation applied, marked resolved` }
    }
    if (actionType === 'investigate_finding') {
      store.replace('findings', id, (f) => { if (f.status === 'Open') f.status = 'Investigating' })
      return { message: `Investigation started for ${item.id}` }
    }
    if (actionType === 'accept_risk') {
      store.replace('findings', id, (f) => { f.status = 'Accepted' })
      return { message: `Risk accepted for ${item.id}` }
    }
    if (actionType === 'verify') {
      store.replace('findings', id, (f) => { if (f.status === 'Remediated') f.status = 'Resolved' })
      return { message: `${item.id} verified - marked resolved` }
    }
    if (actionType === 'view_resource') {
      return { message: `Opening ${item.resource} in Infrastructure` }
    }
  }

  // ---- IAM ----
  if (collection === 'identities') {
    if (actionType === 'review_permissions') {
      store.replace('identities', id, (i) => { i.permissionsReviewed = true })
      return { message: `Permissions reviewed for ${item.name}` }
    }
    if (actionType === 'disable_access_key') {
      store.replace('identities', id, (i) => { i.accessKeyDisabled = true })
      return { message: `Access key disabled for ${item.name}` }
    }
    if (actionType === 'revoke_session') {
      store.replace('identities', id, (i) => { i.sessionRevoked = true })
      return { message: `Sessions revoked for ${item.name}` }
    }
    if (actionType === 'investigate_iam') {
      store.replace('identities', id, (i) => { i.investigating = true })
      return { message: `Investigation opened for ${item.name}` }
    }
  }
  if (collection === 'anomalies') {
    if (actionType === 'investigate_iam') {
      store.replace('anomalies', id, (a) => { a.status = 'Investigating' })
      return { message: `Investigation opened for ${item.principal}` }
    }
    if (actionType === 'revoke_session') {
      const pid = principalToId(item.principal)
      if (pid) store.replace('identities', pid, (i) => { i.sessionRevoked = true })
      store.replace('anomalies', id, (a) => { a.sessionRevoked = true })
      return { message: `Sessions revoked for ${item.principal}` }
    }
    if (actionType === 'disable_access_key') {
      const pid = principalToId(item.principal)
      if (pid && pid !== 'u-root') store.replace('identities', pid, (i) => { i.accessKeyDisabled = true })
      return { message: `Access key disabled for ${item.principal}` }
    }
    if (actionType === 'view_resource') {
      return { message: `Locating ${item.principal}` }
    }
  }

  // ---- Roles ----
  if (collection === 'roles') {
    if (actionType === 'review_role') {
      store.replace('roles', id, (r) => { r.reviewed = true })
      return { message: `Permissions reviewed for ${item.name}` }
    }
  }

  // ---- Logs ----
  if (collection === 'logs') {
    if (actionType === 'investigate') {
      return { message: `Investigation opened for ${item.id}` }
    }
    if (actionType === 'create_incident') {
      store.replace('logs', id, (l) => { l.incidentCreated = true; l.status = 'Responded' })
      const incId = `INC-${++store._inc}`
      const severity = item.severity === 'Info' ? 'Low' : item.severity
      store.replace('logs', id, (l) => { l.incidentId = incId })
      store.addIncident({
        id: incId,
        title: item.message,
        severity,
        status: 'Open',
        assignee: 'unassigned',
        updated: 'just now',
        resources: item.resource ? [item.resource] : [],
        resourcesIsolated: false,
        accessRevoked: false,
        publicAccessDisabled: false,
        timeline: [{ time: now, by, text: `Incident created from ${item.id}: ${item.message}` }],
      })
      return { message: `Incident ${incId} created from ${item.id}` }
    }
    if (actionType === 'view_resource') {
      return { message: `Opening ${item.resource} in Infrastructure` }
    }
    if (actionType === 'block_respond') {
      store.replace('logs', id, (l) => { l.sourceBlocked = true; l.status = 'Responded' })
      return { message: `Source ${item.sourceIp && item.sourceIp !== '-' ? item.sourceIp : item.source} blocked at perimeter` }
    }
  }

  // ---- Incidents ----
  if (collection === 'incidents') {
    if (actionType === 'start_investigation') {
      store.replace('incidents', id, (inc) => {
        inc.status = 'Investigating'
        inc.timeline = [...inc.timeline, { time: now, by, text: 'Investigation started' }]
      })
      return { message: `Investigation started for ${item.id}` }
    }
    if (actionType === 'isolate_resource') {
      store.replace('incidents', id, (inc) => {
        inc.resourcesIsolated = true
        inc.timeline = [...inc.timeline, { time: now, by, text: `Resource(s) isolated: ${inc.resources.join(', ')}` }]
      })
      return { message: `Resource(s) isolated for ${item.id}` }
    }
    if (actionType === 'revoke_access') {
      store.replace('incidents', id, (inc) => {
        inc.accessRevoked = true
        inc.timeline = [...inc.timeline, { time: now, by, text: 'Access revoked' }]
      })
      return { message: `Access revoked for ${item.id}` }
    }
    if (actionType === 'disable_public_access') {
      store.replace('incidents', id, (inc) => {
        inc.publicAccessDisabled = true
        inc.timeline = [...inc.timeline, { time: now, by, text: 'Public access disabled' }]
      })
      return { message: `Public access disabled for ${item.id}` }
    }
    if (actionType === 'resolve_incident') {
      store.replace('incidents', id, (inc) => {
        inc.status = 'Resolved'
        inc.timeline = [...inc.timeline, { time: now, by, text: 'Incident resolved' }]
      })
      return { message: `Incident ${item.id} resolved` }
    }
    if (actionType === 'reopen_incident') {
      store.replace('incidents', id, (inc) => {
        inc.status = 'Investigating'
        // Resume the response: containment/access/public-exposure states are
        // reset so the reopened incident re-surfaces the appropriate actions.
        inc.resourcesIsolated = false
        inc.accessRevoked = false
        inc.publicAccessDisabled = false
        inc.timeline = [...inc.timeline, { time: now, by, text: 'Incident reopened' }]
      })
      return { message: `Incident ${item.id} reopened` }
    }
  }

  // ---- Compliance ----
  if (collection === 'controls') {
    if (actionType === 'remediate_control') {
      store.replace('controls', id, (c) => { c.status = 'Passed' })
      if (item.finding && item.finding !== 'â€”') {
        store.replace('findings', item.finding, (f) => { f.status = 'Resolved' })
      }
      return { message: `Control ${item.id} remediated` }
    }
    if (actionType === 'accept_exception') {
      store.replace('controls', id, (c) => { c.status = 'Exception' })
      return { message: `Exception recorded for ${item.id}` }
    }
    if (actionType === 'view_resource') {
      return { message: `Locating ${item.resource || item.finding} in Infrastructure` }
    }
    if (actionType === 'view_finding') {
      return { message: `Opening finding ${item.finding}` }
    }
  }

  // ---- Reports ----
  if (collection === 'reports') {
    if (actionType === 'generate_report') {
      // `label` is the full report-type title (e.g. 'Executive Summary'); the
      // stored `type` is normalized to the short label the mock Report History
      // uses (e.g. 'Executive') so generated rows match the existing rows.
      const label = meta?.type || 'Executive'
      const type = REPORT_TYPE_LABEL[label] || label
      const nowDate = new Date()
      const month = nowDate.toLocaleString('en-US', { month: 'short' })
      // Same display convention as mock history rows: 'Aug 25, 09:00'
      const generated = nowDate.toLocaleString('en-US', {
        month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
      })
      store.addReport({
        id: `R-${++store._rep}`,
        name: `${label} - ${month}`,
        type,
        generated,
        format: 'PDF',
        size: '2.4 MB',
        status: 'Ready',
      })
      return { message: `${label} report generated` }
    }
    if (actionType === 'download_report') {
      return { message: `Downloading ${item.name}` }
    }
    if (actionType === 'export_report') {
      return { message: `Exported ${item.name}` }
    }
  }


  // ---- Dashboard Quick Actions ----
  // Honest simulation: nothing is executed yet until the backend is wired.
  // outcome 'not_executed' => audit records requested-but-not-executed (no state
  // change), never a successful execution.
  if (collection === 'quickActions') {
    const label = ACTION_TYPES[actionType]?.label || actionType
    const targetInfo = item && item.targetLabel
      ? ` on ${item.targetLabel}${item.targetId && item.targetId !== item.targetLabel ? ` (${item.targetId})` : ''}`
      : ''
    return {
      message: `${label} requested${targetInfo} — execution is not yet available; no changes were made.`,
      outcome: 'not_executed',
      // Expose target for audit recording
      target: item && item.targetLabel
        ? `${item.targetLabel}${item.targetId && item.targetId !== item.targetLabel ? ` (${item.targetId})` : ''}`
        : undefined,
    }
  }  return { message: `${ACTION_TYPES[actionType]?.label || actionType} completed` }
}
