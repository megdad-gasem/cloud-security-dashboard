import React from 'react'
import {
  Globe, Wifi, Anchor, Boxes, Route, Shield, Scale, Server, Database, Network,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// مكوّنات UI مشتركة صغيرة تحافظ على لغة التصميم المتّبعة في كامل الـ Aegis.
// ---------------------------------------------------------------------------

/** كارت (surface) موحّد — سطح أساسي (navy) أو سطح هادئ موحّد (muted) حسب الصفحة */
export function Panel({ className = '', children, surface = 'base' }) {
  const SURFACES = {
    base: 'bg-base-panel border-base-border',
    muted: 'bg-gray-900/80 border-gray-800/80',
  }
  return (
    <div className={`border rounded-xl ${SURFACES[surface] || SURFACES.base} ${className}`}>
      {children}
    </div>
  )
}

/** عنوان كارت/قسم */
export function PanelHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 pt-4 shrink-0">
      <div className="min-w-0">
        <h3 className="text-white text-[14px] font-semibold truncate">{title}</h3>
        {subtitle && <p className="text-slate-500 text-[11.5px] mt-0.5 truncate">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

/** شارة صغيرة (بلايز) — تستخدم للفلاتر والتسميات */
export function Chip({ active = false, onClick, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium border transition-colors shrink-0
        ${active
          ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
          : 'bg-base-panel2 text-slate-400 border-base-border hover:text-slate-200'}`}
    >
      {children}
    </button>
  )
}

/** شريحة مستوى الخطورة */
export function SeverityChip({ severity }) {
  const styles = {
    Critical: 'bg-red-500/15 text-red-400 border-red-500/30',
    High: 'bg-red-500/10 text-red-400 border-red-500/25',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Low: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  }
  const s = styles[severity] || styles.Low
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold border ${s}`}>
      {severity}
    </span>
  )
}

/** نقطة حالة ملونة */
export function StatusDot({ status, className = '' }) {
  const map = {
    healthy: 'bg-green-400',
    running: 'bg-green-400',
    active: 'bg-green-400',
    warning: 'bg-amber-400',
    safe: 'bg-green-400',
    critical: 'bg-red-500',
    stopped: 'bg-slate-500',
  }
  const dot = map[status] || 'bg-slate-500'
  return <span className={`inline-block w-2 h-2 rounded-full ${dot} ${className}`} />
}

/** حالة أمنية صغيرة (للأيقونات / لويس الشارت) */
export function SecurityTint({ status }) {
  const map = {
    safe: 'text-green-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
  }
  return <span className={map[status] || 'text-slate-500'}></span>
}

/** خريطة أيقونات حسب نوع المورد */
export const KIND_ICONS = {
  internet: Globe,
  igw: Wifi,
  nat: Anchor,
  vpc: Boxes,
  route: Route,
  sg: Shield,
  alb: Scale,
  subnet: Network,
  instance: Server,
  database: Database,
}

export function KindIcon({ kind, className = 'w-4 h-4' }) {
  const Icon = KIND_ICONS[kind] || Boxes
  return <Icon className={className} strokeWidth={2} />
}

/** خريطة لون تمييز حسب kind */
export const KIND_ACCENT = {
  internet: 'text-slate-300',
  igw: 'text-blue-400',
  nat: 'text-sky-400',
  vpc: 'text-purple-400',
  route: 'text-emerald-400',
  sg: 'text-orange-400',
  alb: 'text-cyan-400',
  subnet: 'text-lime-400',
  instance: 'text-green-400',
  database: 'text-fuchsia-400',
}

export function KindAccent({ kind, className = 'w-9 h-9' }) {
  const Icon = KIND_ICONS[kind] || Boxes
  return (
    <div className={`${className} rounded-lg bg-base-panel2 border border-base-border flex items-center justify-center shrink-0`}>
      <Icon className={`w-4.5 h-4.5 ${KIND_ACCENT[kind] || 'text-slate-400'}`} strokeWidth={2} />
    </div>
  )
}