// App.jsx — root component
import React, { useState, useEffect, useCallback } from 'react'
import UploadPanel     from './components/UploadPanel.jsx'
import ProcessingView  from './components/ProcessingView.jsx'
import AlertsTab       from './components/AlertsTab.jsx'
import TimelineTab     from './components/TimelineTab.jsx'
import HeatmapTab      from './components/HeatmapTab.jsx'
import ReportTab       from './components/ReportTab.jsx'
import { TabBar, PulseDot, Divider } from './components/UI.jsx'
import { listJobs, getResults } from './api.js'

const TABS = [
  { id: 'alerts',   label: 'Alerts',   icon: '⚠️' },
  { id: 'timeline', label: 'Timeline', icon: '📋' },
  { id: 'heatmap',  label: 'Heatmap',  icon: '🗺️' },
  { id: 'report',   label: 'Report',   icon: '📄' },
]

export default function App() {
  const [jobs,        setJobs]        = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [result,      setResult]      = useState(null)
  const [activeTab,   setActiveTab]   = useState('alerts')
  const [wsUpdates,   setWsUpdates]   = useState({})

  useEffect(() => { listJobs().then(setJobs).catch(() => {}) }, [])

  const handleJobsChange = useCallback((jobId, wsPayload) => {
    setWsUpdates(prev => ({ ...prev, [jobId]: wsPayload }))
    setJobs(prev => {
      const exists = prev.find(j => j.job_id === jobId)
      if (exists) return prev.map(j => j.job_id === jobId ? { ...j, ...wsPayload } : j)
      return [...prev, { job_id: jobId, created_at: new Date().toISOString(), ...wsPayload }]
    })
    if (wsPayload.status === 'complete') {
      getResults(jobId).then(r => { if (r) setResult(r) }).catch(() => {})
    }
  }, [])

  const handleJobStart = useCallback((jobId) => {
    const newJob = { job_id: jobId, status: 'processing', progress: 0, phase: 'Starting…', created_at: new Date().toISOString() }
    setJobs(prev => [...prev, newJob])
    setSelectedJob(newJob)
    setResult(null)
    setActiveTab('alerts')
  }, [])

  const handleJobSelect = useCallback((job) => {
    setSelectedJob(job)
    setResult(null)
    if (job.status === 'complete') {
      getResults(job.job_id).then(r => { if (r) setResult(r) }).catch(() => {})
    }
  }, [])

  const liveJob = selectedJob ? { ...selectedJob, ...(wsUpdates[selectedJob.job_id] || {}) } : null
  const isProcessing = liveJob?.status === 'processing' || liveJob?.status === 'queued'

  const tabsWithCounts = TABS.map(t => ({
    ...t,
    count: t.id === 'alerts' ? (result?.alerts?.length ?? null)
         : t.id === 'timeline' ? (result?.timeline?.length ?? null)
         : null,
  }))

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <UploadPanel jobs={jobs} onJobStart={handleJobStart} onJobSelect={handleJobSelect} selectedJobId={liveJob?.job_id} onJobsChange={handleJobsChange} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ height: 48, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0 }}>
          {liveJob ? (
            <>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}>JOB {liveJob.job_id}</span>
              <Divider style={{ width: 1, height: 16 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <PulseDot color={liveJob.status === 'complete' ? 'var(--green)' : liveJob.status === 'failed' ? 'var(--red)' : 'var(--amber)'} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{liveJob.status}</span>
              </div>
              {isProcessing && <><Divider style={{ width: 1, height: 16 }} /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)' }}>{liveJob.phase}</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{liveJob.progress}%</span></>}
              {result && <><Divider style={{ width: 1, height: 16 }} /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>{result.alerts?.length} alerts · {result.timeline?.length} events · {result.summary?.duration_analysed}</span></>}
            </>
          ) : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Upload an MP4 and MP3 to begin analysis</span>}
          <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}><LiveClock /></div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {!liveJob && <WelcomeState />}
          {liveJob && isProcessing && <ProcessingView job={liveJob} />}
          {liveJob && liveJob.status === 'failed' && (
            <div style={{ padding: 24, background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              Analysis failed: {liveJob.error || 'Unknown error'}
            </div>
          )}
          {liveJob && liveJob.status === 'complete' && result && (
            <>
              <TabBar tabs={tabsWithCounts} active={activeTab} onChange={setActiveTab} />
              {activeTab === 'alerts'   && <AlertsTab   alerts={result.alerts}     summary={result.summary} />}
              {activeTab === 'timeline' && <TimelineTab  timeline={result.timeline} />}
              {activeTab === 'heatmap'  && <HeatmapTab   heatmap={result.heatmap}  />}
              {activeTab === 'report'   && <ReportTab    result={result} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id) }, [])
  return <>{time.toLocaleTimeString('en-IN', { hour12: false })} IST</>
}

function WelcomeState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, paddingBottom: 60, animation: 'fade-in 0.4s ease' }}>
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 8 }}>
        {[1, 0.7, 0.4].map((s, i) => (
          <div key={i} style={{ position: 'absolute', inset: `${(1-s)*50}%`, border: `1px solid ${i===0?'var(--border-bright)':'var(--border)'}`, borderRadius: '50%' }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🛡️</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>NSG Surveillance Analysis</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 340, lineHeight: 1.6 }}>Upload an MP4 video and MP3 audio file using the panel on the left to begin AI-powered threat analysis.</div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        {[['🎯','Weapon detection'],['💥','Gunshot analysis'],['👤','Face recognition'],['🗺️','Activity heatmap']].map(([icon, label]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, minWidth: 90 }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
