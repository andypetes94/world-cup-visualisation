import { useState } from 'react'

const W = 1200, H = 620
const DISPLAY_W = 1680   // rendered wider than the viewBox so every element scales up proportionally (legibility/accessibility)
const TOP_Y = 115, ROW_H = 62   // 8 rows × 62 → taller rows to fit the thicker (45px) bars without crowding

const L_SPINE = 410   // left bars' right edge
const C_MID   = 600   // centre pill midpoint
const R_SPINE = 790   // right bars' left edge

const MAX_BAR_L  = 240
const MAX_PILL_W = 190
const MAX_BAR_R  = 250
const MAX_RATIO  = 10.0

// Prices in 2026 USD, read from The Economist chart (May 2026).
// Source: WorldCupGuide.com; FIFA. 1998 excluded — no data available.
const TICKET_DATA = [
  { year: '1994', host: 'USA',              group: 30,   final: 50,   color: '#f4a261' },
  { year: '2002', host: 'Japan / Korea',    group: 75,   final: 260,  color: '#2a9d8f' },
  { year: '2006', host: 'Germany',          group: 70,   final: 280,  color: '#e9c46a' },
  { year: '2010', host: 'South Africa',     group: 90,   final: 520,  color: '#52b788' },
  { year: '2014', host: 'Brazil',           group: 100,  final: 600,  color: '#b5179e' },
  { year: '2018', host: 'Russia',           group: 115,  final: 550,  color: '#7209b7' },
  { year: '2022', host: 'Qatar',            group: 72.50, final: 600,  color: '#4895ef' },
  { year: '2026', host: 'USA · CAN · MEX', group: 200,  final: 2030, color: '#c1121f' },
]

const enriched  = TICKET_DATA.map(d => ({ ...d, ratio: +(d.final / d.group).toFixed(2) }))

// Three independent sort orders — different rankings create the crossing-line effect
const leftData   = [...enriched].sort((a, b) => b.group - a.group)   // group desc
const centerData = [...enriched].sort((a, b) => b.ratio - a.ratio)   // ratio desc
const rightData  = [...enriched].sort((a, b) => b.final - a.final)   // final desc

const lIdx = Object.fromEntries(leftData.map((d, i)   => [d.year, i]))
const cIdx = Object.fromEntries(centerData.map((d, i) => [d.year, i]))
const rIdx = Object.fromEntries(rightData.map((d, i)  => [d.year, i]))

const ly = i => TOP_Y + i * ROW_H
const cy = i => TOP_Y + i * ROW_H
const ry = i => TOP_Y + i * ROW_H

const barL  = v => Math.max(8,  (v / 200)  * MAX_BAR_L)
const pw    = r => Math.max(52, (r / MAX_RATIO) * MAX_PILL_W)
const barR  = v => Math.max(8,  (v / 2030) * MAX_BAR_R)
const fmt      = v => v >= 1000 ? `$${(v / 1000).toFixed(2).replace(/\.?0+$/, '')}k` : `$${v}`
const fmtGroup = v => Number.isInteger(v) ? `$${v}` : `$${v.toFixed(2)}`

export default function TicketViz() {
  const [hov, setHov] = useState(null)
  const on  = yr => () => setHov(yr)
  const off = ()  => setHov(null)

  return (
    <div style={{
      width: '100%',
      // Cap by the larger of the two limits: the design width, or whatever width
      // keeps (chart-header + SVG) from exceeding the viewport height — so the
      // whole chart fits on screen on shorter laptop displays without scrolling,
      // while the title/subtitle (vw-based, set elsewhere) stay the same size.
      maxWidth: `min(${DISPLAY_W}px, calc((100vh - 220px) * ${(W / H).toFixed(3)}))`,
      margin: '0 auto',
    }}>
      <div className="chart-header">
        <p className="chart-title">Priced Out of Paradise</p>
        <p className="chart-subtitle">Men&rsquo;s football World Cup, cheapest tickets*, $, 2026 prices</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}>

        <style>{`
          @keyframes lineDraw {
            from { stroke-dashoffset: 900; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes pillPop {
            0%   { transform: scale(1);    }
            45%  { transform: scale(1.12); }
            70%  { transform: scale(0.95); }
            100% { transform: scale(1);    }
          }
          .line-active {
            stroke-dasharray: 900;
            animation: lineDraw 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          .pill-active {
            transform-box: fill-box;
            transform-origin: center center;
            animation: pillPop 0.35s ease forwards;
          }
        `}</style>

        {/* ── Headers ──────────────────────────────────────────────── */}
        {[
          { x: L_SPINE, anchor: 'end',    title: 'Group Stage',  sub: 'cheapest ticket · USD · face value' },
          { x: C_MID,   anchor: 'middle', title: 'Multiplier',   sub: 'Final ÷ Group Stage' },
          { x: R_SPINE, anchor: 'start',  title: 'Final',        sub: 'cheapest ticket · USD · face value' },
        ].map(({ x, anchor, title, sub }) => (
          <g key={title}>
            <text x={x} y={42} textAnchor={anchor}
              fontSize="32" fontWeight="700"
              fontFamily="'Raleway', system-ui, sans-serif" fill="#14100b">
              {title}
            </text>
            <text x={x} y={70} textAnchor={anchor}
              fontSize="20" fontFamily="'DM Sans', system-ui, sans-serif" fill="#9a8870">
              {sub}
            </text>
          </g>
        ))}

        {/* Spine hairlines */}
        {[L_SPINE, R_SPINE].map(x => (
          <line key={x} x1={x} y1={84} x2={x} y2={TOP_Y + 7 * ROW_H + 30}
            stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
        ))}

        {/* ── Bezier curves  L→C→R (drawn first, under bars) ──────── */}
        {enriched.map(d => {
          const li = lIdx[d.year], ci = cIdx[d.year], ri = rIdx[d.year]
          const y1 = ly(li), yc = cy(ci), y2 = ry(ri)
          const mLC = (L_SPINE + C_MID)   / 2
          const mCR = (C_MID   + R_SPINE) / 2
          const pLC = `M ${L_SPINE} ${y1} C ${mLC} ${y1}, ${mLC} ${yc}, ${C_MID} ${yc}`
          const pCR = `M ${C_MID}   ${yc} C ${mCR} ${yc}, ${mCR} ${y2}, ${R_SPINE} ${y2}`
          const is26 = d.year === '2026'
          const active = !hov || hov === d.year
          const isHov  = hov === d.year
          const op  = hov ? (active ? 0.9 : 0.05) : (is26 ? 0.82 : 0.38)
          const sw  = (hov && active) ? 10.5 : is26 ? 8.5 : 8
          return (
            <g key={d.year} onMouseEnter={on(d.year)} onMouseLeave={off}
              style={{ cursor: 'pointer' }}>
              {[pLC, pCR].map((p, i) => (
                <path key={`${d.year}-${i}-${isHov}`} d={p} fill="none" stroke={d.color}
                  strokeWidth={sw} opacity={op}
                  className={isHov ? 'line-active' : ''}
                  style={{ transition: 'opacity 0.15s, stroke-width 0.12s' }} />
              ))}
            </g>
          )
        })}

        {/* ── Left bars ────────────────────────────────────────────── */}
        {leftData.map((d, i) => {
          const y   = ly(i)
          const bw  = barL(d.group)
          const is26 = d.year === '2026'
          const fd  = hov ? (hov === d.year ? 1 : 0.09) : 1
          return (
            <g key={d.year} onMouseEnter={on(d.year)} onMouseLeave={off}
              style={{ cursor: 'pointer' }}>
              <rect x={L_SPINE - bw} y={y - 22.5} width={bw} height={45} rx={4}
                fill={d.color} opacity={fd * 0.88}
                style={{ transition: 'opacity 0.15s' }} />
              {bw > 56 ? (
                /* Wide enough — white text inside bar */
                <text x={L_SPINE - 7} y={y + 5} textAnchor="end"
                  fontSize={is26 ? 13.5 : 12} fontWeight="600"
                  fontFamily="'DM Sans', system-ui, sans-serif" fill="white"
                  opacity={fd * 0.92} style={{ transition: 'opacity 0.15s' }}>
                  {fmtGroup(d.group)}
                </text>
              ) : (
                /* Bar too short — coloured text nudged left of bar */
                <text x={L_SPINE - bw - 7} y={y + 5} textAnchor="end"
                  fontSize={12} fontWeight="600"
                  fontFamily="'DM Sans', system-ui, sans-serif" fill={d.color}
                  opacity={fd * 0.92} style={{ transition: 'opacity 0.15s' }}>
                  {fmtGroup(d.group)}
                </text>
              )}
              <text x={18} y={y - 5}
                fontSize={is26 ? 16 : 15} fontWeight={is26 ? '700' : '500'}
                fontFamily="'Raleway', system-ui, sans-serif"
                fill={(hov === d.year || is26) ? d.color : '#4a3828'}
                opacity={fd} style={{ transition: 'opacity 0.15s, fill 0.12s' }}>
                {d.year}
              </text>
              <text x={18} y={y + 14} fontSize={12.5}
                fontFamily="'DM Sans', system-ui, sans-serif"
                fill="#9a8870" opacity={fd * 0.82}
                style={{ transition: 'opacity 0.15s' }}>
                {d.host}
              </text>
            </g>
          )
        })}

        {/* ── Centre ratio pills ────────────────────────────────────── */}
        {centerData.map((d, i) => {
          const y   = cy(i)
          const w   = pw(d.ratio)
          const is26 = d.year === '2026'
          const fd  = hov ? (hov === d.year ? 1 : 0.1) : 1
          return (
            <g key={d.year} onMouseEnter={on(d.year)} onMouseLeave={off}
              style={{ cursor: 'pointer' }}>
              <rect x={C_MID - w / 2} y={y - 14} width={w} height={28} rx={7}
                fill={d.color} opacity={0.95}
                className={hov === d.year ? 'pill-active' : ''} />
              <text x={C_MID} y={y + 5} textAnchor="middle"
                fontSize={is26 ? 14 : 12.5} fontWeight="700"
                fontFamily="'DM Sans', system-ui, sans-serif" fill="white"
                opacity={1}>
                {d.ratio.toFixed(1)}×
              </text>
            </g>
          )
        })}

        {/* ── Right bars ───────────────────────────────────────────── */}
        {rightData.map((d, i) => {
          const y   = ry(i)
          const bw  = barR(d.final)
          const is26 = d.year === '2026'
          const fd  = hov ? (hov === d.year ? 1 : 0.09) : 1
          return (
            <g key={d.year} onMouseEnter={on(d.year)} onMouseLeave={off}
              style={{ cursor: 'pointer' }}>
              <rect x={R_SPINE} y={y - 22.5} width={bw} height={45} rx={4}
                fill={d.color} opacity={fd * 0.88}
                style={{ transition: 'opacity 0.15s' }} />
              {bw > 56 ? (
                /* Wide enough — white text inside bar */
                <text x={R_SPINE + 7} y={y + 5} textAnchor="start"
                  fontSize={is26 ? 13.5 : 12} fontWeight="600"
                  fontFamily="'DM Sans', system-ui, sans-serif" fill="white"
                  opacity={fd * 0.92} style={{ transition: 'opacity 0.15s' }}>
                  {fmt(d.final)}
                </text>
              ) : (
                /* Bar too short — coloured text nudged right of bar */
                <text x={R_SPINE + bw + 7} y={y + 5} textAnchor="start"
                  fontSize={12} fontWeight="600"
                  fontFamily="'DM Sans', system-ui, sans-serif" fill={d.color}
                  opacity={fd * 0.92} style={{ transition: 'opacity 0.15s' }}>
                  {fmt(d.final)}
                </text>
              )}
              <text x={W - 18} y={y - 5} textAnchor="end"
                fontSize={is26 ? 16 : 15} fontWeight={is26 ? '700' : '500'}
                fontFamily="'Raleway', system-ui, sans-serif"
                fill={(hov === d.year || is26) ? d.color : '#4a3828'}
                opacity={fd} style={{ transition: 'opacity 0.15s, fill 0.12s' }}>
                {d.year}
              </text>
              <text x={W - 18} y={y + 14} textAnchor="end" fontSize={12.5}
                fontFamily="'DM Sans', system-ui, sans-serif"
                fill="#9a8870" opacity={fd * 0.82}
                style={{ transition: 'opacity 0.15s' }}>
                {d.host}
              </text>
            </g>
          )
        })}

      </svg>
    </div>
  )
}
