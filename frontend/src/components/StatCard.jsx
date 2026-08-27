import React from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

// خرائط ألوان Tailwind حسب اللون المُمرر - لازم نكتبها كاملة (مش تركيب ديناميكي)
// لأن Tailwind بيقرا الكلاسات بشكل ثابت وقت الـ build
const COLOR_MAP = {
  green: {
    iconBg: 'bg-green-500/15',
    iconText: 'text-green-400',
    chart: '#22C55E',
  },
  red: {
    iconBg: 'bg-red-500/15',
    iconText: 'text-red-400',
    chart: '#EF4444',
  },
  amber: {
    iconBg: 'bg-amber-500/15',
    iconText: 'text-amber-400',
    chart: '#F59E0B',
  },
  purple: {
    iconBg: 'bg-purple-500/15',
    iconText: 'text-purple-400',
    chart: '#A855F7',
  },
}

/**
 * StatCard
 * كارت إحصائية علوي (مثال: EC2 Instances / Threats Detected / Active Alerts)
 * props:
 *   - icon: كومبوننت أيقونة من lucide-react
 *   - color: 'green' | 'red' | 'amber' | 'purple'
 *   - title: عنوان الكارت
 *   - value: القيمة الكبيرة
 *   - subtitle: عنصر JSX اختياري (نص صغير تحت القيمة)
 *   - sparklineData: مصفوفة أرقام بسيطة لرسم خط صغير (اختياري)
 *   - rightSlot: عنصر JSX اختياري يظهر أقصى اليمين (مثلاً دائرة النسبة)
 */
export default function StatCard({ icon: Icon, color = 'blue', title, value, subtitle, sparklineData, rightSlot }) {
  const c = COLOR_MAP[color] || COLOR_MAP.green
  const chartData = (sparklineData || []).map((v, i) => ({ i, v }))

  return (
    <div className="bg-base-panel border border-base-border rounded-xl p-4 flex items-center gap-3 min-w-0">
      <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${c.iconText}`} strokeWidth={2.2} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-[12px] truncate">{title}</p>
        <p className="text-white text-2xl font-semibold leading-tight">{value}</p>
        {subtitle && <div className="text-[11px] mt-0.5">{subtitle}</div>}
      </div>

      {rightSlot ? (
        rightSlot
      ) : chartData.length > 0 ? (
        <div className="w-20 h-10 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.chart} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={c.chart} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={c.chart} strokeWidth={1.5} fill={`url(#spark-${color})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  )
}
