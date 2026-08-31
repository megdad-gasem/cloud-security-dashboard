import React from 'react'
import { Boxes, Network, Server, Scale, Database, Shield } from 'lucide-react'
import { getInfrastructureSummary } from '../../data/infrastructureData'

const ICONS = { Boxes, Network, Server, Scale, Database, Shield }

function SummaryCard({ icon: Icon, accent, title, value, sub, indicator }) {
  return (
    <div className="bg-base-panel border border-base-border rounded-xl p-3.5 min-w-0 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent.bg}`}>
        <Icon className={`w-5 h-5 ${accent.text}`} strokeWidth={2.1} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-[11px] truncate">{title}</p>
        <div className="flex items-baseline gap-1.5">
          <p className="text-white text-xl font-semibold leading-tight">{value}</p>
          {indicator}
        </div>
        {sub && <p className="text-slate-500 text-[10.5px] truncate">{sub}</p>}
      </div>
    </div>
  )
}

const ACCENTS = {
  violet: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  green: { bg: 'bg-green-500/15', text: 'text-green-400' },
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  red: { bg: 'bg-red-500/15', text: 'text-red-400' },
}

/**
 * InfrastructureSummary — صف من 6 كروت موجزة لموارد البنية التحتية.
 * القيم محسوبة من الـ data (مش hardcoded)، فالـ API بيغيّر الأرقام تلقائياً.
 */
export default function InfrastructureSummary() {
  const s = getInfrastructureSummary()
  return (
    <div className="grid grid-cols-3 xl:grid-cols-6 gap-3 shrink-0">
      <SummaryCard icon={ICONS.Boxes} accent={ACCENTS.violet} title="VPCs" value={s.vpcCount} sub="Virtual networks" />
      <SummaryCard icon={ICONS.Network} accent={ACCENTS.blue} title="Subnets" value={s.subnetCount} sub={`${s.subnetCount} total`} />
      <SummaryCard
        icon={ICONS.Server} accent={ACCENTS.green} title="EC2 Instances" value={s.ec2Count}
        sub={<span><span className="text-green-400">{s.ec2Running} Running</span> · <span className="text-slate-500">{s.ec2Stopped} Stopped</span></span>}
      />
      <SummaryCard icon={ICONS.Scale} accent={ACCENTS.cyan} title="Load Balancers" value={s.loadBalancerCount} sub="Application" />
      <SummaryCard icon={ICONS.Database} accent={ACCENTS.amber} title="Databases" value={s.databaseCount} sub="RDS" />
      <SummaryCard icon={ICONS.Shield} accent={ACCENTS.red} title="Security Groups" value={s.securityGroupCount} sub={`${s.securityGroupCount} rulesets`} />
    </div>
  )
}