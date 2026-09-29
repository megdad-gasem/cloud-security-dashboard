import React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { getInstances } from '../services/api'
import { subscribeRefresh } from '../utils/refreshBus'
// شريط تقدم صغير (CPU / Memory) بلون متغير حسب النسبة
// ملاحظة: CPU/Memory مش سمات محفوظة على الـ Instance ولا بترجع من /api/instances
// حالياً (الرد بيحتوي name/public_ip/status بس). دول مقاييس مراقبة حية مستقبلية
// (مثلاً CloudWatch). لما الـ API يرجّع أرقام حقيقية cpu/memory، الـ bar هيترسم
// تلقائياً. لحد ما يجهز، لو المقياس مش متاح (undefined/null) بنعرض شرطة محايدة
// بدل ما نرسم بار 0% مضلِّل.
function UsageBar({ value, active }) {
  const hasMetric = typeof value === 'number' && !Number.isNaN(value)

  // مقياس مش متاح بعد — نعرض شرطة محايدة (مش بار 0% مضلِّل، ومش رقم وهمي)
  if (!hasMetric) {
    return (
      <div className="flex items-center gap-2 w-24">
        <div className="flex-1 h-1.5 rounded-full bg-base-panel2 overflow-hidden" />
        <span className="text-slate-500 text-[11px] w-8 shrink-0">—</span>
      </div>
    )
  }

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
 * كارت جدول "EC2 Instances" - قائمة بالسيرفرات مع الحالة، استخدام الموارد
 *
 * منطق الحالات: تحميل / بيانات / فشل — الفشل لا يُعرض ابدا كجدول فارغ
 * بقيم صفر، بل كصف خطأ واضح مع زر Retry.
 */
export default function InstancesTable() {

  const [instances, setInstances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getInstances()
      setInstances(data)
      setError(null)
    } catch (err) {
      console.error('INSTANCES ERROR:', err)
      setError(err.message || 'Instances data unavailable')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // زر Refresh في DashboardHeader بيعيد الجلب من خلال حافلة التحديث
    const unsubscribe = subscribeRefresh(load)
    return unsubscribe
  }, [load])
  // نص التذييل — صادق دائما: عدد حقيقي، أو صفر حقيقي، أو شرطة عند الفشل
  const summary = error
    ? '---'
    : instances.length === 0
      ? 'No instances'
      : `Showing all ${instances.length} result${instances.length === 1 ? '' : 's'}`

  return (
    <div className="bg-base-panel border border-base-border rounded-xl p-4 flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-white text-[14px] font-semibold">EC2 Instances</h3>
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
            </tr>
          </thead>
          <tbody>
            {loading && !error && (
              <tr>
                <td colSpan={6} className="py-4 text-slate-500 text-[12px]">Loading instances...</td>
              </tr>
            )}

            {error && (
              <tr>
                <td colSpan={6} className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-[12px]">{error}</span>
                    <button onClick={load} className="text-blue-400 text-[12px] hover:underline">Retry</button>
                  </div>
                </td>
              </tr>
            )}

            {!loading && !error && instances.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-slate-500 text-[12px]">No instances found.</td>
              </tr>
            )}

            {!error && instances.map((inst) => {
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
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* التذييل — ملخص صادق فقط، بدون أزرار ترقيم شكلية */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-base-border shrink-0">
        <p className="text-slate-500 text-[11px]">{summary}</p>
      </div>
    </div>
  )
}
