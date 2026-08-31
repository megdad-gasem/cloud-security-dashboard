const API_URL = 'http://127.0.0.1:8000'

export async function getSecurityEvents() {
  const response = await fetch(`${API_URL}/api/events`)

  if (!response.ok) {
    throw new Error('Failed to fetch security events')
  }

  return response.json()
}

export async function getInstances() {
  const response = await fetch(`${API_URL}/api/instances`)

  if (!response.ok) {
    throw new Error('Failed to fetch instances')
  }

  return response.json()
}

export async function getAlerts() {
  const response = await fetch(`http://127.0.0.1:8000/api/alerts`)

  if (!response.ok) {
    throw new Error('Failed to fetch alerts')
  }

  return response.json()
  }

// ---------------------------------------------------------------------------
// Infrastructure
//
// مُعزل: صفحة البنية التحتية بتستخدم دالة API بدل ما تكلم الـ backend مباشرة.
// حالياً بنرجع بيانات mock من infrastructureData.js. لما يتوفر الـ backend الحقيقي
// (GET /api/infrastructure) استبدل الـ body بالنداء دي بس — مش هتعدّل الصفحة.
// ---------------------------------------------------------------------------
import {
  infrastructure,
  infrastructureFindings,
  topologyNodes,
  topologyLinks,
} from '../data/infrastructureData'

export async function getInfrastructure() {
  // TODO: replace with  const res = await fetch(`${API_URL}/api/infrastructure`)
  // when the real backend is ready.
  // نحاكي تأخير شبكة صغير عشان الـ loading spinner يبان.
  await new Promise((resolve) => setTimeout(resolve, 450))
  return {
    infrastructure,
    findings: infrastructureFindings,
    topology: { nodes: topologyNodes, links: topologyLinks },
  }
}

// ---------------------------------------------------------------------------
// Monitoring
// مُعزل: الـ Monitoring page بتستخدم دالة API بدل ما تكلم الـ backend مباشرة.
// حالياً بنرجع mock من monitoringMockData.js. لما يتوفر الـ backend الحقيقي
// (GET /api/monitoring/...) استبدل الـ body بالنداءات دي بس — مش هتعدّل الصفحة.
// ---------------------------------------------------------------------------
import { monitoring } from '../data/monitoringMockData'

export async function getMonitoringData() {
  // TODO: replace with parallel fetches to /api/monitoring/{summary,resources,metrics,alerts,activity}
  await new Promise((resolve) => setTimeout(resolve, 500))
  return monitoring
}