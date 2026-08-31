// =====================================================================
// securityCenter.js
// طبقة الحالة + محرّك الإجراءات المركزي لمركز أمن Aegis.
//
// التصميم (مستقبلاً):  Frontend → FastAPI → AWS SDK → actual remediation
// الحالي (محاكاة):     Frontend → securityCenter.requestAction() →
//                       (مودال تأكيد إن لزم) → dispatch() → تحديث حالة
//                       محلي + سجل تدقيق (audit) + تأخير محاكاة الإرسال.
//
// الفلسفة:
//  - مفيش أي منطق تنفيذ جوه الكومبوننتس؛ الكومبوننتس بتستدعي requestAction(...)
//    وبتعرض النتيجة. كل التنفيذ/تغيير الحالة معزول هنا.
//  - مفيش نداء AWS مباشر من React أبداً.
//  - مفيش عمليات AWS destructive حقيقية؛ المحاكاة بتظبط الحالة بس.
//
// ملاحظة الهجرة للـ backend: requestAction()/dispatch()/addX/addAudit() بتبقى
// زي ما هي؛ بس داخل dispatch() هنستبدل setTimeout بالـ await fetch('/api/actions')
// ونطبّق التغييرات فقط بعد نجاح الـ response.
// =====================================================================

import React from 'react'
import {
  securityFindings, securityActivity,
  identities, roles, accessAnomalies,
  logStream,
  incidents,
  frameworks, controls,
  reportTypes, reportHistory,
  settingsDefaults,
} from '../data/pagesData'
import { applyTransition } from './transitions'
import { ACTION_TYPES } from './actionTypes'

function deepClone(v) { return JSON.parse(JSON.stringify(v)) }

// Safety net: returns true when an action's effect is already applied to the
// object, so it can never be fired twice. Keyed by actionType; `item` is the
// live object (incident / identity / etc.).
const COMPLETED_GUARD = {
  isolate_resource: (i) => i.resourcesIsolated === true,
  revoke_access: (i) => i.accessRevoked === true,
  disable_public_access: (i) => i.publicAccessDisabled === true,
  resolve_incident: (i) => i.status === 'Resolved',
  start_investigation: (i) => i.status !== 'Open',
  reopen_incident: (i) => i.status !== 'Resolved',
  // Logs
  block_respond: (l) => l.sourceBlocked === true || l.status === 'Responded',
  create_incident: (l) => l.incidentCreated === true,
  investigate: (l) => l.status === 'Responded' && l.incidentCreated,
}

class SecurityCenterStore {
  constructor() {
    this.state = {
      findings: deepClone(securityFindings),
      identities: deepClone(identities),
      roles: deepClone(roles),
      anomalies: deepClone(accessAnomalies),
      logs: deepClone(logStream),
      incidents: deepClone(incidents),
      frameworks: deepClone(frameworks),
      controls: deepClone(controls),
      reports: deepClone(reportHistory),
      reportTypes: deepClone(reportTypes),
      settings: deepClone(settingsDefaults),
      audit: [],
    }
    this._inc = 1042
    this._rep = 80
    this._lastAuditId = 0
    this.processing = false
    this._processingAction = null
    this._confirm = null
    this.toast = null
    this._toastTimer = null
    this._subs = new Set()
    this._navHandler = null
  }

  /** Toast عام مرئي على كل الصفحات (مش محتاج React context) */
  showToast(message, tone = 'success') {
    if (this._toastTimer) clearTimeout(this._toastTimer)
    this.toast = { message, tone, id: Date.now() }
    this._emit()
    this._toastTimer = setTimeout(() => {
      this.toast = null
      this._emit()
    }, 2600)
  }

  // ---------- subscription ----------
  subscribe(fn) {
    this._subs.add(fn)
    return () => this._subs.delete(fn)
  }
  _emit() {
    for (const fn of this._subs) fn()
  }

  // ---------- snapshot for components ----------
  getState() { return this.state }

  /** تغيير مُتوقّع في الـ UI قبل ما الإجراء يخلص (عشان المستخدم يشوف فوراً) */
  getOptimistic(actionId) { return this._optimistic?.[actionId] || null }

  // ---------- helpers used by transitions ----------
  nowStr() {
    const d = new Date()
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  replace(collection, id, mutate) {
    const arr = this.state[collection]
    const idx = arr.findIndex((x) => x.id === id)
    if (idx === -1) return
    const copy = deepClone(arr[idx])
    mutate(copy)
    arr[idx] = copy
  }
  addIncident(inc) {
    this.state.incidents = [inc, ...this.state.incidents]
    this._inc += 1
  }
  addReport(rep) {
    this.state.reports = [rep, ...this.state.reports]
  }
  addAudit(entry) {
    this._lastAuditId += 1
    this.state.audit = [{ id: `aud-${this._lastAuditId}`, ...entry }, ...this.state.audit].slice(0, 200)
  }

  /** يعدّل إعداد في settings (توجلز/قيم) ويسجّل أثر تدقيق */
  setSetting(path, value) {
    const keys = path.split('.')
    let obj = this.state.settings
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
    const prev = obj[keys[keys.length - 1]]
    obj[keys[keys.length - 1]] = value
    this.addAudit({
      time: this.nowStr(),
      actor: 'aegis',
      action: 'update_setting',
      target: path,
      result: 'success',
      detail: `${prev} → ${value}`,
    })
    this._emit()
    this.showToast(`Setting updated: ${path}`, 'success')
  }

  // ---------- simulated engine ----------
  /**
   * نقطة الدخول الوحيدة للتنفيذ الفعلي للإجراءات.
   * تمنع التكرار أثناء المعالجة، تحاكي الإرسال للـ backend (تأخير)، بتطبّق
   * انتقال الحالة، وسجل تدقيق، وترجع { ok, message }.
   *
   * الاستخدام المستقبلي: بدل التأخير نعمل
   *   const res = await fetch(`${baseUrl}/api/actions`, { method:'POST', body: JSON.stringify({collection,id,actionType}) })
   *   ثم نطبّق transitions فقط لو res.ok.
   */
  dispatch({ collection, id, actionType, meta, item, onNavigate }) {
    if (this._processing) {
      return Promise.resolve({ ok: false, message: 'Action in progress — please wait.' })
    }
    this._processing = true
    this._processingAction = { collection, id, actionType, sid: id + '::' + actionType }
    this._emit() // يعكس الـ "processing" في الأزرار

    const type = actionType
    const target = item || this.state[collection]?.find((x) => x.id === id)

    // محاكاة الإرسال للـ backend (ثبات الحالة بعد التأكيد)
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = applyTransition(this, { collection, id, actionType: type, item: target, meta })
        this.addAudit({
          time: this.nowStr(),
          actor: 'aegis',
          action: type,
          target: target ? (target.id || target.name || target.principal || target.message || '—') : collection,
          result: 'success',
          detail: result.message,
        })
        this._processing = false
        this._processingAction = null
        this._emit()
        this.showToast(result.message, 'success')
        // التنقّل: من meta أو من كتالوج actionTypes
        const nav = (meta && meta.navigate) || ACTION_TYPES[actionType]?.navigate
        if (onNavigate && nav) onNavigate(nav)
        resolve({ ok: true, message: result.message })
      }, 650)
    })
  }

  /**
   * نقطة الدخول الآمنة للإجراءات (اللي الكومبوننتس بتستدعيها).
   * لو الإجراء محتاج تأكيد (confirm: true في actionTypes) بتبدأ مودال تأكيد
   * عام؛ لو اتأكد يستدعي dispatch(). غير كده بتستدعي dispatch مباشرة.
   * ده بيمنع أي عمليات destructive (حتى لو محاكاة) من غير قصد.
   */
  requestAction(payload) {
    if (this._processing) { this.showToast('Action in progress — please wait.', 'warning'); return }
    if (this._confirm) return // مودال تأكيد مفتوح أصلاً
    const def = ACTION_TYPES[payload.actionType]
    // Prevent re-executing an action whose effect is already applied to the
    // object (e.g. Contain Resource after the resource is already isolated).
    // The page only offers valid actions, but this is a safety net so a
    // completed response can never be fired twice.
    const item = payload.item || this.state[payload.collection]?.find((x) => x.id === payload.id)
    if (item && COMPLETED_GUARD[payload.actionType] && COMPLETED_GUARD[payload.actionType](item)) {
      this.showToast('Already applied — no change.', 'warning')
      return
    }
    if (def && def.confirm) {
      this._confirm = { payload, def }
      this._emit()
      return
    }
    return this.dispatch(payload)
  }

  confirmYes() {
    const p = this._confirm && this._confirm.payload
    this._confirm = null
    this._emit()
    if (p) this.dispatch(p)
  }

  confirmNo() {
    this._confirm = null
    this._emit()
  }
}

// singleton مشترك بين كل الصفحات
export const securityCenter = new SecurityCenterStore()

// ---------- React bindings ----------
export function useSecurityCenter() {
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => securityCenter.subscribe(force), [])
  return securityCenter
}

/** خطاف للتنقّل بين الصفحات (يضبطه App) */
export function setupNavigation(handler) {
  securityCenter._navHandler = handler
}
export function navigate(to) {
  if (securityCenter._navHandler) securityCenter._navHandler(to)
}
