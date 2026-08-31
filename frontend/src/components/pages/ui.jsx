import React from 'react'
import { Search, Loader2 } from 'lucide-react'
// إعادة استخدام مكوّنات Aegis المشتركة عشان نحافظ على نفس لغة التصميم تماماً
export { Panel, PanelHeader, SeverityChip, StatusDot, Chip } from '../infrastructure/ui'
import { ACTION_TYPES } from '../../store/actionTypes'
import { securityCenter, useSecurityCenter } from '../../store/securityCenter'

// ----------------------------- PageHeader ---------------------------
export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between gap-4 shrink-0">
      <div>
        <h1 className="text-white text-xl font-semibold">{title}</h1>
        <p className="text-slate-500 text-[13px] mt-0.5">{subtitle}</p>
      </div>
      {right}
    </div>
  )
}

// ----------------------------- StatTile ------------------------------
export function StatTile({ icon: Icon, accent = 'bg-base-panel2 text-slate-300', title, value, sub }) {
  return (
    <div className="bg-base-panel border border-base-border rounded-xl p-3.5 min-w-0 flex items-center gap-3">
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
          <Icon className="w-5 h-5" strokeWidth={2.1} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-slate-400 text-[11px] truncate">{title}</p>
        <p className="text-white text-xl font-semibold leading-tight">{value}</p>
        {sub && <p className="text-slate-500 text-[10.5px] truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ----------------------------- SearchInput ---------------------------
export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-44 bg-base-panel2 border border-base-border rounded-md pl-7 pr-2 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
      />
    </div>
  )
}

// ----------------------------- DistributionBar -----------------------
export function DistributionBar({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  return (
    <div className="flex h-2 w-full rounded-full overflow-hidden bg-base-panel2">
      {segments.map((s, i) => (
        <div key={i} className={s.color} style={{ width: `${(s.value / total) * 100}%` }} title={`${s.label}: ${s.value}`} />
      ))}
    </div>
  )
}
// ----------------------------- StatusText ----------------------------
export function StatusText({ status }) {
  const map = {
    Open: 'text-amber-400', Investigating: 'text-blue-400', Containment: 'text-purple-400',
    Resolved: 'text-green-400', Passed: 'text-green-400', Failed: 'text-red-400',
    Warning: 'text-amber-400', Ready: 'text-green-400', Expired: 'text-slate-500',
    Enabled: 'text-green-400', Disabled: 'text-red-400', Active: 'text-green-400',
    Remediated: 'text-green-400', Accepted: 'text-slate-400', Exception: 'text-slate-400',
    Responded: 'text-blue-400', New: 'text-slate-300', Reviewed: 'text-green-400',
  }
  return <span className={map[status] || 'text-slate-300'}>{status}</span>
}

// ----------------------------- Toast ---------------------------------
/** توست عام يقرأ حالة المركز المشتركة مباشرة — يُعرض فوق كل الصفحات */
export function ToastHost() {
  useSecurityCenter()
  const t = securityCenter.toast
  if (!t) return null
  const tone = t.tone === 'warning' ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
    : t.tone === 'danger' ? 'border-red-500/40 bg-red-500/10 text-red-200'
    : 'border-green-500/40 bg-green-500/10 text-green-200'
  return (
    <div className="fixed bottom-5 right-5 z-50 pointer-events-none">
      <div className={`px-4 py-2.5 rounded-lg border text-[12px] font-medium shadow-lg backdrop-blur ${tone}`}>
        {t.message}
      </div>
    </div>
  )
}

// ----------------------------- Button --------------------------------
// بدائية زر موحّدة: hierarchy دلالي primary / secondary / danger / neutral / success
// (+ aliases contain / close متوافقة للخلف).
//
// اللون الأساسي (primary) هو أزرق Aegis — نفس عائلة الأزرق المستخدمة في
// Sidebar النشط وأزرار التحديث/الترقيم في باقي الصفحات. مش purple.
const HIER_CLASS = {
  primary: 'bg-blue-600 text-white border-blue-500/40 hover:bg-blue-500 py-2 px-4 rounded-md text-[12px] font-semibold',
  danger: 'bg-red-600/90 text-white border-red-500/40 hover:bg-red-600 py-2 px-4 rounded-md text-[12px] font-semibold',
  contain: 'bg-red-600/90 text-white border-red-500/40 hover:bg-red-600 py-2 px-4 rounded-md text-[12px] font-semibold',
  success: 'bg-emerald-700/90 text-white border-emerald-600/40 hover:bg-emerald-700 py-2 px-4 rounded-md text-[12px] font-semibold',
  close: 'bg-emerald-700/90 text-white border-emerald-600/40 hover:bg-emerald-700 py-2 px-4 rounded-md text-[12px] font-semibold',
  secondary: 'border-base-border bg-base-panel2 text-slate-300 hover:bg-base-panel hover:text-slate-100 py-2 px-4 rounded-md text-[12px]',
  neutral: 'border-base-border bg-transparent text-slate-400 hover:bg-base-panel2 hover:text-slate-200 py-2 px-4 rounded-md text-[12px]',
}

export function Button({ variant = 'neutral', loading = false, disabled = false, className = '', children, ...rest }) {
  const isDisabled = disabled || loading
  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium border transition-colors shrink-0 select-none
        ${HIER_CLASS[variant] || HIER_CLASS.neutral}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="w-3 h-3 animate-spin" />}
      {children}
    </button>
  )
}
// ----------------------------- ActionButton --------------------------
/** زر إجراء واحد — بيقرأ الـ label/intent/hierarchy من كتالوج ACTION_TYPES. */
export function ActionButton({ actionType, id, collection, onClick, disabled, variant, size = 'sm' }) {
  const def = ACTION_TYPES[actionType]
  if (!def) return null
  const v = variant || def.hier || 'neutral'
  const pad = size === 'sm' ? 'px-2.5' : 'px-3 py-1.5 text-[11.5px]'
  const pa = securityCenter._processingAction
  const isInflight = !!pa && !!id && pa.sid === `${id}::${actionType}`
  return (
    <Button
      variant={v}
      loading={isInflight}
      disabled={disabled}
      onClick={onClick}
      title={def.intent}
      className={size === 'sm' ? '' : pad}
    >
      {def.label}
    </Button>
  )
}

/** شريط إجراءات لعنصر — بيستقبل قائمة actionType و dispatch function. */
export function ActionRow({ actions, onAction, collection, id, className = '', variant }) {
  if (!actions || actions.length === 0) return null
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {actions.map((a) => (
        <ActionButton key={a} actionType={a} collection={collection} id={id} variant={variant} onClick={() => onAction(a)} />
      ))}
    </div>
  )
}
// ----------------------------- ConfirmHost ----------------------------
/** مودال تأكيد عام لأي إجراء (confirm: true في actionTypes). */
export function ConfirmHost() {
  useSecurityCenter()
  const c = securityCenter._confirm
  if (!c) return null
  const def = c.def
  const item = c.payload && c.payload.item
  const targetName = item
    ? (item.id || item.name || item.principal || item.resource || item.message || item.title || '')
    : ''
  const destructive = !!def.destructive
  const confirmVariant = destructive ? 'danger' : 'primary'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => securityCenter.confirmNo()}
    >
      <div
        className="w-[360px] rounded-xl border border-base-border bg-base-panel p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-white text-[13px] font-semibold">{def.label}</p>
        <p className="text-slate-400 text-[11.5px] mt-2 leading-relaxed">{def.intent}</p>

        {targetName && (
          <p className="text-slate-500 text-[11px] mt-2">
            Affected: <span className="text-slate-300">{targetName}</span>
          </p>
        )}

        <div className={`mt-2.5 flex items-center gap-1.5 text-[11px] ${destructive ? 'text-red-300' : 'text-slate-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${destructive ? 'bg-red-400' : 'bg-blue-400'}`} />
          {destructive
            ? 'Destructive action — changes the security state'
            : 'This action updates the security state'}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="neutral" onClick={() => securityCenter.confirmNo()}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={() => securityCenter.confirmYes()}>
            Confirm Action
          </Button>
        </div>
      </div>
    </div>
  )
}