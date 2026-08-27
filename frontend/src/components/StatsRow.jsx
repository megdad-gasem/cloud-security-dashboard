import React from 'react'
import { Server, AlertTriangle, Bell, ShieldCheck } from 'lucide-react'
import StatCard from './StatCard'
import RadialPercent from './RadialPercent'
import { useEffect, useState } from 'react'
import { getInstances, getSecurityEvents, getAlerts  } from '../services/api'

// بيانات sparkline بسيطة لكل كارت (شكل تقريبي فقط)
const ec2Spark = [3, 5, 4, 6, 5, 7, 6, 8, 7, 9]
const threatsSpark = [1, 2, 1, 3, 2, 4, 3, 5, 4, 6]
const alertsSpark = [2, 3, 2, 4, 3, 5, 4, 6, 5, 7]

/**
 * StatsRow
 * الصف العلوي المكوّن من 4 كروت: EC2 Instances / Threats Detected / Active Alerts / Compliance Score
 */
export default function StatsRow() {
    const [instances, setInstances] = useState([])
    const [securityEvents, setSecurityEvents] = useState([])
    const [alerts, setAlerts] = useState([])
  useEffect(() => {
    getInstances()
      .then((data) => {
        setInstances(data)
      })
      .catch((error) => {
        console.error('STATS INSTANCES ERROR:', error)
      })

    getSecurityEvents()
      .then((data) => {
        setSecurityEvents(data)
      })
      .catch((error) => {
        console.error('STATS SECURITY EVENTS ERROR:', error)
      })

    getAlerts()
  .then((data) => {
    console.log('REAL ALERTS FROM API:', data)
    setAlerts(data)
  })
  .catch((error) => {
    console.error('STATS ALERTS ERROR:', error)
  })
  }, [])

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
        value={totalInstances}
        sparklineData={ec2Spark}
        subtitle={
          <span>
            <span className="text-green-400">{runningInstances} Running</span>
            <span className="text-slate-500"> · {stoppedInstances} Stopped</span>
          </span>
        }
      />

      <StatCard
        icon={AlertTriangle}
        color="red"
        title="Threats Detected"
        value={threatsDetected}
        sparklineData={threatsSpark}
        subtitle={<span className="text-red-400">High Severity</span>}
      />

      <StatCard
        icon={Bell}
        color="amber"
        title="Active Alerts"
        value={activeAlerts}
        sparklineData={alertsSpark}
        subtitle={
          <span>
            <span className="text-amber-400">{highAlerts} High</span>
            <span className="text-slate-500"> · {mediumAlerts} Medium</span>
          </span>
        }
      />

      <StatCard
        icon={ShieldCheck}
        color="purple"
        title="Compliance Score"
        value="92%"
        subtitle={<span className="text-green-400">↑ 8% from yesterday</span>}
        rightSlot={<RadialPercent percent={92} color="#A855F7" size={56} />}
      />
    </div>
  )
}
