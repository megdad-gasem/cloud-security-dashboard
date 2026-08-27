import React from 'react'
import { Calendar, RefreshCw, ChevronDown } from 'lucide-react'

/**
 * DashboardHeader
 * صف العنوان: "Dashboard" + الوصف من الشمال، وفلتر الوقت + زر التحديث من اليمين
 */
export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-white text-xl font-semibold">Dashboard</h1>
        <p className="text-slate-500 text-[13px] mt-0.5">Overview of your cloud security posture</p>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 bg-base-panel2 border border-base-border rounded-lg px-3 py-2 text-[13px] text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          Last 24 hours
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors">
          <RefreshCw className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}
