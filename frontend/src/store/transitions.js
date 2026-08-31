// =====================================================================
// transitions.js
// دوال انتقال الحالة (pure-ish) لكل إجراء. كل دالة بتاخد `store` (عشان
// تعدّل نسخ من العناصر وتضيف آثار جانبية زي إنشاء حادثة أو تحديث نتيجة
// مربوطة) وبتُرجع { message } بيزر في الـ toast والـ audit.
//
// ملاحظة مهمة: دي محاكاة (simulation). لما يتوفر الـ backend، كل فرع هنا
// بيكابله نداء store.dispatch -> FastAPI -> AWS SDK، والحالة هنا بتعالج
// بعد تأكيد نجاح العملية الحقيقية.
// =====================================================================

import { ACTION_TYPES } from './actionTypes'

/** خريطة principal (زي root / omar.sec) -> id الهوية في collection identities */ 
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
      return { message: `${item.id} verified — marked resolved` }
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
      return { message: `Source ${item.sourceIp && item.sourceIp !== '—' ? item.sourceIp : item.source} blocked at perimeter` }
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
      if (item.finding && item.finding !== '—') {
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
      const type = meta?.type || 'Executive'
      store.addReport({
        id: `R-${++store._rep}`,
        name: `${type} — ${store.nowStr()}`,
        type,
        generated: store.nowStr(),
        format: 'PDF',
        size: '—',
        status: 'Ready',
      })
      return { message: `${type} report generated` }
    }
    if (actionType === 'download_report') {
      return { message: `Downloading ${item.name}` }
    }
    if (actionType === 'export_report') {
      return { message: `Exported ${item.name}` }
    }
  }

  return { message: `${ACTION_TYPES[actionType]?.label || actionType} completed` }
}