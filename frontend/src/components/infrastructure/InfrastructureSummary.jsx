import React from 'react'
import { getInfrastructureSummary } from '../../data/infrastructureData'

// Resource "surface" ledger — same values from the data layer, composed as a
// single horizontal strip (not cards). Hierarchy refinement: counts get more
// visual weight (larger/stronger), labels stay secondary, only EC2 keeps its
// real running/stopped breakdown. "Resource surface" remains a quiet context
// label, separated from the numbers by a hairline divider.
export default function InfrastructureSummary() {
  const s = getInfrastructureSummary()

  const items = [
    { label: 'VPCs', value: s.vpcCount },
    { label: 'Subnets', value: s.subnetCount },
    {
      label: 'EC2 Instances',
      value: s.ec2Count,
      sub: <span><span className="text-green-400">{s.ec2Running} Running</span><span className="text-slate-500"> · {s.ec2Stopped} Stopped</span></span>,
    },
    { label: 'Load Balancers', value: s.loadBalancerCount },
    { label: 'Databases', value: s.databaseCount },
    { label: 'Security Groups', value: s.securityGroupCount },
  ]

  return (
    <div className="shrink-0 border border-base-border rounded-xl bg-base-panel px-3.5 py-2 flex flex-wrap items-center gap-x-5 gap-y-1.5">
      <span className="text-slate-500 text-[10px] uppercase tracking-wider shrink-0">Resource surface</span>
      <span className="w-[1px] self-stretch bg-slate-700 shrink-0" />
      {items.map((it) => (
        <div key={it.label} className="min-w-0 shrink-0">
          <p className="text-slate-400 text-[10px] uppercase tracking-wide truncate max-w-[120px]">{it.label}</p>
          <p className="text-white text-[16px] font-semibold leading-tight">
            {it.value}
            {it.sub && <span className="text-[10.5px] ml-1.5">{it.sub}</span>}
          </p>
        </div>
      ))}
    </div>
  )
}