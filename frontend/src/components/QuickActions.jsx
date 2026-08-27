import React from 'react'
import { ShieldAlert, Camera, Ban, FileText, RotateCw, Send } from 'lucide-react'
import { quickActions } from '../data/mockData'

const ICONS = { ShieldAlert, Camera, Ban, FileText, RotateCw, Send }

const COLOR_MAP = {
  red: 'bg-red-500/15 text-red-400',
  purple: 'bg-purple-500/15 text-purple-400',
  amber: 'bg-amber-500/15 text-amber-400',
  blue: 'bg-blue-500/15 text-blue-400',
  green: 'bg-green-500/15 text-green-400',
}

/**
 * QuickActions
 * كارت "Quick Actions" - شبكة 2×3 من الأزرار السريعة للتحكم في الموارد
 */
export default function QuickActions() {
  return (
    <div className="bg-base-panel border border-base-border rounded-xl p-4 flex flex-col h-full min-h-0">
      <h3 className="text-white text-[14px] font-semibold shrink-0">Quick Actions</h3>

      <div className="flex-1 min-h-0 mt-2 grid grid-cols-3 grid-rows-2 gap-2">
        {quickActions.map((action) => {
          const Icon = ICONS[action.icon]
          return (
            <button
              key={action.id}
              className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-base-panel2 border border-base-border hover:border-slate-600 transition-colors px-2"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${COLOR_MAP[action.color]}`}>
                <Icon className="w-4 h-4" strokeWidth={2} />
              </div>
              <span className="text-slate-300 text-[10.5px] text-center leading-tight">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
