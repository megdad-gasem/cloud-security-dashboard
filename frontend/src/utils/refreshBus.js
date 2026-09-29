// =====================================================================
// refreshBus.js
// حافلة تحديث خفيفة بلا أي اعتماديات (subscribe/emit فقط).
// بتسمح لزر Refresh في DashboardHeader بتنبيه بانلات الداشبورد
// (StatsRow / InstancesTable / SecurityEvents) لإعادة جلب بياناتها
// من غير ربط المكوّنات ببعضها. معزولة للـ Dashboard فقط.
// =====================================================================

const listeners = new Set()

export function subscribeRefresh(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function emitRefresh() {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch (error) {
      console.error('refresh listener error:', error)
    }
  })
}