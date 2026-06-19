// components/UploadPanel.jsx
// Left sidebar: file upload + job history list

import React, { useState, useRef } from 'react'
import { SectionLabel, PulseDot, ProgressBar, Spinner } from './UI.jsx'
import { startAnalysis, connectProgressWS, deleteJob, reportUrl } from '../api.js'

const PHASE_COLORS = {
  complete: 'var(--green)',
  failed:   'var(--red)',
  processing:'var(--amber)',
  queued:   'var(--text-secondary)',
}

function DropZone({ label, accept, icon, file, onFile }) {
  const [drag, setDrag] = useState(false)
  const ref = useRef()

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => ref.current.click()}
      style={{
        border: `1.5px dashed ${drag ? 'var(--green)' : file ? 'var(--border-bright)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '14px 12px',
        cursor: 'pointer',
        background: drag ? 'var(--green-glow)' : file ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        transition: 'var(--transition)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }}
        onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
        {file
          ? <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </div>
          : <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Drop or click to select</div>
        }
      </div>
      {file && <span style={{ color: 'var(--green)', fontSize: 16 }}>✓</span>}
    </div>
  )
}

function JobRow({ job, onSelect, isSelected }) {
  const statusColor = PHASE_COLORS[job.status] || 'var(--text-secondary)'
  return (
    <div
      onClick={() => onSelect(job)}
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        background: isSelected ? 'var(--bg-hover)' : 'transparent',
        border: `1px solid ${isSelected ? 'var(--border-bright)' : 'transparent'}`,
        cursor: 'pointer',
        transition: 'var(--transition)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
          {job.job_id}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {job.status === 'processing' && <Spinner size={10} />}
          <span style={{ color: statusColor, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {job.status}
          </span>
        </div>
      </div>
      {job.status === 'processing' && (
        <ProgressBar value={job.progress} />
      )}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {new Date(job.created_at).toLocaleTimeString()}
        {job.status === 'processing' && ` · ${job.phase}`}
      </div>
    </div>
  )
}

export default function UploadPanel({ jobs, onJobStart, onJobSelect, selectedJobId, onJobsChange }) {
  const [videoFile, setVideoFile] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canAnalyse = videoFile && audioFile && !loading

  const handleAnalyse = async () => {
    setError('')
    setLoading(true)
    try {
      const { job_id } = await startAnalysis(videoFile, audioFile)
      setVideoFile(null)
      setAudioFile(null)
      onJobStart(job_id)

      // Connect WebSocket for live progress
      const ws = connectProgressWS(
        job_id,
        (msg) => onJobsChange(job_id, msg),
        () => {}
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: 260,
      flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <PulseDot />
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.02em' }}>NSG · ANALYSIS</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          ICP SURVEILLANCE PLATFORM v1.0
        </div>
      </div>

      {/* Upload section */}
      <div style={{ padding: 14, borderBottom: '1px solid var(--border)' }}>
        <SectionLabel>New Analysis</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <DropZone label="Video footage" accept=".mp4,video/mp4" icon="🎬" file={videoFile} onFile={setVideoFile} />
          <DropZone label="Audio recording" accept=".mp3,audio/mpeg" icon="🎙️" file={audioFile} onFile={setAudioFile} />
        </div>

        {error && (
          <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--red)' }}>
            {error}
          </div>
        )}

        <button
          disabled={!canAnalyse}
          onClick={handleAnalyse}
          style={{
            marginTop: 10,
            width: '100%',
            padding: '9px 14px',
            background: canAnalyse ? 'var(--green)' : 'var(--bg-elevated)',
            color: canAnalyse ? '#0B0F14' : 'var(--text-muted)',
            border: `1px solid ${canAnalyse ? 'var(--green)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            cursor: canAnalyse ? 'pointer' : 'not-allowed',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {loading ? <><Spinner size={12} color="#0B0F14" /> SUBMITTING…</> : '▶ RUN ANALYSIS'}
        </button>
      </div>

      {/* Modules list */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
        <SectionLabel>Detection Modules</SectionLabel>
        {[
          ['🎯', 'Object & weapon detection'],
          ['👤', 'Person & face detection'],
          ['🏃', 'Activity & movement'],
          ['⚠️', 'Anomaly detection'],
          ['💥', 'Gunshot detection'],
          ['🎙️', 'Speaker identification'],
          ['🔑', 'Keyword & sentiment'],
        ].map(([icon, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0' }}>
            <span style={{ fontSize: 11 }}>{icon}</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 4px var(--green)' }} />
          </div>
        ))}
      </div>

      {/* Job history */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 14px 6px' }}>
          <SectionLabel>Job History ({jobs.length})</SectionLabel>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
          {jobs.length === 0
            ? <div style={{ padding: '12px 6px', fontSize: 11, color: 'var(--text-muted)' }}>No jobs yet</div>
            : [...jobs].reverse().map(job => (
                <JobRow
                  key={job.job_id}
                  job={job}
                  onSelect={onJobSelect}
                  isSelected={job.job_id === selectedJobId}
                />
              ))
          }
        </div>
      </div>
    </div>
  )
}
