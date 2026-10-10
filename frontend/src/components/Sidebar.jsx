import React from 'react'
import {
  LayoutDashboard, Server, Activity, Shield, Users, FileText,
  AlertCircle, ClipboardCheck, BarChart3, Settings, ChevronDown, CheckCircle2,
} from 'lucide-react'
import { navItems } from '../data/mockData'

// خريطة تربط اسم الأيقونة (نص) بالكومبوننت الفعلي من lucide-react
const ICONS = {
  LayoutDashboard, Server, Activity, Shield, Users, FileText,
  AlertCircle, ClipboardCheck, BarChart3, Settings,
}

/**
 * Sidebar
 * الشريط الجانبي الثابت: اللوقو + قائمة التنقل + بيئة العمل + حالة النظام + كارد اليوزر
 * props:
 *   - activeItem: id العنصر النشط حالياً
 *   - onSelect: دالة تُستدعى عند الضغط على عنصر تنقل
 */
export default function Sidebar({ activeItem = 'dashboard', onSelect = () => {} }) {
  return (
    <aside className="w-60 h-full flex flex-col bg-base-bg border-r border-base-border shrink-0">
      {/* اللوقو */}
      <div className="h-16 flex items-center px-5 border-b border-base-border shrink-0">
        <img
          src="/aegis-logo-dark.svg"
          alt="Aegis Cloud Security Center"
          className="aegis-brand-logo aegis-brand-logo-dark h-11 w-auto max-w-full object-contain"
        />
        <img
          src="/aegis-logo-light.svg"
          alt=""
          aria-hidden="true"
          className="aegis-brand-logo aegis-brand-logo-light h-11 w-auto max-w-full object-contain"
        />
      </div>

      {/* قائمة التنقل */}
      <nav className="flex-1 overflow-y-auto thin-scrollbar px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon]
          const isActive = item.id === activeItem
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* بيئة العمل + حالة النظام + كارد اليوزر */}
      <div className="px-3 py-3 border-t border-base-border space-y-2 shrink-0">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-base-panel2 border border-base-border text-left">
          <div className="leading-tight">
            <p className="text-slate-500 text-[11px]">Environment</p>
            <p className="text-slate-200 text-[12px] font-medium">Production</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
          <p className="text-green-400 text-[11px] font-medium">All systems operational</p>
        </div>

        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-xs font-semibold shrink-0">
            A
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-slate-200 text-[12px] font-medium truncate">Admin User</p>
            <p className="text-slate-500 text-[11px] truncate">admin@cloudsec.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
