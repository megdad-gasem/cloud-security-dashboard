import React from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { complianceBreakdown, topFailedRules } from '../data/mockData'

const STATUS_COLOR = {
  Failed: 'text-red-400',
  Warning: 'text-amber-400',
}

/**
 * ComplianceOverview
 * كارت "Compliance Overview" - دونات چارت + Legend + قائمة أهم القواعد الفاشلة
 */
export default function ComplianceOverview() {
  const compliantPercent = complianceBreakdown[0].percent

  return (
    <div className="bg-base-panel border border-base-border rounded-xl p-4 flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-white text-[14px] font-semibold">Compliance Overview</h3>
        <button className="text-blue-400 text-[12px] hover:underline">View report</button>
      </div>

      {/* الدونات + الـ legend */}
      <div className="flex items-center gap-3 mt-1 shrink-0">
        <div className="relative w-24 h-24 shrink-0">
          <PieChart width={96} height={96}>
            <Pie
              data={complianceBreakdown}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={32}
              outerRadius={44}
              paddingAngle={2}
              stroke="none"
            >
              {complianceBreakdown.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-base font-bold leading-none">{compliantPercent}%</span>
            <span className="text-slate-500 text-[9px] mt-0.5">Compliant</span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          {complianceBreakdown.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-[11.5px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 truncate">{item.name}</span>
              </div>
              <span className="text-slate-400 shrink-0">{item.value}({item.percent}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* أهم القواعد الفاشلة */}
      <div className="mt-3 pt-3 border-t border-base-border flex-1 min-h-0 overflow-y-auto thin-scrollbar">
        <p className="text-slate-500 text-[11px] mb-1.5">Top Failed Rules</p>
        <div className="space-y-1.5">
          {topFailedRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between text-[11.5px] gap-2">
              <span className="text-slate-300 truncate">
                <span className="text-slate-600 mr-1">{rule.id}</span>
                {rule.name}
              </span>
              <span className={`shrink-0 font-medium ${STATUS_COLOR[rule.status]}`}>{rule.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
