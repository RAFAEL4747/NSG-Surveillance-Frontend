// components/HeatmapTab.jsx

import React from 'react'
import { EmptyState } from './UI.jsx'

function lerp(a, b, t) { return a + (b - a) * t }

function heatColor(v) {
  // 0 → dark teal, 0.5 → green, 1 → red/amber
  if (v < 0.5) {
    const t = v * 2
    return `rgb(${Math.round(lerp(11,0,t))}, ${Math.round(lerp(31,229,t))}, ${Math.round(lerp(60,160,t))})`
  } else {
    const t = (v - 0.5) * 2
    return `rgb(${Math.round(lerp(0,239,t))}, ${Math.round(lerp(229,68,t))}, ${Math.round(lerp(160,68,t))})`
  }
}

export default function HeatmapTab({ heatmap }) {
  if (!heatmap || !heatmap.cells || heatmap.cells.length === 0) {
    return <EmptyState icon="🗺️" message="No heatmap data available" />
  }

  const G     = heatmap.grid_size || 8
  const cells = heatmap.cells
  const max   = Math.max(...cells, 0.001)

  // Find hottest cell
  const maxIdx  = cells.indexOf(max)
  const maxRow  = Math.floor(maxIdx / G)
  const maxCol  = maxIdx % G

  // Zone labels
  const colLabels = Array.from({ length: G }, (_, i) => String.fromCharCode(65 + i))
  const rowLabels = Array.from({ length: G }, (_, i) => i + 1)

  return (
    <div style={{ animation: 'fade-in 0.2s ease' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Heatmap grid */}
        <div>
          <div style={{ marginBottom: 8 }}>
            {/* Column labels */}
            <div style={{ display: 'flex', gap: 3, paddingLeft: 24, marginBottom: 3 }}>
              {colLabels.map(c => (
                <div key={c} style={{ width: 36, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
                  {c}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {Array.from({ length: G }, (_, row) => (
              <div key={row} style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 3 }}>
                {/* Row label */}
                <div style={{ width: 20, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                  {rowLabels[row]}
                </div>

                {Array.from({ length: G }, (_, col) => {
                  const idx      = row * G + col
                  const v        = cells[idx] || 0
                  const norm     = v / max
                  const isHot    = row === maxRow && col === maxCol
                  const zoneId   = `${colLabels[col]}${rowLabels[row]}`
                  const pct      = Math.round(norm * 100)

                  return (
                    <div
                      key={col}
                      title={`Zone ${zoneId}: ${pct}% activity`}
                      style={{
                        width: 36, height: 36,
                        borderRadius: 4,
                        background: heatColor(norm),
                        border: isHot ? '2px solid var(--red)' : '1px solid rgba(255,255,255,0.04)',
                        position: 'relative',
                        cursor: 'default',
                        transition: 'transform 0.15s',
                        boxShadow: isHot ? '0 0 10px var(--red)' : 'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {pct > 50 && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
                          color: 'rgba(255,255,255,0.85)',
                        }}>
                          {pct}%
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>Low</span>
            <div style={{
              height: 8, width: 160, borderRadius: 4,
              background: `linear-gradient(90deg, ${heatColor(0)}, ${heatColor(0.25)}, ${heatColor(0.5)}, ${heatColor(0.75)}, ${heatColor(1)})`,
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>High</span>
          </div>
        </div>

        {/* Stats panel */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Zone Analysis
          </div>

          {/* Top 5 hottest zones */}
          {[...cells]
            .map((v, i) => ({ v, row: Math.floor(i / G), col: i % G }))
            .sort((a, b) => b.v - a.v)
            .slice(0, 6)
            .map(({ v, row, col }, i) => {
              const zoneId = `${colLabels[col]}${rowLabels[row]}`
              const pct    = Math.round((v / max) * 100)
              return (
                <div key={zoneId} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                    color: i === 0 ? 'var(--red)' : i < 3 ? 'var(--amber)' : 'var(--text-secondary)',
                    width: 32,
                  }}>
                    {zoneId}
                  </span>
                  <div style={{ flex: 1, height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: i === 0 ? 'var(--red)' : i < 3 ? 'var(--amber)' : 'var(--green)',
                      borderRadius: 2,
                      boxShadow: i === 0 ? '0 0 6px var(--red)' : 'none',
                    }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', width: 36, textAlign: 'right' }}>
                    {pct}%
                  </span>
                </div>
              )
            })}

          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 6 }}>PRIMARY HOTSPOT</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>
              Zone {colLabels[maxCol]}{rowLabels[maxRow]}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              Highest activity concentration — recommend priority monitoring
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
