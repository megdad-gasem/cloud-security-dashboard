import React, { useEffect, useState, useCallback } from 'react'
import { Server, AlertTriangle, Bell, ShieldCheck } from 'lucide-react'
import StatCard from './StatCard'
import RadialPercent from './RadialPercent'
import { getInstances, getSecurityEvents, getAlerts } from '../services/api'
import { subscribeRefresh } from '../utils/refreshBus'

// sparkline بسيط لكل كارت (شكل تقريبي فقط)
const ec2Spark = [3, 5, 4, 6, 5, 7, 6, 8, 7, 9]
const threatsSpark = [1, 2, 1, 3, 2, 4, 3, 5, 4, 6]
const alertsSpark = [2, 3, 2, 4, 3, 5, 4, 6, 5, 7]

// نص خطأ مشترك مع زر إعادة المحاولة للكروت المرتبطة بالـ API
function ErrorHint({ text, onRetry }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]">
      <span className="text-amber-400">{text}</span>
      <button onClick={onRetry} className="text-blue-400 hover:underline">Retry</button>
    </span>
  )
}

/**
 * StatsRow
 * الصف العلوي المكوّن من 4 كروت: EC2 Instances / Threats Detected / Active Alerts / Compliance Score
 *
 * منطق الحالات: تحميل / قيمة / فشل في الجلب — الفشل لا يُعرض ابدا كقيمة 0.
 */
export default function StatsRow() {
  const [instances, setInstances] = useState([])
  const [securityEvents, setSecurityEvents] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({ instances: null, events: null, alerts: null })

  // جلب مستقل لكل مصدر — المصدر الفاشل لا يؤثر على الباقي
  const loadAll = useCallback(async () => {
    setLoading(true)
    const [instRes, eventsRes, alertsRes] = await Promise.allSettled([
      getInstances(),
      getSecurityEvents(),
      getAlerts(),
    ])

    if (instRes.status === 'fulfilled') {
      setInstances(instRes.value)
      setErrors((e) => ({ ...e, instances: null }))
    } else {
      console.error('STATS INSTANCES ERROR:', instRes.reason)
      setErrors((e) => ({ ...e, instances: 'Unavailable' }))
    }

    if (eventsRes.status === 'fulfilled') {
      setSecurityEvents(eventsRes.value)
      setErrors((e) => ({ ...e, events: null }))
    } else {
      console.error('STATS SECURITY EVENTS ERROR:', eventsRes.reason)
      setErrors((e) => ({ ...e, events: 'Unavailable' }))
    }

    if (alertsRes.status === 'fulfilled') {
      setAlerts(alertsRes.value)
      setErrors((e) => ({ ...e, alerts: null }))
    } else {
      console.error('STATS ALERTS ERROR:', alertsRes.reason)
      setErrors((e) => ({ ...e, alerts: 'Unavailable' }))
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()
    // زر Refresh في DashboardHeader بيعيد الجلب من خلال حافلة التحديث
    const unsubscribe = subscribeRefresh(loadAll)
    return unsubscribe
  }, [loadAll])
  const totalInstances = instances.length

  const runningInstances = instances.filter(
    (instance) => instance.status === 'Running'
  ).length

  const stoppedInstances = instances.filter(
    (instance) => instance.status === 'Stopped'
  ).length

  const threatsDetected = securityEvents.filter(
    (event) =>
      event.severity === 'High' ||
      event.severity === 'Critical'
  ).length

  const activeAlerts = alerts.filter(
    (alert) => alert.status === 'Active'
  ).length

  const highAlerts = alerts.filter(
    (alert) => alert.status === 'Active' && alert.severity === 'High'
  ).length

  const mediumAlerts = alerts.filter(
    (alert) => alert.status === 'Active' && alert.severity === 'Medium'
  ).length

  return (
    <div className="grid grid-cols-4 gap-4 shrink-0">
      <StatCard
        icon={Server}
        color="green"
        title="EC2 Instances"
        value={errors.instances ? '---' : loading ? '...' : totalInstances}
        sparklineData={ec2Spark}
        subtitle={
          errors.instances ? (
            <ErrorHint text={errors.instances} onRetry={loadAll} />
          ) : loading ? (
            <span className="text-slate-500">Loading...</span>
          ) : (
            <span>
              <span className="text-green-400">{runningInstances} Running</span>
              <span className="text-slate-500"> - {stoppedInstances} Stopped</span>
            </span>
          )
        }
      />

      <StatCard
        icon={AlertTriangle}
        color="red"
        title="Threats Detected"
        value={errors.events ? '---' : loading ? '...' : threatsDetected}
        sparklineData={threatsSpark}
        subtitle={
          errors.events ? (
            <ErrorHint text={errors.events} onRetry={loadAll} />
          ) : loading ? (
            <span className="text-slate-500">Loading...</span>
          ) : (
            <span className="text-red-400">High Severity</span>
          )
        }
      />

      <StatCard
        icon={Bell}
        color="amber"
        title="Active Alerts"
        value={errors.alerts ? '---' : loading ? '...' : activeAlerts}
        sparklineData={alertsSpark}
        subtitle={
          errors.alerts ? (
            <ErrorHint text={errors.alerts} onRetry={loadAll} />
          ) : loading ? (
            <span className="text-slate-500">Loading...</span>
          ) : (
            <span>
              <span className="text-amber-400">{highAlerts} High</span>
              <span className="text-slate-500"> - {mediumAlerts} Medium</span>
            </span>
          )
        }
      />

      <StatCard
        icon={ShieldCheck}
        color="purple"
        title="Compliance Score"
        value="92%"
        subtitle={<span className="text-green-400">Up 8% from yesterday</span>}
        rightSlot={<RadialPercent percent={92} color="#A855F7" size={56} />}
      />
    </div>
  )
}
