import React, { useMemo, useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { Panel, PanelHeader, KindIcon } from './ui'

function buildRows(infra, nodes) {
  const byId = new Map()
  nodes.forEach((n) => { if (n.resourceId) byId.set(n.resourceId, n) })
  const rows = []
  const push = (kind, type, items, status, region, az, vpcId, subnetId, sec) => {
    ;(items || []).forEach((it) => {
      const n = byId.get(it.id)
      rows.push({
        id: it.id,
        name: it.name || it.identifier || it.id,
        kind, type,
        status: status(it),
        region: region(it),
        az: az(it),
        vpc: vpcId(it) ? (infra.vpcs.find((v) => v.id === vpcId(it)) || {}).name || vpcId(it) : '-',
        subnet: subnetId(it) ? (infra.subnets.find((s) => s.id === subnetId(it)) || {}).name || subnetId(it) : '-',
        secStatus: sec(it),
        nodeId: n ? n.id : null,
      })
    })
  }
  push('instance', 'EC2 Instance', infra.instances, (i) => i.state, () => 'eu-west-1', (i) => i.az, (i) => i.vpcId, (i) => i.subnetId, (i) => i.securityStatus || 'safe')
  push('database', 'RDS Database', infra.databases, (d) => d.state, () => 'eu-west-1', (d) => d.az, (d) => d.vpcId, () => '-', (d) => d.securityStatus || 'safe')
  push('alb', 'Load Balancer', infra.loadBalancers, (l) => l.state, () => 'eu-west-1', (l) => l.az, (l) => l.vpcId, () => '-', () => 'safe')
  push('subnet', 'Subnet', infra.subnets, () => 'Available', () => 'eu-west-1', (s) => s.az, (s) => s.vpcId, () => '-', () => 'safe')
  push('vpc', 'VPC', infra.vpcs, (v) => v.state, (v) => v.region, () => '-', () => '-', () => '-', () => 'safe')
  push('sg', 'Security Group', infra.securityGroups, () => 'In use', () => 'eu-west-1', () => '-', (s) => s.vpcId, () => '-', (s) => (s.openSshToWorld ? 'warning' : 'safe'))
  push('igw', 'Internet Gateway', infra.internetGateways, (g) => g.state, () => 'eu-west-1', () => '-', (g) => g.vpcId, () => '-', () => 'safe')
  push('nat', 'NAT Gateway', infra.natGateways, (g) => g.state, () => 'eu-west-1', () => '-', (g) => g.vpcId, () => '-', () => 'safe')
  return rows
}

const secBadge = (s) =>
  s === 'safe'
    ? 'text-green-400 border-green-500/25 bg-green-500/10'
    : s === 'warning'
      ? 'text-amber-400 border-amber-500/25 bg-amber-500/10'
      : 'text-red-400 border-red-500/25 bg-red-500/10'

const alive = (s) => /running|available|active/i.test(s)

export default function ResourceInventory({ infra, nodes, onSelectNode }) {
  const rows = useMemo(() => buildRows(infra, nodes), [infra, nodes])
  const [q, setQ] = useState('')
  const [type, setType] = useState('All')

  const types = ['All', ...new Set(rows.map((r) => r.type))]

  const filtered = rows.filter((r) => {
    const mq = !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase())
    return mq && (type === 'All' || r.type === type)
  })

  return (
    <Panel className="flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 pt-3 shrink-0">
        <div className="min-w-0">
          <h3 className="text-white text-[13px] font-semibold truncate">Resource Inventory</h3>
          <p className="text-slate-500 text-[10px] truncate">{rows.length} resources</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="w-24 bg-base-panel2 border border-base-border rounded-md pl-6 pr-1.5 py-1 text-[10px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
          </div>
          <FilterSelect value={type} options={types} onChange={setType} />
        </div>
      </div>
      <div className="flex-1 min-h-0 px-3 py-2">
        <div className="rounded-lg border border-base-border overflow-hidden h-full flex flex-col">
          <div className="grid grid-cols-[1fr_0.8fr_0.7fr_60px] text-slate-500 text-[9.5px] px-2 py-1.5 bg-base-panel2/60 gap-1 shrink-0">
            <span>Resource</span><span>Type</span><span>Status</span><span className="text-right">Action</span>
          </div>
          <div className="flex-1 min-h-0 divide-y divide-base-border overflow-y-auto thin-scrollbar">
            {filtered.length === 0 && <p className="text-slate-500 text-[11px] px-2 py-3">No resources match.</p>}
            {filtered.map(function(r){
              return (
                <div key={r.id} className="grid grid-cols-[1fr_0.8fr_0.7fr_60px] items-center gap-1 px-2 py-1.5 hover:bg-base-panel2/40 transition-colors">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <KindIcon kind={r.kind} className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-slate-200 text-[10.5px] font-medium truncate">{r.name}</span>
                  </div>
                  <span className="text-slate-400 text-[10px] truncate">{r.type}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-300">
                    <span className={`w-1.5 h-1.5 rounded-full ${alive(r.status) ? 'bg-green-400' : r.status === 'Stopped' ? 'bg-slate-500' : 'bg-amber-400'}`} />
                    <span className="capitalize truncate">{r.status}</span>
                  </span>
                  <span className="text-right">
                    <button onClick={function(){ if (r.nodeId && onSelectNode) onSelectNode(r.nodeId) }} disabled={!r.nodeId} className="text-[9.5px] text-blue-400 hover:text-blue-300 border border-blue-500/30 bg-blue-600/10 rounded px-1.5 py-0.5 disabled:opacity-30 disabled:pointer-events-none transition-colors">View</button>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Panel>
  )
}

function FilterSelect({ value, options, onChange }) {
  return (
    <label className="flex items-center gap-0.5 bg-base-panel2 border border-base-border rounded-md px-1.5 py-1">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-slate-300 text-[10px] focus:outline-none appearance-none pr-1 cursor-pointer">
        {options.map((o) => <option key={o} value={o} className="bg-base-panel text-slate-200">{o}</option>)}
      </select>
      <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
    </label>
  )
}
