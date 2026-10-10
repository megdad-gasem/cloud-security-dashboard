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

// Calm edge treatment — no per-kind rainbow. Normal edges are thin and neutral
// (no inline stroke, so the existing theme-aware `.react-flow__edge-path` fill
// applies: slate in dark, light slate in light mode). Only edges touching the
// focused/selected node get the Aegis blue accent.
const EDGE_ACCENT = '#3B82F6'
const EDGE_DEFAULT_WIDTH = 1.25
const EDGE_ENGAGED_WIDTH = 2.2

const nodeTypes = {
  aegisCard: AegisCard,
  aegisContainer: AegisContainer,
}

const isContainerKind = (k) => k === 'vpc' || k === 'az' || k === 'subnet'

// ---------------------------------------------------------------------------
// V2 structural layout — recompose the stored flat graph into an architecture
// map:  outer (Internet / IGW / NAT)  ->  VPC  ->  AZ  ->  Subnet  ->  resource.
// Positions are DERIVED from the existing nodes/links (kinds + original
// containment), never hardcoded per id, and the data file is never modified.
// AZ/Subnet nesting (vpc -> az -> subnet) is expressed by the new bounds, so
// the old 'contain' edges are dropped from the rendered relationships.
// ---------------------------------------------------------------------------
const L_CARD_W = 150
const L_CARD_H = 56
const L_CARD_GUTTER = 18
const L_VPC_PAD_X = 72
const L_VPC_HDR = 24
const L_VPC_HDR_GAP = 10
const L_VPC_SRV_GAP = 30
const L_VPC_PAD_BOTTOM = 42
const L_AZ_PAD_X = 30
const L_AZ_HDR = 26
const L_AZ_GAP = 12
const L_AZ_PAD_BOTTOM = 18
const L_SUB_PAD_X = 26
const L_SUB_HDR = 24
const L_SUB_GAP = 10
const L_SUB_PAD_BOTTOM = 16
const L_AZ_ROW_GAP = 56
const L_CLOUD_GAP = 56
const L_CLOUD_INNER_GAP = 26
const L_MARGIN = { x: 70, y: 40 }

function relayoutTopology(topoNodes) {
  const vpc = topoNodes.find((n) => n.kind === 'vpc')
  if (!vpc) return topoNodes

  const contains = (outer, inner) => {
    if (!outer || !outer.w || !outer.h) return false
    const cx = inner.x + (inner.w || L_CARD_W) / 2
    const cy = inner.y + (inner.h || L_CARD_H) / 2
    return cx >= outer.x && cx <= outer.x + outer.w && cy >= outer.y && cy <= outer.y + outer.h
  }

  const azs = topoNodes.filter((n) => n.kind === 'az').sort((a, b) => a.x - b.x)
  const subs = topoNodes.filter((n) => n.kind === 'subnet').sort((a, b) => a.x - b.x)
  const cards = topoNodes.filter((n) => !isContainerKind(n.kind))

  // Where does a card live, based on the ORIGINAL stored positions?
  const zoneOf = (c) => {
    const sub = subs.find((s) => contains(s, c))
    if (sub) return { zone: 'subnet', sub }
    const az = azs.find((a) => contains(a, c))
    if (az) return { zone: 'az', az }
    if (contains(vpc, c)) return { zone: 'vpc' }
    return { zone: 'outer' }
  }

  const outerCol = cards.filter((c) => zoneOf(c).zone === 'outer').sort((a, b) => a.y - b.y)
  const srvCards = cards.filter((c) => zoneOf(c).zone === 'vpc').sort((a, b) => a.x - b.x)

  // Sizing, derived from the real cards inside each subnet
  const subKids = (s) => cards.filter((c) => zoneOf(c).zone === 'subnet' && zoneOf(c).sub.id === s.id).sort((a, b) => a.x - b.x)
  const subSize = (s) => {
    const kids = subKids(s)
    const w = Math.max(L_SUB_PAD_X * 2 + L_CARD_W, kids.length * L_CARD_W + Math.max(0, kids.length - 1) * L_CARD_GUTTER + L_SUB_PAD_X * 2)
    const h = L_SUB_HDR + L_SUB_GAP + L_CARD_H + L_SUB_PAD_BOTTOM
    return { w, h, kids }
  }

  const azRows = azs.map((a) => {
    const aSubs = subs.filter((s) => contains(a, s)).sort((x, y) => x.x - y.x)
    const sizes = aSubs.map(subSize)
    const w = L_AZ_PAD_X * 2 + sizes.reduce((acc, s) => acc + s.w, 0) + Math.max(0, sizes.length - 1) * L_AZ_GAP
    const h = L_AZ_HDR + L_AZ_GAP + Math.max(0, ...sizes.map((s) => s.h)) + L_AZ_PAD_BOTTOM
    return { az: a, subs: aSubs.map((s, i) => ({ sub: s, ...sizes[i] })), w, h }
  })

  const srvW = srvCards.length ? srvCards.length * L_CARD_W + Math.max(0, srvCards.length - 1) * L_CARD_GUTTER : 0
  const azRowW = azRows.reduce((acc, r) => acc + r.w, 0) + Math.max(0, azRows.length - 1) * L_AZ_ROW_GAP
  const azRowH = azRows.length ? Math.max(...azRows.map((r) => r.h)) : 0

  const vpcW = Math.max(azRowW, srvW) + L_VPC_PAD_X * 2
  const vpcH = L_VPC_HDR + L_VPC_HDR_GAP + L_CARD_H + L_VPC_SRV_GAP + azRowH + L_VPC_PAD_BOTTOM

  const placed = new Map() // id -> { x, y, w, h }
  const vpcX = 0
  const vpcY = 0
  placed.set(vpc.id, { x: vpcX, y: vpcY, w: vpcW, h: vpcH })

  // VPC-scoped services row (route tables / security groups / ALB)
  const srvY = vpcY + L_VPC_HDR + L_VPC_HDR_GAP
  let srvX = vpcX + (vpcW - srvW) / 2
  srvCards.forEach((c) => {
    placed.set(c.id, { x: srvX, y: srvY, w: L_CARD_W, h: L_CARD_H })
    srvX += L_CARD_W + L_CARD_GUTTER
  })

  // Zone row (AZs side by side, each holding its subnets + resources)
  const azY = srvY + L_CARD_H + L_VPC_SRV_GAP
  let azX = vpcX + Math.max(0, (vpcW - azRowW) / 2)
  azRows.forEach((r) => {
    placed.set(r.az.id, { x: azX, y: azY, w: r.w, h: r.h })
    let subX = azX + L_AZ_PAD_X
    r.subs.forEach((s) => {
      placed.set(s.sub.id, { x: subX, y: azY + L_AZ_HDR + L_AZ_GAP, w: s.w, h: s.h })
      let cardX = subX + L_SUB_PAD_X
      const cardY = azY + L_AZ_HDR + L_AZ_GAP + L_SUB_HDR + L_SUB_GAP
      s.kids.forEach((k) => {
        placed.set(k.id, { x: cardX, y: cardY, w: L_CARD_W, h: L_CARD_H })
        cardX += L_CARD_W + L_CARD_GUTTER
      })
      subX += s.w + L_AZ_GAP
    })
    azX += r.w + L_AZ_ROW_GAP
  })

  // Outer cloud column, centered above the VPC
  const colH = outerCol.length * L_CARD_H + Math.max(0, outerCol.length - 1) * L_CLOUD_INNER_GAP
  let cloudY = vpcY - L_CLOUD_GAP - colH
  const cloudX = vpcX + vpcW / 2 - L_CARD_W / 2
  outerCol.forEach((c) => {
    placed.set(c.id, { x: cloudX, y: cloudY, w: L_CARD_W, h: L_CARD_H })
    cloudY += L_CARD_H + L_CLOUD_INNER_GAP
  })

  // Translate so the whole map keeps positive margins
  let minX = Infinity
  let minY = Infinity
  for (const p of placed.values()) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
  }
  const dx = L_MARGIN.x - minX
  const dy = L_MARGIN.y - minY

  return topoNodes.map((n) => {
    const p = placed.get(n.id)
    if (!p) return n
    return { ...n, x: p.x + dx, y: p.y + dy, w: p.w ?? n.w, h: p.h ?? n.h }
  })
}

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
      ariaLabel: `${isContainer ? 'Container' : 'Node'} ${n.label} of type ${n.type || n.kind}`,
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
    const style = {
      strokeWidth: engaged ? EDGE_ENGAGED_WIDTH : EDGE_DEFAULT_WIDTH,
      strokeDasharray: l.kind === 'contain' ? '5 5' : undefined,
      // Quiet hierarchy: structural (contain) edges are the quietest; regular
      // connections stay visible; engaged/selected paths take full emphasis.
      opacity: focusId
        ? (engaged ? 1 : 0.12)
        : (l.kind === 'contain' ? 0.3 : 0.5),
    }
    // Only engaged/selected paths carry the accent color; everything else
    // falls back to the theme-aware neutral edge stroke from CSS.
    if (engaged) style.stroke = EDGE_ACCENT
    return {
      id: l.id,
      source: l.from,
      target: l.to,
      type: 'default',
      style,
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

  // V2: recompose the flat graph into an architecture map
  // (outer -> VPC -> AZ -> Subnet -> resource) with deliberate gutters.
  const placedNodes = useMemo(() => relayoutTopology(topoNodes), [topoNodes])
  // Containment is now expressed by the nested bounds, so the old 'contain'
  // edges (vpc -> az) are not drawn — nesting carries that relationship.
  const relLinks = useMemo(() => links.filter((l) => l.kind !== 'contain'), [links])
  const connected = useMemo(() => {
    const set = new Set()
    for (const l of relLinks) {
      if (focus && (l.from === focus || l.to === focus)) {
        set.add(l.from)
        set.add(l.to)
      }
    }
    return set
  }, [relLinks, focus])

  const rfNodes = useMemo(
    () => toRFNodes(placedNodes, selectedId, focus, connected),
    [placedNodes, selectedId, focus, connected]
  )
  const rfEdges = useMemo(
    () => toRFEdges(relLinks, focus, connected),
    [relLinks, focus, connected]
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
    const n = placedNodes.find((nd) => nd.id === pendingId)
    if (n) {
      setCenter(n.x + (n.w || 80) / 2, n.y + (n.h || 40) / 2, { zoom: 0.9, duration: 500 })
    }
  }, [pendingId, placedNodes, setCenter])

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
          // Color only communicates state — never resource type.
          // Focus/selection uses the existing Aegis blue; normal nodes stay
          // neutral slate (containers slightly dimmer than resources).
          if (node.selected) return '#3B82F6'
          const d = node.data || {}
          if (d.status === 'warning') return '#F59E0B'
          if (d.status === 'critical') return '#EF4444'
          if (d.kind === 'vpc' || d.kind === 'az' || d.kind === 'subnet') return '#64748B'
          return '#94A3B8'
        }}
        // Neutral slate viewport mask (theme-agnostic) — keeps the map quiet.
        maskColor="rgba(71, 85, 105, 0.55)"
        style={{
          // Compact — stays subordinate to the main topology.
          // Surface + border come from .aegis-minimap CSS (theme-aware).
          width: 168,
          height: 126,
        }}
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