// api.js — centralised API client
// All calls hit the FastAPI backend at localhost:8000

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

// Upload MP4 + MP3 and start analysis job
export async function startAnalysis(videoFile, audioFile) {
  const form = new FormData()
  form.append('video', videoFile)
  form.append('audio', audioFile)

  const res = await fetch(`${BASE}/analyse`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Upload failed (${res.status})`)
  }
  return res.json()  // { job_id, status, message }
}

// Poll job status
export async function getJobStatus(jobId) {
  const res = await fetch(`${BASE}/jobs/${jobId}`)
  if (!res.ok) throw new Error(`Status check failed (${res.status})`)
  return res.json()  // { job_id, status, progress, current_phase }
}

// Fetch full analysis result
export async function getResults(jobId) {
  const res = await fetch(`${BASE}/results/${jobId}`)
  if (res.status === 202) return null  // still processing
  if (!res.ok) throw new Error(`Results fetch failed (${res.status})`)
  return res.json()
}

// List all jobs
export async function listJobs() {
  const res = await fetch(`${BASE}/jobs`)
  if (!res.ok) return []
  const data = await res.json()
  return data.jobs || []
}

// Delete a job
export async function deleteJob(jobId) {
  await fetch(`${BASE}/jobs/${jobId}`, { method: 'DELETE' })
}

// PDF report download URL
export function reportUrl(jobId) {
  return `${BASE}/report/${jobId}`
}

// WebSocket for real-time progress
export function connectProgressWS(jobId, onMessage, onClose) {
  const ws = new WebSocket(`${WS_BASE}/progress/${jobId}`)
  ws.onmessage = (e) => onMessage(JSON.parse(e.data))
  ws.onclose   = onClose
  ws.onerror   = () => ws.close()
  return ws
}
