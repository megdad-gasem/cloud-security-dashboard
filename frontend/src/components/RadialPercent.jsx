import React from 'react'
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'

/**
 * RadialPercent
 * دائرة نسبة مئوية بسيطة (مستخدمة في كارت Compliance Score)
 * props:
 *   - percent: رقم من 0 إلى 100
 *   - color: hex color للدائرة
 *   - size: قطر الدائرة بالبكسل
 */
export default function RadialPercent({ percent = 0, color = '#A855F7', size = 56 }) {
  const data = [{ name: 'value', value: percent, fill: color }]
  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <RadialBarChart
        width={size}
        height={size}
        cx="50%"
        cy="50%"
        innerRadius="70%"
        outerRadius="100%"
        barSize={5}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar background={{ fill: '#1B2839' }} dataKey="value" cornerRadius={10} angleAxisId={0} />
      </RadialBarChart>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-[11px] font-semibold">{percent}%</span>
      </div>
    </div>
  )
}
