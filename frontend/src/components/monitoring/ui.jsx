import React from 'react'
import { Server, Scale, Database, Anchor, Boxes, Folder, Activity } from 'lucide-react'

// ---------------------------------------------------------------------------
// مكوّنات مشتركة لصفحة الـ Monitoring — نفس لغة تصميم الـ Aegis (base-* + slate).
// ---------------------------------------------------------------------------

/** كارت موحّد */
export function MonPanel({ className = '', children }) {
  return (
    <div className={`bg-base-panel border border-base-border rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

/** عنوان كارت/قسم */
export function MonPanelHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2 shrink-0">
      <div className="min-w-0">
        <h3 className="text-white text-[14px] font-semibold truncate">{title}</h3>
        {subtitle && <p className="text-slate-500 text-[11px] mt-0.5 truncate">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

/** Chip صغير للفلاتر */
export function MonChip({ active = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors shrink-0 ${
        active
          ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
          : 'bg-base-panel2 text-slate-400 border-base-border hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

/** شارة مستوى الخطورة (نفس الـ Infrastructure) */
export function SeverityBadge({ severity }) {
  const map = {
    Critical: 'bg-red-500/15 text-red-400 border-red-500/30',
    High: 'bg-red-500/10 text-red-400 border-red-500/25',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Low: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  }
  const cls = map[severity] || map.Low
  return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${cls}`}>{severity}</span>
}

/** نقطة حالة ملونة */
export function StatusDot({ tone = 'green', className = '' }) {
  const map = { green: 'bg-green-400', amber: 'bg-amber-400', red: 'bg-red-500', slate: 'bg-slate-500', cyan: 'bg-cyan-400' }
  const dot = map[tone] || 'bg-slate-500'
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot} ${className}`} />
}

// ---------------------------------------------------------------------------
// Resource type icon mapping (موارد الـ Monitoring)
// ---------------------------------------------------------------------------
const TYPE_ICONS = {
  'EC2 Instance': Server,
  'Load Balancer': Scale,
  'RDS Database': Database,
  'NAT Gateway': Anchor,
  VPC: Boxes,
  'S3 Bucket': Folder,
}

export function ResourceTypeIcon({ type, className = 'w-4 h-4', tint = 'text-slate-400' }) {
  const Icon = TYPE_ICONS[type] || Activity
  return <Icon className={`${className} ${tint}`} strokeWidth={2} />
}

/** تنسيق حالة الـ tone اللي بييجي من البيانات (green/amber/red) لستايلات */
export const TONE_TEXT = { green: 'text-green-400', amber: 'text-amber-400', red: 'text-red-400', cyan: 'text-cyan-400', slate: 'text-slate-400' }
export const TONE_BG = { green: 'bg-green-500/10', amber: 'bg-amber-500/10', red: 'bg-red-500/10', cyan: 'bg-cyan-500/10', slate: 'bg-slate-500/10' }