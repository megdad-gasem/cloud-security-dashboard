import React from 'react'
import { RefreshCw, ChevronDown } from 'lucide-react'

const ENVS = ['All', 'Production', 'Staging', 'Development']

/**
 * InfrastructurePageHeader — عنوان صفحة البنية التحتية + تحديث + آخر تحديث + فلتر البيئة
 */
export default function InfrastructurePageHeader({ refreshing, lastUpdated, onRefresh, environment, onEnvironment }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-white text-xl font-semibold">Infrastructure</h1>
        <p className="text-slate-500 text-[13px] mt-0.5">Visual overview of your cloud infrastructure and network topology.</p>
      </div>

      <div className="flex items-center gap-3">
        {/* زر التحديث + آخر تحديث */}
        <button
          onClick={onRefresh}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
          title="Refresh infrastructure"
        >
          <RefreshCw className={`w-4 h-4 text-white ${refreshing ? 'animate-spin' : ''}`} />
        </button>
        <span className="text-slate-500 text-[11.5px] hidden xl:block">
          Last updated: <span className="text-slate-300">{lastUpdated}</span>
        </span>

        {/* محدد البيئة */}
        <label className="relative flex items-center gap-1 bg-base-panel2 border border-base-border rounded-lg pl-2 pr-1 py-1.5">
          <span className="text-slate-500 text-[11px] uppercase tracking-wide">Env</span>
          <select
            value={environment}
            onChange={(e) => onEnvironment(e.target.value)}
            className="bg-transparent text-slate-300 text-[12.5px] focus:outline-none appearance-none pr-5 cursor-pointer"
          >
            {ENVS.map((e) => <option key={e} value={e} className="bg-base-panel text-slate-200">{e}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-1.5" />
        </label>
      </div>
    </div>
  )
}