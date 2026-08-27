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