// =====================================================================
// monitoringMockData.js
// بيانات وهمية (mock) لصفحة المراقبة (Monitoring).
//
// البنية مصممة لتوازي استجابة الـ backend المستقبلي:
//   GET /api/monitoring/summary
//   GET /api/monitoring/resources
//   GET /api/monitoring/metrics
//   GET /api/monitoring/alerts
//   GET /api/monitoring/activity
// كل مورد فيه stable ID وعلاقات. الـ components بتستهلك البيانات عن طريق
// props أو getMonitoringData() في services/api — مش hardcode داخل الكومبوننت.
// =====================================================================

// ---- Summary (مقاييس عامة في كروت أعلى الصفحة) -------------------------
export const monitoringSummary = {
  cpu: { value: 42.7, unit: '%', status: 'Normal', statusTone: 'green' },
  memory: { value: 58.2, unit: '%', status: 'Normal', statusTone: 'green' },
  network: { value: 1.84, unit: 'GB', status: '↑ 12%', statusTone: 'cyan' },
  healthyResources: { value: '7 / 8', status: '1 warning', statusTone: 'amber' },
  alerts: { value: 3, status: '2 high · 1 medium', statusTone: 'amber' },
  availability: { value: '99.94%', status: 'Last 30 days', statusTone: 'green' },
}

// ---- Monitored Resources -----------------------------------------------------
export const monitoredResources = [
  { id: 'mon-i-01', name: 'aegis-web-01', resourceId: 'i-0f8a13b1', type: 'EC2 Instance', status: 'Healthy', region: 'eu-west-1', az: 'eu-west-1a', cpu: 41, memory: 52, network: 0.84, availability: 99.97, lastUpdated: '2m ago', statusTone: 'green' },
  { id: 'mon-i-02', name: 'aegis-web-02', resourceId: 'i-0f9c5a7d2', type: 'EC2 Instance', status: 'Healthy', region: 'eu-west-1', az: 'eu-west-1b', cpu: 38, memory: 47, network: 0.72, availability: 99.99, lastUpdated: '2m ago', statusTone: 'green' },
  { id: 'mon-alb-01', name: 'aegis-alb', resourceId: 'alb-0e1d2c3f', type: 'Load Balancer', status: 'Healthy', region: 'eu-west-1', az: 'eu-west-1a / 1b', cpu: 23, memory: 31, network: 2.4, availability: 100.0, lastUpdated: '3m ago', statusTone: 'green' },
  { id: 'mon-db-01', name: 'aegis-db', resourceId: 'db-0d4c2a6d', type: 'RDS Database', status: 'Warning', region: 'eu-west-1', az: 'eu-west-1a', cpu: 68, memory: 74, network: 0.35, availability: 99.82, lastUpdated: '1m ago', statusTone: 'amber' },
  { id: 'mon-nat-01', name: 'aegis-nat-a', resourceId: 'nat-0a8d8e1f', type: 'NAT Gateway', status: 'Healthy', region: 'eu-west-1', az: 'eu-west-1a', cpu: 17, memory: 22, network: 1.25, availability: 99.9, lastUpdated: '4m ago', statusTone: 'green' },
  { id: 'mon-vpc-01', name: 'aegis-vpc', resourceId: 'vpc-0a1b2c3d', type: 'VPC', status: 'Healthy', region: 'eu-west-1', az: '-', cpu: 0, memory: 0, network: 4.1, availability: 99.99, lastUpdated: '5m ago', statusTone: 'green' },
  { id: 'mon-s3-01', name: 'aegis-logs-prod', resourceId: 'aegis-logs', type: 'S3 Bucket', status: 'Healthy', region: 'eu-west-1', az: '-', cpu: 0, memory: 0, network: 0.22, availability: 99.94, lastUpdated: '6m ago', statusTone: 'green' },
]
// ---- Time-series metrics (samples over last hour = 12 points per metric) -----
const _c = [28, 36, 31, 45, 52, 47, 41, 55, 48, 43, 39, 47]
const _m = [50, 52, 55, 54, 58, 57, 60, 59, 61, 60, 58, 62]
const _ni = [12, 26, 18, 33, 45, 30, 22, 41, 36, 28, 19, 31]
const _no = [8, 14, 12, 22, 31, 24, 17, 29, 25, 19, 13, 21]
const _dk = [61, 61, 61, 62, 62, 62, 63, 63, 63, 64, 64, 64]
const _t = ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30', '10:35', '10:40', '10:45', '10:50', '10:55']

export const metricsTimeSeries = {
  cpu: _c.map((value, i) => ({ t: _t[i], value })),
  memory: _m.map((value, i) => ({ t: _t[i], value })),
  networkIn: _ni.map((value, i) => ({ t: _t[i], value })),
  networkOut: _no.map((value, i) => ({ t: _t[i], value })),
  disk: _dk.map((value, i) => ({ t: _t[i], value })),
}

// ---- CPU + Memory chart (تستخدم نفس محور الوقت) ------------------------------
export const cpuMemorySeries = _t.map((t, i) => ({ t, cpu: _c[i], memory: _m[i] }))

// ---- Network traffic chart -----------------------------------------------------
export const networkTrafficSeries = _t.map((t, i) => ({ t, in: _ni[i], out: _no[i] }))

// ---- Monitoring Alerts --------------------------------------------------------
export const monitoringAlerts = [
  { id: 'al-101', title: 'High CPU utilization', severity: 'High', resource: 'aegis-web-01', resourceId: 'mon-i-01', value: 'CPU 87%', threshold: '> 80%', time: '5 min ago', status: 'Active' },
  { id: 'al-102', title: 'Memory threshold exceeded', severity: 'High', resource: 'aegis-db', resourceId: 'mon-db-01', value: 'Memory 91%', threshold: '> 85%', time: '12 min ago', status: 'Active' },
  { id: 'al-103', title: 'Network traffic spike', severity: 'Medium', resource: 'aegis-alb', resourceId: 'mon-alb-01', value: 'In 2.4 GB', threshold: '> 2.0 GB', time: '22 min ago', status: 'Active' },
  { id: 'al-104', title: 'Disk utilization high', severity: 'Medium', resource: 'aegis-db', resourceId: 'mon-db-01', value: 'Disk 84%', threshold: '> 80%', time: '41 min ago', status: 'Active' },
  { id: 'al-105', title: 'Instance health check failed', severity: 'Low', resource: 'aegis-web-02', resourceId: 'mon-i-02', value: '1 sniff failure', threshold: '3 in 60s', time: '1h ago', status: 'Resolved' },
]

// ---- Recent Activity ----------------------------------------------------------
export const recentActivity = [
  { id: 'act-01', action: 'Resource started', resource: 'aegis-web-02', type: 'instance', resourceId: 'mon-i-02', time: '2 min ago' },
  { id: 'act-02', action: 'Alert triggered', resource: 'aegis-db', type: 'database', resourceId: 'mon-db-01', time: '12 min ago', severity: 'High' },
  { id: 'act-03', action: 'Threshold exceeded', resource: 'aegis-alb', type: 'alb', resourceId: 'mon-alb-01', time: '22 min ago', severity: 'Medium' },
  { id: 'act-04', action: 'Health restored', resource: 'aegis-web-01', type: 'instance', resourceId: 'mon-i-01', time: '35 min ago' },
  { id: 'act-05', action: 'Alert resolved', resource: 'aegis-web-02', type: 'instance', resourceId: 'mon-i-02', time: '1h ago' },
  { id: 'act-06', action: 'Resource stopped', resource: 'aegis-app-01', type: 'instance', resourceId: 'mon-i-03', time: '3h ago' },
]

// ---- Document root (mirrors /api/monitoring response) ------------------------
export const monitoring = {
  summary: monitoringSummary,
  resources: monitoredResources,
  metrics: metricsTimeSeries,
  alerts: monitoringAlerts,
  activity: recentActivity,
}
