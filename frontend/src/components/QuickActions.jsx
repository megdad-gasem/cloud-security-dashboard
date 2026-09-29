import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ShieldAlert, Camera, Ban, FileText, RotateCw, Send, Server, Loader2, RefreshCw } from 'lucide-react'
import { quickActions } from '../data/mockData'
import { getInstances, getSecurityEvents, getAlerts } from '../services/api'
import { securityCenter, navigate } from '../store/securityCenter'

const ICONS = { ShieldAlert, Camera, Ban, FileText, RotateCw, Send }

const COLOR_MAP = {
  red: 'bg-red-500/15 text-red-400',
  purple: 'bg-purple-500/15 text-purple-400',
  amber: 'bg-amber-500/15 text-amber-400',
  blue: 'bg-blue-500/15 text-blue-400',
  green: 'bg-green-500/15 text-green-400',
}

// Map the Dashboard quick actions to the shared Aegis action catalog so the
// existing confirmation modal + dispatch flow is reused (no second modal system).
const ACTION_TYPE_BY_LABEL = {
  'Isolate Instance': 'isolate_instance',
  'Create Snapshot': 'create_snapshot',
  'Block IP Address': 'block_ip',
  'Restart Instance': 'restart_instance',
  'Send Notification': 'send_notification',
  'View Logs': 'view_logs',
}

// Actions that need a target selection step before confirmation
const NEEDS_TARGET = new Set([
  'isolate_instance',
  'restart_instance',
  'create_snapshot',
  'block_ip',
  'send_notification',
])

// -----------------------------------------------------------------------
// useApiResource — generic hook for fetching resource lists from the API.
// Returns { data, loading, error, retry }.
// Does NOT fall back to mock data. If the API is unreachable the selector
// shows a clear error with a Retry button.
// -----------------------------------------------------------------------
function useApiResource(fetchFn, enabled) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load resources')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    if (enabled) load()
  }, [enabled, load])

  return { data, loading, error, retry: load }
}

/**
 * QuickActions
 * كارت "Quick Actions" - شبكة 2×3 من الاختصارات.
 *
 * كل إجراء يحتاج هدف بيحمّل الأهداف المتاحة من الـ backend عبر الـ API client
 * الموجود (getInstances / getSecurityEvents / getAlerts). لو الـ backend مش
 * متاح بيظهر حالة خطأ مع زر إعادة محاولة — مفيش fallback لبيانات وهمية.
 *
 * السلوك بعد التأكيد:
 * - View Logs → بيفتح صفحة Logs فعلياً.
 * - باقي الإجراءات → مودال التأكيد الموحّد (ConfirmHost)، وبعد التأكيد
 *   توست صريح: "execution is not yet available; no changes were made."
 */
export default function QuickActions() {
  const [selector, setSelector] = useState(null) // { actionType, actionLabel, actionId }
  const [ipInput, setIpInput] = useState('')
  const selectorRef = useRef(null)

  // ---- API resource hooks ----
  // Only fetch when the selector for that resource type is open.
  const needsInstances = selector && ['isolate_instance', 'restart_instance', 'create_snapshot'].includes(selector.actionType)
  const needsAlerts = selector && selector.actionType === 'send_notification'

  const instancesApi = useApiResource(getInstances, needsInstances)
  const alertsApi = useApiResource(getAlerts, needsAlerts)

  // Close selector on outside click
  useEffect(() => {
    if (!selector) return
    const handler = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setSelector(null)
        setIpInput('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [selector])

  const handleQuickAction = (action) => {
    const actionType = ACTION_TYPE_BY_LABEL[action.label]
    if (!actionType) return

    // View Logs → direct navigation
    if (actionType === 'view_logs') {
      navigate('logs')
      return
    }

    // Actions that need target selection (fetches from API)
    if (NEEDS_TARGET.has(actionType)) {
      setSelector({ actionType, actionLabel: action.label, actionId: action.id })
      setIpInput('')
      return
    }

    // Fallback: should not normally reach here for the current Quick Actions
    securityCenter.requestAction({
      collection: 'quickActions',
      id: action.id,
      actionType,
      item: { name: action.label },
    })
  }

  // Called when a target is selected from the selector
  const handleTargetSelected = (targetItem) => {
    const sel = selector
    setSelector(null)
    setIpInput('')
    securityCenter.requestAction({
      collection: 'quickActions',
      id: sel.actionId,
      actionType: sel.actionType,
      item: targetItem,
    })
  }

  // ---- Shared loading / error / empty renderers ----
  const renderLoading = () => (
    <div className="flex items-center justify-center gap-2 px-3 py-6">
      <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
      <span className="text-slate-500 text-[11px]">Loading targets…</span>
    </div>
  )

  const renderError = (message, retryFn) => (
    <div className="flex flex-col items-center gap-2 px-3 py-4">
      <p className="text-red-400/80 text-[11px] text-center">{message}</p>
      <button
        onClick={retryFn}
        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10.5px] rounded-md transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        Retry
      </button>
    </div>
  )

  const renderEmpty = (resourceType) => (
    <p className="text-slate-500 text-[11px] px-3 py-4 text-center">
      No {resourceType} available from the backend.
    </p>
  )

  // ---- Instance selector (Isolate / Restart) ----
  const renderInstanceSelector = () => {
    if (instancesApi.loading) return renderLoading()
    if (instancesApi.error) return renderError(`Unable to load instances: ${instancesApi.error}`, instancesApi.retry)
    if (!instancesApi.data || instancesApi.data.length === 0) return renderEmpty('instances')

    const verb = selector.actionType === 'isolate_instance' ? 'isolate' : 'restart'
    return (
      <>
        <p className="text-slate-400 text-[10.5px] px-3 pt-2 pb-1">Select an instance to {verb}:</p>
        {instancesApi.data.map((inst) => (
          <button
            key={inst.id}
            onClick={() =>
              handleTargetSelected({
                name: selector.actionLabel,
                targetLabel: inst.name,
                targetId: String(inst.id),
                targetDescription:
                  selector.actionType === 'isolate_instance'
                    ? `This action will isolate ${inst.name} from normal network access. The instance will be placed in a restricted security group.`
                    : `This action will restart ${inst.name}. Running workloads will be interrupted during the reboot cycle.`,
                targetStatus: inst.status,
              })
            }
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-700/50 transition-colors text-left"
          >
            <Server className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-slate-200 text-[11px] font-medium truncate">{inst.name}</p>
              <p className="text-slate-500 text-[10px] truncate">
                ID: {inst.id} · {inst.status}{inst.public_ip ? ` · ${inst.public_ip}` : ''}
              </p>
            </div>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${inst.status === 'Running' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          </button>
        ))}
      </>
    )
  }

  // ---- Snapshot selector ----
  const renderSnapshotSelector = () => {
    if (instancesApi.loading) return renderLoading()
    if (instancesApi.error) return renderError(`Unable to load resources: ${instancesApi.error}`, instancesApi.retry)
    if (!instancesApi.data || instancesApi.data.length === 0) return renderEmpty('snapshotable resources')

    return (
      <>
        <p className="text-slate-400 text-[10.5px] px-3 pt-2 pb-1">Select a resource to snapshot:</p>
        {instancesApi.data.map((inst) => (
          <button
            key={inst.id}
            onClick={() =>
              handleTargetSelected({
                name: 'Create Snapshot',
                targetLabel: inst.name,
                targetId: String(inst.id),
                targetDescription: `Create an EBS snapshot of the volumes attached to ${inst.name} (ID: ${inst.id}).`,
                targetStatus: inst.status,
              })
            }
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-700/50 transition-colors text-left"
          >
            <Server className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-slate-200 text-[11px] font-medium truncate">{inst.name}</p>
              <p className="text-slate-500 text-[10px] truncate">ID: {inst.id} · {inst.status}</p>
            </div>
          </button>
        ))}
      </>
    )
  }

  // ---- Block IP selector ----
  // The backend SecurityEvent model (GET /api/events) does not currently carry
  // source IP addresses. Rather than inventing backend functionality or falling
  // back to mock data, we provide a manual IP input field that will work with
  // any future backend endpoint that returns blockable IPs.
  const renderIpSelector = () => {
    const trimmedInput = ipInput.trim()
    const isValidIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmedInput)

    return (
      <>
        <p className="text-slate-400 text-[10.5px] px-3 pt-2 pb-1">Enter an IP address to block:</p>
        <div className="px-3 pb-2.5 pt-1 flex items-center gap-1.5">
          <input
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            placeholder="e.g. 203.0.113.7"
            autoFocus
            className="flex-1 bg-base-panel2 border border-base-border rounded-md px-2 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValidIp) {
                handleTargetSelected({
                  name: 'Block IP Address',
                  targetLabel: trimmedInput,
                  targetId: trimmedInput,
                  targetDescription: `Block ${trimmedInput} from further access attempts.`,
                })
              }
            }}
          />
          <button
            disabled={!isValidIp}
            onClick={() => {
              if (isValidIp) {
                handleTargetSelected({
                  name: 'Block IP Address',
                  targetLabel: trimmedInput,
                  targetId: trimmedInput,
                  targetDescription: `Block ${trimmedInput} from further access attempts.`,
                })
              }
            }}
            className="px-2.5 py-1.5 bg-amber-600/80 text-white text-[10.5px] rounded-md font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
          >
            Block
          </button>
        </div>
        {trimmedInput && !isValidIp && (
          <p className="text-red-400/70 text-[10px] px-3 pb-2">Enter a valid IPv4 address.</p>
        )}
      </>
    )
  }

  // ---- Send Notification selector ----
  // Uses GET /api/alerts to show the current alert context.
  // The notification is scoped to the security team / active alert context.
  const renderNotificationSelector = () => {
    if (alertsApi.loading) return renderLoading()
    if (alertsApi.error) return renderError(`Unable to load alert context: ${alertsApi.error}`, alertsApi.retry)

    const activeAlerts = alertsApi.data ? alertsApi.data.filter((a) => a.status === 'Active') : []
    const alertCount = activeAlerts.length
    const contextLabel = alertCount > 0
      ? `${alertCount} active alert${alertCount > 1 ? 's' : ''}`
      : 'No active alerts'

    return (
      <>
        <p className="text-slate-400 text-[10.5px] px-3 pt-2 pb-1">Send a security notification:</p>
        <button
          onClick={() =>
            handleTargetSelected({
              name: 'Send Notification',
              targetLabel: 'Security Team',
              targetId: 'security-team',
              targetDescription: `Send a security alert notification to the operations team. Current context: ${contextLabel}.`,
            })
          }
          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-700/50 transition-colors text-left"
        >
          <Send className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-[11px] font-medium">Notify Security Team</p>
            <p className="text-slate-500 text-[10px]">Context: {contextLabel}</p>
          </div>
        </button>
      </>
    )
  }

  // ---- Selector dispatcher ----
  const renderSelectorContent = () => {
    if (!selector) return null
    switch (selector.actionType) {
      case 'isolate_instance':
      case 'restart_instance':
        return renderInstanceSelector()
      case 'create_snapshot':
        return renderSnapshotSelector()
      case 'block_ip':
        return renderIpSelector()
      case 'send_notification':
        return renderNotificationSelector()
      default:
        return null
    }
  }

  const getSelectorTitle = () => {
    if (!selector) return ''
    switch (selector.actionType) {
      case 'isolate_instance': return 'Isolate Instance'
      case 'restart_instance': return 'Restart Instance'
      case 'create_snapshot': return 'Create Snapshot'
      case 'block_ip': return 'Block IP Address'
      case 'send_notification': return 'Send Notification'
      default: return selector.actionLabel
    }
  }

  return (
    <div className="bg-base-panel border border-base-border rounded-xl p-4 flex flex-col h-full min-h-0 relative">
      <h3 className="text-white text-[14px] font-semibold shrink-0">Quick Actions</h3>

      <div className="flex-1 min-h-0 mt-2 grid grid-cols-3 grid-rows-2 gap-2">
        {quickActions.map((action) => {
          const Icon = ICONS[action.icon]
          return (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              aria-haspopup="dialog"
              aria-expanded={selector?.actionLabel === action.label}
              className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-base-panel2 border border-base-border hover:border-slate-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/40 transition-colors px-2"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${COLOR_MAP[action.color]}`}>
                <Icon className="w-4 h-4" strokeWidth={2} />
              </div>
              <span className="text-slate-300 text-[11px] text-center leading-tight">{action.label}</span>
            </button>
          )
        })}
      </div>

      {/* Target selector popover — overlays the QuickActions card */}
      {selector && (
        <div
          ref={selectorRef}
          className="absolute inset-x-2 top-10 z-30 bg-[#141922] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden"
          style={{ maxHeight: 'calc(100% - 48px)' }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-base-border bg-base-panel">
            <span className="text-white text-[12px] font-semibold">{getSelectorTitle()}</span>
            <button
              onClick={() => { setSelector(null); setIpInput('') }}
              className="text-slate-500 hover:text-slate-300 text-[11px] transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
            {renderSelectorContent()}
          </div>
        </div>
      )}
    </div>
  )
}