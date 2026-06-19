// components/UI.jsx — shared primitive components

import React from 'react'

/* ── Severity badge ─────────────────────────────────────────────────────── */
const SEV_STYLE = {
  high:   { background: 'var(--red-dim)',   color: 'var(--red)',   border: '1px solid rgba(239,68,68,0.3)' },
  medium: { background: 'var(--amber-dim)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.3)' },
  low:    { background: 'var(--green-glow)',color: 'var(--green)', border: '1px solid rgba(0,229,160,0.3)' },
}

export function SeverityBadge({ level }) {
  const s = SEV_STYLE[level] || SEV_STYLE.low
  return (
    <span style={{
      ...s,
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 3,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {level}
    </span>
  )
}

/* ── Source badge ───────────────────────────────────────────────────────── */
export function SourceBadge({ source }) {
  const isAudio = source === 'audio'
  return (
    <span style={{
      background: isAudio ? 'var(--blue-dim)' : 'rgba(139,92,246,0.12)',
      color:      isAudio ? 'var(--blue)'     : '#A78BFA',
      border:     isAudio ? '1px solid rgba(56,189,248,0.25)' : '1px solid rgba(167,139,250,0.25)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 600,
      padding: '2px 7px',
      borderRadius: 3,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {source}
    </span>
  )
}

/* ── Stat card ──────────────────────────────────────────────────────────── */
export function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <span style={{ color: accent || 'var(--green)', fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
    </div>
  )
}

/* ── Section label ──────────────────────────────────────────────────────── */
export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

/* ── Divider ────────────────────────────────────────────────────────────── */
export function Divider({ style }) {
  return <div style={{ height: 1, background: 'var(--border)', ...style }} />
}

/* ── Spinner ────────────────────────────────────────────────────────────── */
export function Spinner({ size = 16, color = 'var(--green)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid transparent`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

/* ── Progress bar ───────────────────────────────────────────────────────── */
export function ProgressBar({ value, color = 'var(--green)' }) {
  return (
    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${value}%`,
        background: color,
        borderRadius: 2,
        transition: 'width 0.4s ease',
        boxShadow: `0 0 8px ${color}`,
      }} />
    </div>
  )
}

/* ── Live pulse dot ─────────────────────────────────────────────────────── */
export function PulseDot({ color = 'var(--green)' }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 7, height: 7,
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 6px ${color}`,
      animation: 'pulse-dot 1.4s ease-in-out infinite',
      flexShrink: 0,
    }} />
  )
}

/* ── Tab bar ────────────────────────────────────────────────────────────── */
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: 2,
      borderBottom: '1px solid var(--border)',
      marginBottom: 16,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${active === t.id ? 'var(--green)' : 'transparent'}`,
            color: active === t.id ? 'var(--green)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            fontWeight: active === t.id ? 600 : 400,
            padding: '8px 14px',
            cursor: 'pointer',
            marginBottom: -1,
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {t.icon && <span style={{ fontSize: 13 }}>{t.icon}</span>}
          {t.label}
          {t.count != null && (
            <span style={{
              background: active === t.id ? 'var(--green-glow)' : 'var(--bg-elevated)',
              color: active === t.id ? 'var(--green)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              padding: '1px 5px',
              borderRadius: 3,
            }}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

/* ── Empty state ────────────────────────────────────────────────────────── */
export function EmptyState({ icon, message }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      color: 'var(--text-muted)',
      gap: 10,
    }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 12 }}>{message}</span>
    </div>
  )
}
