// components/AlertsTab.jsx

import React, { useState } from 'react'
import { SeverityBadge, SourceBadge, StatCard, EmptyState } from './UI.jsx'

export default function AlertsTab({ alerts = [], summary }) {
  const [filter, setFilter] = useState('all')

  const counts = {
    high:   alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low:    alerts.filter(a => a.severity === 'low').length,
  }

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)
  const sorted   = [...filtered].sort((a, b) => {
    const sev = { high: 0, medium: 1, low: 2 }
    return (sev[a.severity] - sev[b.severity]) || a.timestamp.localeCompare(b.timestamp)
  })

  return (
    <div style={{ animation: 'fade-in 0.2s ease' }}>
      {/* Stats */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
          <StatCard label="Persons detected"  value={summary.persons_detected}  accent="var(--blue)" />
          <StatCard label="High severity"     value={counts.high}               accent="var(--red)" />
          <StatCard label="Medium severity"   value={counts.medium}             accent="var(--amber)" />
          <StatCard label="Watchlist matches" value={summary.watchlist_matches} accent="var(--green)" />
        </div>
      )}

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[
          { id: 'all',    label: `All (${alerts.length})` },
          { id: 'high',   label: `High (${counts.high})`,   color: 'var(--red)' },
          { id: 'medium', label: `Medium (${counts.medium})`, color: 'var(--amber)' },
          { id: 'low',    label: `Low (${counts.low})`,     color: 'var(--green)' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            background: filter === f.id ? 'var(--bg-elevated)' : 'transparent',
            border: `1px solid ${filter === f.id ? (f.color || 'var(--border-bright)') : 'var(--border)'}`,
            color: filter === f.id ? (f.color || 'var(--text-primary)') : 'var(--text-muted)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            padding: '4px 10px',
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {sorted.length === 0
        ? <EmptyState icon="🛡️" message="No alerts for this filter" />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sorted.map((alert, i) => (
              <div key={i} style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${
                  alert.severity === 'high'   ? 'rgba(239,68,68,0.25)'   :
                  alert.severity === 'medium' ? 'rgba(245,158,11,0.2)'   :
                  'var(--border)'
                }`,
                borderLeft: `3px solid ${
                  alert.severity === 'high'   ? 'var(--red)'   :
                  alert.severity === 'medium' ? 'var(--amber)' :
                  'var(--green)'
                }`,
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                animation: 'fade-in 0.2s ease',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', flexShrink: 0 }}>
                  <SeverityBadge level={alert.severity} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                    {alert.timestamp}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <SourceBadge source={alert.alert_type} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 3 }}>
                      {alert.category?.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                      {Math.round(alert.confidence * 100)}% conf.
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {alert.description}
                  </div>
                  {alert.snapshot_path && (
                    <a
                      href={`http://localhost:8000/outputs/${alert.snapshot_path}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 10, color: 'var(--blue)', marginTop: 4, display: 'inline-block' }}
                    >
                      View snapshot ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
