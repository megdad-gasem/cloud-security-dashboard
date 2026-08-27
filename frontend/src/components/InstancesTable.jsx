import React from 'react'
import { MoreVertical, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getInstances } from '../services/api'
// شريط تقدم صغير (CPU / Memory) بلون متغير حسب النسبة
function UsageBar({ value, active }) {
  const color = !active ? 'bg-slate-700' : value > 70 ? 'bg-red-500' : value > 40 ? 'bg-amber-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2 w-24">
      <div className="flex-1 h-1.5 rounded-full bg-base-panel2 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-slate-400 text-[11px] w-8 shrink-0">{value}%</span>
    </div>
  )
}

/**
 * InstancesTable
 * كارت جدول "EC2 Instances" - قائمة بالسيرفرات مع الحالة، استخدام الموارد، وأزرار إجراءات
 */
export default function InstancesTable() {

    const [instances, setInstances] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInstances()
      .then((data) => {
        setInstances(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('INSTANCES ERROR:', error)
        setLoading(false)
      })
  }, [])
  return (
    <div className="bg-base-panel border border-base-border rounded-xl p-4 flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-white text-[14px] font-semibold">EC2 Instances</h3>
        <button className="text-blue-400 text-[12px] hover:underline">View all</button>
      </div>

      <div className="flex-1 min-h-0 mt-2 overflow-y-auto thin-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-500 text-[11px]">
              <th className="font-medium pb-2 pr-2">Name</th>
              <th className="font-medium pb-2 pr-2">Instance ID</th>
              <th className="font-medium pb-2 pr-2">Status</th>
              <th className="font-medium pb-2 pr-2">CPU</th>
              <th className="font-medium pb-2 pr-2">Memory</th>
              <th className="font-medium pb-2 pr-2">Public IP</th>
              <th className="font-medium pb-2 pr-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {instances.map((inst) => {
              const isRunning = inst.status === 'Running'
              return (
                <tr key={inst.id} className="border-t border-base-border">
                  <td className="py-2.5 pr-2 text-slate-200 text-[12.5px] font-medium">{inst.name}</td>
                  <td className="py-2.5 pr-2 text-slate-500 text-[12px]">{inst.id}</td>
                  <td className="py-2.5 pr-2">
                    <span className={`inline-flex items-center gap-1.5 text-[12px] ${isRunning ? 'text-green-400' : 'text-red-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-400' : 'bg-red-400'}`} />
                      {inst.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-2"><UsageBar value={inst.cpu} active={isRunning} /></td>
                  <td className="py-2.5 pr-2"><UsageBar value={inst.memory} active={isRunning} /></td>
                  <td className="py-2.5 pr-2 text-slate-400 text-[12px]">{inst.public_ip}</td>
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-1.5">
                      <button className="text-[11.5px] px-2.5 py-1 rounded-md bg-base-panel2 border border-base-border text-slate-300 hover:text-white">
                        Details
                      </button>
                      <button className="text-slate-500 hover:text-slate-300">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* الترقيم (Pagination) */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-base-border shrink-0">
        <p className="text-slate-500 text-[11px]">Showing 1 to{instances.length} of {instances.length} results</p>
        <div className="flex items-center gap-1">
          <button className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-white">
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-600 text-white text-[11px] font-medium">
            1
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-white">
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
