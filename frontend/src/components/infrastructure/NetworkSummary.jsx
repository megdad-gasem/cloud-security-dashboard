import React from 'react'
import { Boxes, Network, Wifi, Anchor, Route, Shield } from 'lucide-react'
import { Panel, PanelHeader } from './ui'
import { getNetworkSummary } from '../../data/infrastructureData'

function Stat({ icon: Icon, accent, label, value }) {
  return (
    <div className="bg-base-panel2/60 border border-base-border rounded-lg px-2 py-1.5 flex items-center gap-2 min-w-0">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-slate-500 text-[9px] truncate">{label}</p>
        <p className="text-slate-200 text-[12px] font-semibold truncate">{value}</p>
      </div>
    </div>
  )
}

export default function NetworkSummary() {
  const ns = getNetworkSummary()
  return (
    <Panel className="flex flex-col min-h-0 overflow-hidden">
      <PanelHeader
        title="Network Summary"
        subtitle={`${ns.vpc.name} · ${ns.vpc.cidr}`}
        right={
          <span className="text-[10px] text-slate-500">{ns.vpc.region}</span>
        }
      />
      <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-3 py-2">
        <div className="grid grid-cols-2 gap-1.5">
          <Stat icon={Boxes} accent="bg-purple-500/15 text-purple-400" label="VPC CIDR" value={ns.vpc.cidr} />
          <Stat icon={Network} accent="bg-blue-500/15 text-blue-400" label="Public subnets" value={ns.publicSubnets.length} />
          <Stat icon={Network} accent="bg-slate-500/15 text-slate-300" label="Private subnets" value={ns.privateSubnets.length} />
          <Stat icon={Wifi} accent="bg-cyan-500/15 text-cyan-400" label="Internet GW" value={ns.internetGateways.length} />
          <Stat icon={Anchor} accent="bg-sky-500/15 text-sky-400" label="NAT GW" value={ns.natGateways.length} />
          <Stat icon={Route} accent="bg-emerald-500/15 text-emerald-400" label="Route tables" value={ns.routeTables.length} />
          <Stat icon={Shield} accent="bg-red-500/15 text-red-400" label="Security groups" value={ns.securityGroups.length} />
        </div>
      </div>
    </Panel>
  )
}