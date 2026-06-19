// components/ProcessingView.jsx
// Shown while a job is running — radar-sweep signature animation

import React from 'react'
import { ProgressBar, Spinner } from './UI.jsx'

export default function ProcessingView({ job }) {
  const progress = job?.progress || 0
  const phase    = job?.phase    || 'Initialising…'

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      gap: 32,
      animation: 'fade-in 0.3s ease',
    }}>
      {/* Radar sweep — signature element */}
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        {/* Concentric rings */}
        {[1, 0.66, 0.33].map((scale, i) => (
          <div key={i} style={{
            position: 'absolute',
            inset: `${(1 - scale) * 50}%`,
            border: '1px solid',
            borderColor: i === 0 ? 'var(--border-bright)' : 'var(--border)',
            borderRadius: '50%',
          }} />
        ))}
        {/* Crosshairs */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: 1, background: 'var(--border)' }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 1, height: '100%', background: 'var(--border)' }} />
        </div>
        {/* Sweep arm */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '50%',
            height: 2,
            transformOrigin: '0 50%',
            background: `linear-gradient(90deg, var(--green), transparent)`,
            boxShadow: '0 0 8px var(--green)',
            animation: 'spin 2s linear infinite',
            marginTop: -1,
          }} />
        </div>
        {/* Scanline */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, var(--green), transparent)`,
            opacity: 0.6,
            animation: 'scanline 2.5s ease-in-out infinite',
          }} />
        </div>
        {/* Centre dot */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 8, height: 8,
          marginTop: -4, marginLeft: -4,
          borderRadius: '50%',
          background: 'var(--green)',
          boxShadow: '0 0 12px var(--green)',
        }} />
        {/* Progress arc label */}
        <div style={{
          position: 'absolute',
          bottom: -28,
          left: 0, right: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--green)',
        }}>
          {progress}%
        </div>
      </div>

      {/* Status */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
          <Spinner size={14} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            ANALYSING
          </span>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--green)',
          marginBottom: 16,
          animation: 'blink 1.2s step-end infinite',
        }}>
          {phase}
        </div>

        <div style={{ width: 280 }}>
          <ProgressBar value={progress} />
        </div>
      </div>

      {/* Phase checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 280 }}>
        {[
          [10, 'Video ingestion'],
          [20, 'Object detection'],
          [40, 'Face detection'],
          [55, 'Activity analysis'],
          [62, 'Audio ingestion'],
          [72, 'Gunshot detection'],
          [80, 'Speech transcription'],
          [88, 'Keyword analysis'],
          [93, 'Generating report'],
          [100,'Complete'],
        ].map(([threshold, label]) => {
          const done = progress >= threshold
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 14, height: 14, borderRadius: '50%',
                background: done ? 'var(--green)' : 'var(--bg-elevated)',
                border: `1px solid ${done ? 'var(--green)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8,
                color: '#0B0F14',
                flexShrink: 0,
                transition: 'var(--transition)',
                boxShadow: done ? '0 0 6px var(--green)' : 'none',
              }}>
                {done ? '✓' : ''}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: done ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'var(--transition)',
              }}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
