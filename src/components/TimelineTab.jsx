// components/TimelineTab.jsx

import React, { useState } from 'react'
import { SourceBadge, EmptyState } from './UI.jsx'

export default function TimelineTab({ timeline = [] }) {
  const [sourceFilter, setSourceFilter] = useState('all')

  const filtered = sourceFilter === 'all'
    ? timeline
    : timeline.filter(e => e.source === sourceFilter)

  return (
    <div style={{ animation: 'fade-in 0.2s ease' }}>
      {/* Source filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['all', 'video', 'audio'].map(f => (
          <button key={f} onClick={() => setSourceFilter(f)} style={{
            background: sourceFilter === f ? 'var(--bg-elevated)' : 'transparent',
            border: `1px solid ${sourceFilter === f ? 'var(--border-bright)' : 'var(--border)'}`,
            color: sourceFilter === f ? 'var(--text-primary)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            padding: '4px 10px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'var(--transition)',
          }}>
            {f === 'all' ? `All (${timeline.length})` : `${f} (${timeline.filter(e => e.source === f).length})`}
          </button>
        ))}
      </div>

      {/* Timeline entries */}
      {filtered.length === 0
        ? <EmptyState icon="📋" message="No events in this view" />
        : (
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute',
              left: 52,
              top: 0, bottom: 0,
              width: 1,
              background: 'var(--border)',
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {filtered.map((ev, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  padding: '8px 0',
                  animation: 'fade-in 0.15s ease',
                  animationDelay: `${i * 0.02}s`,
                  animationFillMode: 'both',
                }}>
                  {/* Timestamp */}
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    width: 48,
                    flexShrink: 0,
                    paddingTop: 2,
                    textAlign: 'right',
                  }}>
                    {ev.timestamp}
                  </span>

                  {/* Dot */}
                  <div style={{
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: ev.source === 'audio' ? 'var(--blue)' : 'rgba(167,139,250,1)',
                    border: '2px solid var(--bg-base)',
                    marginTop: 4,
                    flexShrink: 0,
                    zIndex: 1,
                    boxShadow: ev.source === 'audio' ? '0 0 6px var(--blue)' : '0 0 6px rgba(167,139,250,0.8)',
                  }} />

                  {/* Content */}
                  <div style={{ flex: 1, paddingBottom: 8, borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <SourceBadge source={ev.source} />
                      {ev.confidence != null && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
                          {Math.round(ev.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {ev.event}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }
    </div>
  )
}
