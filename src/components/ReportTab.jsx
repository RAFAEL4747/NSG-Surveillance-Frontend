// components/ReportTab.jsx

import React from 'react'
import { StatCard, EmptyState } from './UI.jsx'
import { reportUrl } from '../api.js'

export default function ReportTab({ result }) {
  if (!result) return <EmptyState icon="📄" message="No report available" />

  const { summary, job_id, report_path, audio_anomalies = [] } = result

  return (
    <div style={{ animation: 'fade-in 0.2s ease' }}>
      {/* Overall threat level banner */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        marginBottom: 18,
        background: summary.overall_threat_level === 'high'
          ? 'var(--red-dim)'
          : summary.overall_threat_level === 'medium'
          ? 'var(--amber-dim)'
          : 'var(--green-glow)',
        border: `1px solid ${
          summary.overall_threat_level === 'high'   ? 'rgba(239,68,68,0.35)'   :
          summary.overall_threat_level === 'medium' ? 'rgba(245,158,11,0.3)'   :
          'rgba(0,229,160,0.3)'
        }`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.08em', marginBottom: 4 }}>
            OVERALL THREAT ASSESSMENT
          </div>
          <div style={{
            fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-mono)',
            color: summary.overall_threat_level === 'high'   ? 'var(--red)' :
                   summary.overall_threat_level === 'medium' ? 'var(--amber)' : 'var(--green)',
            letterSpacing: '0.05em',
          }}>
            {summary.overall_threat_level.toUpperCase()}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right' }}>
          <div>Job: {job_id}</div>
          <div>Duration: {summary.duration_analysed}</div>
          <div>Frames: {summary.frames_processed}</div>
        </div>
      </div>

      {/* Summary stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
        <StatCard label="Persons detected"   value={summary.persons_detected}   accent="var(--blue)" />
        <StatCard label="Faces recognised"   value={summary.faces_recognised}   accent="var(--blue)" />
        <StatCard label="Watchlist matches"  value={summary.watchlist_matches}  accent={summary.watchlist_matches > 0 ? 'var(--red)' : 'var(--green)'} />
        <StatCard label="Objects flagged"    value={summary.objects_flagged}    accent="var(--amber)" />
        <StatCard label="Threats flagged"    value={summary.threats_flagged}    accent={summary.threats_flagged > 0 ? 'var(--red)' : 'var(--green)'} />
        <StatCard label="Audio anomalies"    value={summary.audio_anomalies}    accent="var(--amber)" />
      </div>

      {/* Audio anomalies table */}
      {audio_anomalies.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Audio Anomalies
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {audio_anomalies.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', width: 52 }}>{a.timestamp}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 3,
                  background: a.anomaly_type === 'gunshot' ? 'var(--red-dim)' : 'var(--amber-dim)',
                  color: a.anomaly_type === 'gunshot' ? 'var(--red)' : 'var(--amber)',
                }}>
                  {a.anomaly_type.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1 }}>{a.detail}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                  {Math.round(a.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download PDF */}
      {report_path && (
        <a
          href={reportUrl(job_id)}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: 'var(--green)',
            color: '#0B0F14',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textDecoration: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 12px var(--green-glow)',
          }}
        >
          ↓ DOWNLOAD PDF REPORT
        </a>
      )}
      {!report_path && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          PDF report not generated — ensure ReportLab is installed on the backend.
        </div>
      )}
    </div>
  )
}
