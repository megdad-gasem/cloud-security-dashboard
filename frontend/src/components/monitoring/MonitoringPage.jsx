import React, { useCallback, useEffect, useState } from 'react'
import { getMonitoringData } from '../../services/api'
import MonitoringPageHeader from './MonitoringPageHeader'
import MonitoringSummary from './MonitoringSummary'
import MetricsOverview from './MetricsOverview'
import CpuMemoryChart from './CpuMemoryChart'
import NetworkTrafficChart from './NetworkTrafficChart'
import ResourceMonitoring from './ResourceMonitoring'
import MonitoringAlerts from './MonitoringAlerts'
import RecentActivity from './RecentActivity'
import { MonPanel, MonPanelHeader } from './ui'

/**
 * MonitoringPage
 * الحاوية الرئيسية لصفحة المراقبة — viewport-constrained (زي InfrastructurePage):
 *   header (shrink-0)
 *   summary (shrink-0)
 *   main (flex-1 min-h-0) → شبكتين:
 *     - الصف العلوي: MetricsOverview + ResourceMonitoring (وبينهم RecentActivity/Alerts)
 *     - الصف السفلي: CpuMemoryChart + NetworkTrafficChart
 * مفيش scroll للصفحة نفسها — الـ scroll الداخلي بس جوه القوائم (resources/alerts/activity).
 */
export default function MonitoringPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('-')
  const [environment, setEnvironment] = useState('All')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const [selectedId, setSelectedId] = useState(null)

  const loadData = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true)
    try {
      const result = await getMonitoringData()
      setData(result)
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch (error) {
      console.error('Monitoring load error:', error)
    } finally {
      setLoading(false)
      if (asRefresh) setTimeout(() => setRefreshing(false), 400)
    }
  }, [])

  useEffect(() => {
    loadData(false)
  }, [loadData])

  // Auto-refresh (شكلي، بدون AWS) — ينعش البيانات كل 30 ثانية لو مفعّل
  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => loadData(true), 30000)
    return () => clearInterval(id)
  }, [autoRefresh, loadData])

  const resources = data?.resources || []
  const alerts = data?.alerts || []
  const activity = data?.activity || []

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
      {/* Header — fixed height */}
      <MonitoringPageHeader
        refreshing={refreshing}
        lastUpdated={lastUpdated}
        onRefresh={() => loadData(true)}
        environment={environment}
        onEnvironment={setEnvironment}
        autoRefresh={autoRefresh}
        onAutoRefresh={() => setAutoRefresh((v) => !v)}
      />

      {/* Summary cards — fixed height */}
      <MonitoringSummary summary={data?.summary || {}} />

      {/* Main monitoring area */}
      <div className="flex-1 min-h-0 flex flex-col gap-2">

        {/* Row 1 — MetricsOverview + ResourceMonitoring + RecentActivity + Alerts */}
        <div className="flex-[1.8] min-h-0 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr] gap-2">
          <MetricsOverview />

          <div className="min-h-0 flex flex-col gap-2">
            <div className="flex-1 min-h-0">
              <ResourceMonitoring
                resources={resources}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onClose={() => setSelectedId(null)}
              />
            </div>
          </div>

          <div className="min-h-0 flex flex-col gap-2">
            <div className="flex-1 min-h-0">
              <MonitoringAlerts alerts={alerts} />
            </div>
          </div>
        </div>

        {/* Row 2 — CPU/Memory + Network charts + Recent Activity */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-2">
          <MonPanel className="flex flex-col min-h-0">
            <MonPanelHeader title="CPU & Memory" subtitle="Utilization over time" />
            <CpuMemoryChart />
          </MonPanel>

          <MonPanel className="flex flex-col min-h-0">
            <MonPanelHeader title="Network Traffic" subtitle="In / Out (MB/s)" />
            <NetworkTrafficChart />
          </MonPanel>

          <div className="min-h-0">
            <RecentActivity activity={activity} />
          </div>
        </div>

        {loading && (
          <div className="shrink-0 text-slate-500 text-[11px] text-center border border-base-border rounded-lg bg-base-panel py-1.5">
            Loading monitoring data…
          </div>
        )}
      </div>
    </div>
  )
}