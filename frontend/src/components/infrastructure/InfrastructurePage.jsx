import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { MousePointerClick, Maximize2, Minimize2 } from 'lucide-react'
import { getInfrastructure } from '../../services/api'
import { infrastructureFindings } from '../../data/infrastructureData'
import InfrastructurePageHeader from './InfrastructurePageHeader'
import InfrastructureSummary from './InfrastructureSummary'
import InfrastructureTopology from './InfrastructureTopology'
import NetworkSummary from './NetworkSummary'
import ResourceDetailsPanel from './ResourceDetailsPanel'
import ResourceInventory from './ResourceInventory'
import SecurityPosture from './SecurityPosture'
import { Panel } from './ui'

/**
 * InfrastructurePage
 * الحاوية الرئيسية لصفحة البنية التحتية.
 * بتركّب المكوّنات الموجودة جوه src/components/infrastructure/ من غير إعادة
 * بناء أي منها، وبتدير بس الـ state المشترك اللي بيخص الصفحة:
 *   - بيانات البنية التحتية + topology (nodes/links) + findings
 *   - العقدة المحددة (selected) والعقدة المطلوب التركيز عليها (pending)
 *   - حالة التحديث + آخر تحديث + فلتر البيئة
 *
 * Layout: viewport-constrained — NO browser-level scrollbar.
 *   Header (shrink-0)
 *   Summary (shrink-0)
 *   Main area (flex-1, min-h-0)
 *     Topology + Details (flex-[2])
 *     Bottom grid (flex-1, grid-cols-3)
 */
const RESOURCE_COLLECTIONS = [
  'vpcs',
  'subnets',
  'instances',
  'loadBalancers',
  'databases',
  'securityGroups',
  'internetGateways',
  'natGateways',
  'routeTables',
]

export default function InfrastructurePage() {
  const [infra, setInfra] = useState(null)
  const [topology, setTopology] = useState({ nodes: [], links: [] })
  const [findings, setFindings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('-')
  const [environment, setEnvironment] = useState('All')

  const [selectedId, setSelectedId] = useState(null)
  const [pendingId, setPendingId] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // ---- جلب البيانات (getInfrastructure حالياً بيرجّع mock) ----
  const loadData = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true)
    try {
      const data = await getInfrastructure()
      setInfra(data.infrastructure)
      setTopology(data.topology || { nodes: [], links: [] })
      setFindings(data.findings || infrastructureFindings || [])
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch (error) {
      console.error('Infrastructure load error:', error)
    } finally {
      setLoading(false)
      if (asRefresh) setTimeout(() => setRefreshing(false), 400)
    }
  }, [])

  useEffect(() => {
    loadData(false)
  }, [loadData])

  // ---- ربط عقدة الـ topology بالمورد الفعلي في البيانات ----
  const nodeById = useMemo(() => {
    const m = new Map()
    topology.nodes.forEach((n) => m.set(n.id, n))
    return m
  }, [topology.nodes])

  const selectedNode = selectedId ? nodeById.get(selectedId) || null : null

  const selectedResource = useMemo(() => {
    if (!selectedNode || !selectedNode.resourceId || !infra) return null
    const id = selectedNode.resourceId
    for (const key of RESOURCE_COLLECTIONS) {
      const hit = (infra[key] || []).find((r) => r.id === id)
      if (hit) return hit
    }
    return null
  }, [selectedNode, infra])

  // ---- معالجات التفاعل ----
  const handleNodeSelect = useCallback((nodeId) => {
    setSelectedId(nodeId)
    setPendingId(null)
  }, [])

  // يُستخدم من الجدول والـ findings: يحدد العقدة + يركزها في الـ topology
  const handleFocusNode = useCallback((nodeId) => {
    if (!nodeId) return
    setSelectedId(nodeId)
    setPendingId(nodeId)
    setTimeout(() => setPendingId(null), 700)
  }, [])

  const handleCloseDetails = useCallback(() => setSelectedId(null), [])
  const handleRefresh = useCallback(() => loadData(true), [loadData])

  const topologyHeader = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-3 pt-3 shrink-0">
      <div>
        <h3 className="text-white text-[13px] font-semibold">Network Topology</h3>
        <p className="text-slate-500 text-[10.5px]">Drag to pan · Scroll to zoom · Click a node for details</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" />Network</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" />Attached</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-lime-400" />Route</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" />Data</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-base-panel2 border border-base-border text-slate-300 hover:text-white hover:bg-base-border transition-colors text-[11px] font-medium"
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              Exit Full View
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              Full View
            </>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
      {!isExpanded && (
        <>
          {/* Header — fixed height */}
          <InfrastructurePageHeader
            refreshing={refreshing}
            lastUpdated={lastUpdated}
            onRefresh={handleRefresh}
            environment={environment}
            onEnvironment={setEnvironment}
          />

          {/* Summary cards — fixed height */}
          <InfrastructureSummary />
        </>
      )}

      {/* Main content area — takes all remaining space */}
      <div className="flex-1 min-h-0 flex flex-col gap-2">

        {/* Topology + Details row */}
        <div className="flex-[2] min-h-0 grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-2">
          <Panel className="flex flex-col min-h-0 overflow-hidden">
            {topologyHeader}
            <div className="flex-1 min-h-0 m-2 overflow-hidden rounded-xl">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-[12px]">
                  Loading infrastructure topology...
                </div>
              ) : (
                <InfrastructureTopology
                  nodes={topology.nodes}
                  links={topology.links}
                  selectedId={selectedId}
                  onSelect={handleNodeSelect}
                  pendingId={pendingId}
                  isExpanded={isExpanded}
                />
              )}
            </div>
          </Panel>

          <div className="min-h-0 overflow-hidden">
            {selectedNode ? (
              <ResourceDetailsPanel
                resource={selectedResource}
                infra={infra || {}}
                node={selectedNode}
                onClose={handleCloseDetails}
              />
            ) : (
              <Panel className="h-full flex flex-col items-center justify-center text-center px-4 py-6 min-h-0">
                <div className="w-10 h-10 rounded-xl bg-base-panel2 border border-base-border flex items-center justify-center mb-2">
                  <MousePointerClick className="w-5 h-5 text-slate-400" strokeWidth={2} />
                </div>
                <p className="text-slate-300 text-[12px] font-semibold">Select a resource</p>
                <p className="text-slate-500 text-[10.5px] mt-1 max-w-[220px]">
                  Click any node in the topology, or use the resource inventory and security findings to inspect a resource.
                </p>
              </Panel>
            )}
          </div>
        </div>

        {!isExpanded && (
          /* Bottom row — 3 columns, constrained height */
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-2">
            <NetworkSummary />
            <ResourceInventory
              infra={infra || {}}
              nodes={topology.nodes}
              onSelectNode={handleFocusNode}
            />
            <SecurityPosture findings={findings} onViewResource={handleFocusNode} />
          </div>
        )}
      </div>
    </div>
  )
}
