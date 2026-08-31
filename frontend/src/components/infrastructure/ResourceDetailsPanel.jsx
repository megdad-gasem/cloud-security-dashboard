import React from 'react'
import { X } from 'lucide-react'
import { Panel, KindIcon, KIND_ACCENT, StatusDot } from './ui'

// ---------------------------------------------------------------------------
// ResourceDetailsPanel
// لوحة تفاصيل المورد — data-driven: بتاخد العقدة + المورد المرتبط بيها من
// الـ infrastructure، وبتحويّل لصفوف بيانات حسب النوع. أي مورد جديد = إضافة
// إدخال في FIELD_DEFS بس بدون ما نعدّل التخطيط.
// ---------------------------------------------------------------------------

function names(list, ids, key = 'name') {
  if (!ids) return '-'
  const arr = Array.isArray(ids) ? ids : [ids]
  const mapped = arr
    .map((id) => {
      const el = list.find((x) => x.id === id)
      return el ? el[key] : id
    })
    .filter(Boolean)
  return mapped.length ? mapped.join(', ') : '-'
}

function resolve(list, id) {
  return id ? list.find((x) => x.id === id) || null : null
}

const FIELD_DEFS = {
  instance: [
    ['Instance Type', (r) => r.instanceType],
    ['Private IP', (r) => r.privateIp],
    ['Public IP', (r) => r.publicIp || '-'],
    ['Availability Zone', (r) => r.az],
    ['Security Groups', (r, d) => names(d.securityGroups, r.securityGroupIds, 'name')],
    ['Subnet', (r, d) => { const s = resolve(d.subnets, r.subnetId); return s ? s.name : r.subnetId }],
    ['VPC', (r, d) => { const v = resolve(d.vpcs, r.vpcId); return v ? v.name : r.vpcId }],
  ],
  subnet: [
    ['CIDR', (r) => r.cidr],
    ['Route Table', (r, d) => { const t = resolve(d.routeTables, r.routeTableId); return t ? t.name : r.routeTableId }],
    ['Resources', (r, d) => {
      const n = [...d.instances, ...d.databases].filter((x) => x.subnetId === r.id)
      return n.map((x) => x.name || x.identifier).join(', ') || 'None'
    }],
  ],
  vpc: [
    ['CIDR', (r) => r.cidr],
    ['Region', (r) => r.region],
    ['Subnets', (r, d) => names(d.subnets, r.subnetIds.filter ? r.subnetIds : [], 'name')],
    ['Internet Gateway', (r, d) => names(d.internetGateways, r.internetGatewayId)],
    ['NAT Gateways', (r, d) => names(d.natGateways, r.natGatewayIds, 'name')],
    ['Security Groups', (r, d) => names(d.securityGroups, r.securityGroupIds, 'name')],
  ],
  igw: [['VPC', (r, d) => { const v = resolve(d.vpcs, r.vpcId); return v ? v.name : r.vpcId }]],
  nat: [['VPC', (r, d) => { const v = resolve(d.vpcs, r.vpcId); return v ? v.name : r.vpcId }], ['Public IP', (r) => r.publicIp]],
  rt: [['VPC', (r, d) => { const v = resolve(d.vpcs, r.vpcId); return v ? v.name : r.vpcId }]],
  sg: [['VPC', (r, d) => { const v = resolve(d.vpcs, r.vpcId); return v ? v.name : r.vpcId }], ['Description', (r) => r.description]],
  alb: [['Type', (r) => r.type], ['Availability Zones', (r) => r.az], ['DNS', (r) => r.dnsName], ['VPC', (r, d) => { const v = resolve(d.vpcs, r.vpcId); return v ? v.name : r.vpcId }]],
  database: [
    ['Engine', (r) => `${r.engine} ${r.engineVersion || ''}`.trim()],
    ['Availability Zone', (r) => r.az],
    ['VPC', (r, d) => { const v = resolve(d.vpcs, r.vpcId); return v ? v.name : r.vpcId }],
    ['Subnet group', (r) => r.subnetGroupName],
  ],
  internet: [],
}

// إزاحة الـ kind من البيانات: بعض الأصناف في الـ topology مختلف عن اسم المورد
function resourceKindForNode(kind) {
  if (kind === 'rt') return 'rt'
  if (kind === 'route') return 'rt'
  return kind
}

function securityLabel(resource, node) {
  if (!resource) return null
  if (resource.securityStatus) {
    const map = { safe: 'Secure', warning: 'At risk', critical: 'Critical' }
    return map[resource.securityStatus] || resource.securityStatus
  }
  if (resource.openSshToWorld !== undefined) return resource.openSshToWorld ? 'Open to world' : 'Restricted'
  if (resource.encryption !== undefined) return resource.encryption ? 'Encrypted' : 'Unencrypted'
  if (node?.security) {
    const map = { warning: 'At risk', critical: 'Critical', safe: 'Secure' }
    return map[node.security]
  }
  return null
}
const securityBadgeClass = (label) => {
  if (label === 'Secure' || label === 'Restricted' || label === 'Encrypted') {
    return 'text-green-400 border-green-500/25 bg-green-500/10'
  }
  if (label === 'Critical') return 'text-red-400 border-red-500/25 bg-red-500/10'
  return 'text-amber-400 border-amber-500/25 bg-amber-500/10'
}

export default function ResourceDetailsPanel({ resource, infra, node, onClose }) {
  const acc = KIND_ACCENT[node?.kind] || 'text-slate-300'
  const listKey = node?.kind === 'database' ? 'database' : node?.kind
  const defs = (FIELD_DEFS[listKey] || []).slice()
  const status = resource?.state || resource?.status || node?.status
  const label = securityLabel(resource, node)

  return (
    <Panel className="h-full flex flex-col min-h-0">
      <div className="flex items-start justify-between gap-2 px-4 pt-4 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-base-panel2 border border-base-border flex items-center justify-center shrink-0">
            <KindIcon kind={node?.kind} className={'w-4 h-4 ' + acc} />
          </div>
          <div className="min-w-0">
            <p className="text-white text-[13.5px] font-semibold truncate">
              {resource?.name || resource?.identifier || node?.label}
            </p>
            <p className="text-slate-500 text-[11px] truncate">{node?.type || 'Resource'}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-white shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 px-4 mt-3 shrink-0 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-300 bg-base-panel2 border border-base-border rounded-md px-2 py-1 capitalize">
          <StatusDot status={status} />
          {status}
        </span>
        {label && (
          <span className={'text-[11px] font-medium px-2 py-1 rounded-md border ' + securityBadgeClass(label)}>
            {label}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar px-4 py-3 space-y-2.5">
        <div>
          <p className="text-slate-500 text-[10.5px]">Resource ID</p>
          <p className="text-slate-200 text-[12px] break-words">{resource?.id || node?.id || '-'}</p>
        </div>
        {defs.map(function(pair){
          var fieldLabel = pair[0], fn = pair[1]
          var val = '-'
          try { val = fn(resource, infra) } catch (e) { val = '-' }
          if (val === undefined || val === null || val === '') return null
          return React.createElement('div', { key: fieldLabel },
            React.createElement('p', { className: 'text-slate-500 text-[10.5px]' }, fieldLabel),
            React.createElement('p', { className: 'text-slate-200 text-[12px] break-words' }, String(val))
          )
        })}
      </div>
    </Panel>
  )
}
