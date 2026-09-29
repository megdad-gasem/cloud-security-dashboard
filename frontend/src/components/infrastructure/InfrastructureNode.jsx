import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { KIND_ACCENT, KIND_ICONS } from './ui'

/**
 * AegisCardNode — React Flow custom node (card variant).
 * Renders a compact infrastructure resource card inside the React Flow canvas.
 * Reuses existing KIND_ICONS / KIND_ACCENT for consistent Aegis styling.
 */
function AegisCardNode({ data, selected }) {
  const Icon = KIND_ICONS[data.kind] || KIND_ICONS.subnet
  const acc = KIND_ACCENT[data.kind] || 'text-slate-300'

  return (
    <>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-600 !border-slate-500" />
      <div
        className={`rounded-lg bg-base-panel border cursor-pointer transition-all px-2.5 py-2 min-w-[140px] max-w-[200px]
          ${selected
            ? 'border-blue-400 shadow-lg shadow-blue-900/40 ring-1 ring-blue-500/60'
            : 'border-base-border hover:border-slate-600'}
          ${data.dimmed ? 'opacity-35' : 'opacity-100'}`}
      >
        <div className="flex items-center justify-between gap-2">
          <Icon className={`w-4 h-4 ${acc} shrink-0`} strokeWidth={2} />
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
        <p className="text-slate-200 text-[11.5px] font-medium leading-tight truncate mt-1">{data.label}</p>
        <p className="text-slate-500 text-[11px] leading-tight truncate">{data.type}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-600 !border-slate-500" />
    </>
  )
}

/**
 * AegisContainerNode — React Flow custom node (container variant).
 * Renders VPC / AZ / Subnet containers with coloured borders.
 */
function AegisContainerNode({ data, selected }) {
  const Icon = KIND_ICONS[data.kind] || KIND_ICONS.subnet

  const containerStyles = {
    vpc: { border: 'border-purple-400/30', bg: 'bg-purple-500/[0.04]', text: 'text-purple-300', label: 'VPC' },
    az: { border: 'border-blue-400/25', bg: 'bg-blue-500/[0.03]', text: 'text-blue-300', label: 'AZ' },
    subnet: { border: 'border-lime-400/30', bg: 'bg-lime-500/[0.04]', text: 'text-lime-300', label: data.type || 'Subnet' },
  }
  const cs = containerStyles[data.kind] || { border: 'border-slate-500/30', bg: 'bg-slate-500/[0.04]', text: 'text-slate-300', label: data.type }

  return (
    <>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-600 !border-slate-500" />
      <div
        style={{ width: data.w || 200, height: data.h || 100 }}
        className={`rounded-xl border ${cs.border} ${cs.bg} transition-opacity
          ${selected ? 'ring-2 ring-blue-400/70' : ''}
          ${data.dimmed ? 'opacity-40' : 'opacity-100'}`}
      >
        <div className={`flex items-center gap-2 px-3 h-7 border-b ${cs.border}`}>
          <Icon className={`w-3.5 h-3.5 ${cs.text}`} strokeWidth={2} />
          <span className={`text-[11px] font-semibold ${cs.text}`}>{cs.label} — {data.label}</span>
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