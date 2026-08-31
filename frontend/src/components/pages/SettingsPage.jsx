import React from 'react'
import { Settings as Cog, Monitor, Shield, Bell, Server } from 'lucide-react'
import { PageHeader, Panel, PanelHeader, StatusText } from './ui'
import { securityCenter, useSecurityCenter } from '../../store/securityCenter'

function Toggle({ checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${checked ? 'bg-blue-600' : 'bg-base-border'}`}
    >
      <span className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

function Row({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-base-border last:border-0">
      <div className="min-w-0">
        <p className="text-slate-200 text-[12px] font-medium">{label}</p>
        {desc && <p className="text-slate-500 text-[10px] truncate">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <Panel className="flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-4 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-base-panel2 border border-base-border flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-300" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-white text-[13px] font-semibold">{title}</h3>
          {subtitle && <p className="text-slate-500 text-[10.5px]">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-2">{children}</div>
    </Panel>
  )
}

export default function SettingsPage() {
  useSecurityCenter()
  const s = securityCenter.state.settings

  // setSetting writes through the shared store (audit + toast), so configuration
  // changes are consistent with the rest of the action architecture.
  const toggle = (path) => {
    const keys = path.split('.')
    let obj = s
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
    securityCenter.setSetting(path, !obj[keys[keys.length - 1]])
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
      <PageHeader title="Settings" subtitle="Aegis configuration and integrations" />

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto thin-scrollbar">
        {/* Monitoring */}
        <Section icon={Monitor} title="Monitoring" subtitle="collection behavior">
          <Row label="Auto-refresh" desc="refresh dashboards automatically"><Toggle checked={s.monitoring.autoRefresh} onToggle={() => toggle('monitoring.autoRefresh')} /></Row>
          <Row label="Metrics polling" desc="pull CloudWatch metrics"><Toggle checked={s.monitoring.metricsPolling} onToggle={() => toggle('monitoring.metricsPolling')} /></Row>
          <Row label="Anomaly detection" desc="ML-based anomaly alerts"><Toggle checked={s.monitoring.anomalyDetection} onToggle={() => toggle('monitoring.anomalyDetection')} /></Row>
          <Row label="Refresh interval"><span className="text-slate-300 text-[11px]">{s.refreshInterval}</span></Row>
        </Section>

        {/* Security services */}
        <Section icon={Shield} title="Security" subtitle="enabled services">
          <Row label="GuardDuty"><Toggle checked={s.security.guardDuty} onToggle={() => toggle('security.guardDuty')} /></Row>
          <Row label="CloudTrail"><Toggle checked={s.security.cloudTrail} onToggle={() => toggle('security.cloudTrail')} /></Row>
          <Row label="AWS Config"><Toggle checked={s.security.config} onToggle={() => toggle('security.config')} /></Row>
          <Row label="Security Hub"><Toggle checked={s.security.securityHub} onToggle={() => toggle('security.securityHub')} /></Row>
          <Row label="WAF"><Toggle checked={s.security.waf} onToggle={() => toggle('security.waf')} /></Row>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications" subtitle="alert delivery">
          <Row label="Email" desc={s.notifications.emailAddress}><Toggle checked={s.notifications.email} onToggle={() => toggle('notifications.email')} /></Row>
          <Row label="Webhook" desc={s.notifications.webhook ? (s.notifications.webhookUrl || 'not set') : 'disabled'}><Toggle checked={s.notifications.webhook} onToggle={() => toggle('notifications.webhook')} /></Row>
        </Section>

        {/* API / system */}
        <Section icon={Server} title="API & System" subtitle="integration">
          <Row label="Environment"><span className="text-slate-300 text-[11px]">{s.environment}</span></Row>
          <Row label="Region"><span className="text-slate-300 text-[11px]">{s.region}</span></Row>
          <Row label="API base URL"><span className="text-slate-300 text-[10.5px] truncate max-w-[160px]">{s.api.baseUrl}</span></Row>
          <Row label="API version"><span className="text-slate-300 text-[11px]">{s.api.version}</span></Row>
          <Row label="Cache TTL"><span className="text-slate-300 text-[11px]">{s.api.cacheTtl}</span></Row>
        </Section>
      </div>
    </div>
  )
}
