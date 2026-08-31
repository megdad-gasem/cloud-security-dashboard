import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AegisCard, AegisContainer } from './InfrastructureNode'

const LINK_COLORS = {
  network: '#38BDF8',
  attach: '#22C55E',
  route: '#A3E635',
  data: '#A855F7',
  contain: '#475569',
}

const nodeTypes = {
  aegisCard: AegisCard,
  aegisContainer: AegisContainer,
}

const isContainerKind = (k) => k === 'vpc' || k === 'az' || k === 'subnet'

/**
 * Convert topology nodes from the existing data format into React Flow nodes.
 * Container kinds (vpc, az, subnet) get a larger fixed size.
 * Card kinds are compact.
 */
function toRFNodes(topoNodes, selectedId, focusId, connectedSet) {
  const focus = focusId || selectedId
  return topoNodes.map((n) => {
    const isContainer = isContainerKind(n.kind)
    const dimmed = focus ? !(n.id === focus || connectedSet.has(n.id)) : false
    return {
      id: n.id,
      type: isContainer ? 'aegisContainer' : 'aegisCard',
      position: { x: n.x, y: n.y },
      // Containers must show at correct z-level (behind cards)
      zIndex: isContainer ? 0 : 10,
      data: {
        ...n,
        dimmed,
      },
      selected: n.id === selectedId,
      // Containers are not draggable in group mode, but let user reposition
      draggable: true,
    }
  })
}

/**
 * Convert topology links into React Flow edges.
 */
function toRFEdges(topoLinks, focusId, connectedSet) {
  return topoLinks.map((l) => {
    const engaged = focusId && (l.from === focusId || l.to === focusId)
    const color = LINK_COLORS[l.kind] || '#64748B'
    return {
      id: l.id,
      source: l.from,
      target: l.to,
      type: 'default',
      style: {
        stroke: color,
        strokeWidth: engaged ? 2.4 : 1.4,
        strokeDasharray: l.kind === 'contain' ? '5 5' : undefined,
        opacity: focusId ? (engaged ? 1 : 0.16) : 0.55,
      },
      animated: false,
    }
  })
}

/**
 * Inner component that uses the React Flow hooks (must be inside ReactFlowProvider).
 */
function TopologyInner({ nodes: topoNodes, links, selectedId, onSelect, pendingId, isExpanded }) {
  const { fitView, setCenter } = useReactFlow()
  const [hoverId, setHoverId] = useState(null)

  const focus = pendingId || selectedId || hoverId
  const connected = useMemo(() => {
    const set = new Set()
    for (const l of links) {
      if (focus && (l.from === focus || l.to === focus)) {
        set.add(l.from)
        set.add(l.to)
      }
    }
    return set
  }, [links, focus])

  const rfNodes = useMemo(
    () => toRFNodes(topoNodes, selectedId, focus, connected),
    [topoNodes, selectedId, focus, connected]
  )
  const rfEdges = useMemo(
    () => toRFEdges(links, focus, connected),
    [links, focus, connected]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges)

  // Sync when rfNodes/rfEdges change (selection, hover, data change)
  useEffect(() => {
    setNodes(rfNodes)
  }, [rfNodes, setNodes])

  useEffect(() => {
    setEdges(rfEdges)
  }, [rfEdges, setEdges])

  // Initial fit view
  useEffect(() => {
    const timer = setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 200)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Trigger fit view when expanding or collapsing
  useEffect(() => {
    // Wait for the container to finish resizing before fitting
    const timer = setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 150)
    return () => clearTimeout(timer)
  }, [isExpanded, fitView])

  // Focus on pending node
  useEffect(() => {
    if (!pendingId) return
    const n = topoNodes.find((nd) => nd.id === pendingId)
    if (n) {
      setCenter(n.x + (n.w || 80) / 2, n.y + (n.h || 40) / 2, { zoom: 0.9, duration: 500 })
    }
  }, [pendingId, topoNodes, setCenter])

  const onNodeClick = useCallback(
    (_event, node) => {
      onSelect && onSelect(node.id)
    },
    [onSelect]
  )

  const onPaneClick = useCallback(() => {
    // Optionally clear selection when clicking empty space
  }, [])

  const onNodeMouseEnter = useCallback((_event, node) => {
    setHoverId(node.id)
  }, [])

  const onNodeMouseLeave = useCallback(() => {
    setHoverId(null)
  }, [])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.2}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      className="aegis-reactflow"
    >
      <Background color="#1B2839" gap={20} size={1} />
      <Controls
        showInteractive={false}
        className="aegis-rf-controls"
      />
      <MiniMap
        nodeColor={(node) => {
          const kind = node.data?.kind
          const colorMap = {
            internet: '#94A3B8',
            igw: '#60A5FA',
            nat: '#38BDF8',
            vpc: '#A855F7',
            route: '#34D399',
            sg: '#FB923C',
            alb: '#22D3EE',
            subnet: '#A3E635',
            instance: '#22C55E',
            database: '#D946EF',
            az: '#3B82F6',
          }
          return colorMap[kind] || '#475569'
        }}
        maskColor="rgba(9, 18, 31, 0.75)"
        style={{ background: '#0E1A2B', border: '1px solid #1B2839', borderRadius: 8 }}
        className="aegis-minimap"
      />
    </ReactFlow>
  )
}

/**
 * InfrastructureTopology — React Flow powered interactive topology.
 * Drop-in replacement for the legacy custom canvas.
 */
export default function InfrastructureTopology({ nodes, links, selectedId, onSelect, pendingId, isExpanded }) {
  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <TopologyInner
          nodes={nodes}
          links={links}
          selectedId={selectedId}
          onSelect={onSelect}
          pendingId={pendingId}
          isExpanded={isExpanded}
        />
      </ReactFlowProvider>
    </div>
  )
}