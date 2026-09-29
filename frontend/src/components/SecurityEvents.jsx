import React, { useEffect, useState, useCallback } from 'react'
import {
  ShieldAlert,
  UserCog,
  Database,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { getSecurityEvents } from '../services/api'
import { navigate } from '../store/securityCenter'
import { subscribeRefresh } from '../utils/refreshBus'
import { SeverityChip } from './pages/ui'

const EVENT_ICONS = [
  ShieldAlert,
  UserCog,
  Database,
  ShieldCheck,
  CheckCircle2,
]

const DOT_COLOR = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-blue-500',
  CRITICAL: 'bg-red-500',
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return '-'

  const eventDate = new Date(dateString)

  if (Number.isNaN(eventDate.getTime())) return '-'

  const diffSeconds = Math.floor(
    (Date.now() - eventDate.getTime()) / 1000
  )

  if (diffSeconds < 60) return 'Now'

  const diffMinutes = Math.floor(diffSeconds / 60)

  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)

  return `${diffDays}d ago`
}

export default function SecurityEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSecurityEvents()
      setEvents(data)
      setError(null)
    } catch (err) {
      console.error('SECURITY EVENTS ERROR:', err)
      setError(err.message || 'Failed to load security events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // زر Refresh في DashboardHeader بيعيد الجلب من خلال حافلة التحديث
    const unsubscribe = subscribeRefresh(load)
    return unsubscribe
  }, [load])
  return (
    <div className="bg-base-panel border border-base-border rounded-xl p-4 flex flex-col h-full min-h-0">

      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-white text-[14px] font-semibold">
          Recent Security Events
        </h3>

        {/* بيفتح صفحة Logs الفعلية — مش زر شكلي */}
        <button
          onClick={() => navigate('logs')}
          className="text-blue-400 text-[12px] hover:underline"
        >
          View all
        </button>
      </div>

      <div className="flex-1 min-h-0 mt-2 space-y-1 overflow-y-auto thin-scrollbar">

        {loading && (
          <p className="text-slate-500 text-[12px] py-4">
            Loading security events...
          </p>
        )}

        {error && (
          <div className="py-4">
            <p className="text-red-400 text-[12px]">
              {error}
            </p>
            <button onClick={load} className="mt-1 text-blue-400 text-[12px] hover:underline">Retry</button>
          </div>
        )}

        {!loading && !error && events.map((event, idx) => {
          const Icon = EVENT_ICONS[idx % EVENT_ICONS.length]
          const severityRaw = event.severity || 'Low'
          const severityTitleCase = severityRaw.charAt(0).toUpperCase() + severityRaw.slice(1).toLowerCase()
          const severityUpper = severityRaw.toUpperCase()

          return (
            <div
              key={event.id}
              className="flex items-center gap-2.5 py-1.5"
            >

              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  DOT_COLOR[severityUpper] || 'bg-slate-400'
                }`}
              />

              <Icon
                className="w-4 h-4 text-slate-500 shrink-0"
                strokeWidth={2}
              />

              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-[12.5px] font-medium truncate">
                  {event.title}
                </p>

                <p className="text-slate-500 text-[11px] truncate">
                  {event.source}
                </p>
              </div>

              <div className="text-right shrink-0">
                <SeverityChip severity={severityTitleCase} />

                <p className="text-slate-600 text-[10.5px] mt-1">
                  {formatRelativeTime(event.detected_at)}
                </p>
              </div>

            </div>
          )
        })}

      </div>
    </div>
  )
}
