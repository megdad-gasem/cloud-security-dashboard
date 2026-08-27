import React from 'react'
import { Menu, Search, Bell, HelpCircle, ChevronDown } from 'lucide-react'

/**
 * TopBar
 * الشريط العلوي: زر القائمة + مربع البحث + الإشعارات + المساعدة + كارد اليوزر
 */
export default function TopBar() {
  return (
    <header className="h-16 flex items-center justify-between gap-4 px-6 border-b border-base-border shrink-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button className="text-slate-400 hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>

        {/* مربع البحث */}
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for resources, alerts, findings..."
            className="w-full bg-base-panel2 border border-base-border rounded-lg pl-9 pr-3 py-2 text-[13px] text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            5
          </span>
        </button>

        <button className="text-slate-400 hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        <button className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-xs font-semibold">
            A
          </div>
          <span className="text-slate-200 text-[13px] font-medium hidden lg:block">Admin User</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden lg:block" />
        </button>
      </div>
    </header>
  )
}
