import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { KIND_ICONS } from './ui'

/**
 * AegisCardNode — React Flow custom node (card variant).
 * Renders a compact infrastructure resource card inside the React Flow canvas.
 * Icons stay neutral (slate) — color is reserved for status/security dots and
 * the selected state, so resource type reads through label/icon/typography.
 */
function AegisCardNode({ data, selected }) {
  const Icon = KIND_ICONS[data.kind] || KIND_ICONS.subnet

  return (
    <>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-600 !border-slate-500" />
      <div
        className={`aegis-topo-node relative rounded-lg border cursor-pointer transition-all px-2 py-1.5 min-w-[132px] max-w-[200px]
          ${selected
            ? 'border-blue-400 shadow-lg shadow-blue-900/40 ring-1 ring-blue-500/60'
            : 'border-slate-700 hover:border-slate-600 shadow-sm'}
          ${data.dimmed ? 'opacity-35' : 'opacity-100'}`}
      >
        {data.status === 'warning' && <span className="aegis-state-bar bg-amber-400" aria-hidden="true" />}
        {data.status === 'critical' && <span className="aegis-state-bar bg-red-500" aria-hidden="true" />}
        <div className="flex items-center justify-between gap-2">
          <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={2} />
          <span className="flex items-center gap-1">
            {data.status && (
              <span 
                className={`w-1.5 h-1.5 rounded-full ${
                  data.status === 'warning' ? 'bg-amber-400' : data.status === 'critical' ? 'bg-red-500' : 'bg-green-400'
                }`}
                title={`Status: ${data.status}`}
              >
                <span className="sr-only">Status: {data.status}</span>
              </span>
            )}
            {data.security && (
              <span 
                className={`w-1.5 h-1.5 rounded-full ${
                  data.security === 'warning' ? 'bg-amber-400' : data.security === 'critical' ? 'bg-red-500' : 'bg-green-400'
                }`}
                title={`Security: ${data.security}`}
              >
                <span className="sr-only">Security: {data.security}</span>
              </span>
            )}
          </span>
        </div>
        <p className="text-slate-200 text-[11px] font-medium leading-tight truncate mt-0.5">{data.label}</p>
        <p className="text-slate-400 text-[10px] leading-tight truncate">{data.type}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-600 !border-slate-500" />
    </>
  )
}

/**
 * AegisContainerNode — React Flow custom node (container variant).
 * VPC / AZ / Subnet containers read as structural boundaries: subtle neutral
 * surface, low-emphasis border, subdued label — no per-kind colored fills.
 */
function AegisContainerNode({ data, selected }) {
  const Icon = KIND_ICONS[data.kind] || KIND_ICONS.subnet
  const label = data.type || 'Container'
  // VPC is the main scope, AZ the zone below it, Subnet the innermost zone —
  // three neutral surface depths (see .aegis-topo-* in index.css).
  const isVpc = data.kind === 'vpc'
  const surfaceClass = isVpc ? 'aegis-topo-vpc' : data.kind === 'az' ? 'aegis-topo-az' : 'aegis-topo-subnet'
  const headText = isVpc ? 'text-slate-300 text-[11px] font-semibold' : 'text-slate-400 text-[10.5px] font-medium'
  const iconTone = isVpc ? 'text-slate-300' : 'text-slate-400'

  return (
    <>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-600 !border-slate-500" />
      <div
        style={{ width: data.w || 200, height: data.h || 100 }}
        className={`${surfaceClass} rounded-lg border transition-opacity
          ${selected ? 'ring-2 ring-blue-400/70' : ''}
          ${data.dimmed ? 'opacity-40' : 'opacity-100'}`}
      >
        <div className="flex items-center gap-2 px-3 h-6 border-b aegis-topo-head">
          <Icon className={`w-3.5 h-3.5 ${iconTone}`} strokeWidth={2} />
          <span className={`${headText} truncate`}>{label} — {data.label}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-600 !border-slate-500" />
    </>
  )
}

export const AegisCard = memo(AegisCardNode)
export const AegisContainer = memo(AegisContainerNode)

// Legacy default export for backward compat (not used by React Flow directly)
export default AegisCardNode