import { useState, useRef } from 'react'

const W = 1200, H = 660

const BLOCK_W    = 70
const BLOCK_H    = 9
const GAP        = 1      // gap between blocks within a confederation
const CONF_GAP   = 4      // extra gap between confederations
const COL_STEP   = 128    // 70px column + 58px Sankey gap
const LEFT_PAD   = 53     // (W - (9*70 + 8*58)) / 2
const BASELINE_Y = 571

const CONFS = [
  { key: 'UEFA',     color: '#4895ef', label: 'UEFA'     },
  { key: 'CONMEBOL', color: '#c1121f', label: 'CONMEBOL' },
  { key: 'CONCACAF', color: '#2a9d8f', label: 'CONCACAF' },
  { key: 'CAF',      color: '#f4a261', label: 'CAF'      },
  { key: 'AFC',      color: '#7209b7', label: 'AFC'      },
  { key: 'OFC',      color: '#52b788', label: 'OFC'      },
]

const LEGEND_X = [109, 289, 469, 649, 829, 1009]

const DATA = [
  { year: '1994', UEFA: 13, CONMEBOL: 4, CONCACAF: 2, CAF: 3, AFC: 2, OFC: 0 },
  { year: '1998', UEFA: 15, CONMEBOL: 5, CONCACAF: 3, CAF: 5, AFC: 4, OFC: 0 },
  { year: '2002', UEFA: 15, CONMEBOL: 5, CONCACAF: 3, CAF: 5, AFC: 4, OFC: 0 },
  { year: '2006', UEFA: 14, CONMEBOL: 4, CONCACAF: 4, CAF: 5, AFC: 4, OFC: 1 },
  { year: '2010', UEFA: 13, CONMEBOL: 5, CONCACAF: 3, CAF: 6, AFC: 4, OFC: 1 },
  { year: '2014', UEFA: 13, CONMEBOL: 6, CONCACAF: 4, CAF: 5, AFC: 4, OFC: 0 },
  { year: '2018', UEFA: 14, CONMEBOL: 5, CONCACAF: 3, CAF: 5, AFC: 5, OFC: 0 },
  { year: '2022', UEFA: 13, CONMEBOL: 4, CONCACAF: 4, CAF: 5, AFC: 6, OFC: 0 },
  { year: '2026', UEFA: 16, CONMEBOL: 6, CONCACAF: 6, CAF: 10, AFC: 9, OFC: 1 },
]

// Per-country breakdown: name, FIFA rank at qualification, true historical WC debut year
// (debut: true) flags a country's first-ever World Cup appearance.
const COUNTRY_DATA = {
  1994: {
    UEFA: [
      { name: 'Germany', rank: 1 }, { name: 'Netherlands', rank: 2 }, { name: 'Italy', rank: 4 },
      { name: 'Spain', rank: 5 }, { name: 'Norway', rank: 6 }, { name: 'Romania', rank: 7 },
      { name: 'Sweden', rank: 10 }, { name: 'Switzerland', rank: 12 }, { name: 'Republic of Ireland', rank: 14 },
      { name: 'Russia', rank: 19 }, { name: 'Belgium', rank: 27 }, { name: 'Bulgaria', rank: 29 },
      { name: 'Greece', rank: 31, debut: true },
    ],
    CONMEBOL: [
      { name: 'Brazil', rank: 3 }, { name: 'Argentina', rank: 8 }, { name: 'Colombia', rank: 17 },
      { name: 'Bolivia', rank: 43 },
    ],
    CONCACAF: [
      { name: 'Mexico', rank: 16 }, { name: 'United States', rank: 23 },
    ],
    CAF: [
      { name: 'Nigeria', rank: 11, debut: true }, { name: 'Cameroon', rank: 24 }, { name: 'Morocco', rank: 28 },
    ],
    AFC: [
      { name: 'Saudi Arabia', rank: 34, debut: true }, { name: 'South Korea', rank: 37 },
    ],
    OFC: [],
  },
  1998: {
    UEFA: [
      { name: 'Germany', rank: 2 }, { name: 'England', rank: 5 }, { name: 'Norway', rank: 7 },
      { name: 'FR Yugoslavia', rank: 8 }, { name: 'Italy', rank: 14 }, { name: 'Spain', rank: 15 },
      { name: 'France', rank: 18 }, { name: 'Croatia', rank: 19, debut: true }, { name: 'Romania', rank: 22 },
      { name: 'Netherlands', rank: 25 }, { name: 'Denmark', rank: 27 }, { name: 'Austria', rank: 31 },
      { name: 'Bulgaria', rank: 35 }, { name: 'Belgium', rank: 36 }, { name: 'Scotland', rank: 41 },
    ],
    CONMEBOL: [
      { name: 'Brazil', rank: 1 }, { name: 'Argentina', rank: 6 }, { name: 'Chile', rank: 9 },
      { name: 'Colombia', rank: 10 }, { name: 'Paraguay', rank: 29 },
    ],
    CONCACAF: [
      { name: 'Mexico', rank: 4 }, { name: 'United States', rank: 11 }, { name: 'Jamaica', rank: 30, debut: true },
    ],
    CAF: [
      { name: 'Morocco', rank: 13 }, { name: 'Tunisia', rank: 21 }, { name: 'South Africa', rank: 24, debut: true },
      { name: 'Cameroon', rank: 49 }, { name: 'Nigeria', rank: 74 },
    ],
    AFC: [
      { name: 'Japan', rank: 12, debut: true }, { name: 'South Korea', rank: 20 },
      { name: 'Saudi Arabia', rank: 34 }, { name: 'Iran', rank: 42 },
    ],
    OFC: [],
  },
  2002: {
    UEFA: [
      { name: 'France', rank: 1 }, { name: 'Portugal', rank: 5 }, { name: 'Italy', rank: 6 },
      { name: 'Spain', rank: 8 }, { name: 'Germany', rank: 11 }, { name: 'England', rank: 12 },
      { name: 'Republic of Ireland', rank: 15 }, { name: 'Sweden', rank: 19 }, { name: 'Denmark', rank: 20 },
      { name: 'Croatia', rank: 21 }, { name: 'Turkey', rank: 22 }, { name: 'Belgium', rank: 23 },
      { name: 'Slovenia', rank: 25, debut: true }, { name: 'Russia', rank: 28 }, { name: 'Poland', rank: 38 },
    ],
    CONMEBOL: [
      { name: 'Brazil', rank: 2 }, { name: 'Argentina', rank: 3 }, { name: 'Paraguay', rank: 18 },
      { name: 'Uruguay', rank: 24 }, { name: 'Ecuador', rank: 36, debut: true },
    ],
    CONCACAF: [
      { name: 'Mexico', rank: 7 }, { name: 'United States', rank: 13 }, { name: 'Costa Rica', rank: 29 },
    ],
    CAF: [
      { name: 'Cameroon', rank: 17 }, { name: 'Nigeria', rank: 27 }, { name: 'Tunisia', rank: 31 },
      { name: 'South Africa', rank: 37 }, { name: 'Senegal', rank: 42, debut: true },
    ],
    AFC: [
      { name: 'Japan', rank: 32 }, { name: 'Saudi Arabia', rank: 34 }, { name: 'South Korea', rank: 40 },
      { name: 'China', rank: 50, debut: true },
    ],
    OFC: [],
  },
  2006: {
    UEFA: [
      { name: 'Czech Republic', rank: 2 }, { name: 'Netherlands', rank: 3 }, { name: 'Spain', rank: 5 },
      { name: 'Portugal', rank: 7 }, { name: 'France', rank: 8 }, { name: 'England', rank: 10 },
      { name: 'Italy', rank: 13 }, { name: 'Sweden', rank: 16 }, { name: 'Germany', rank: 19 },
      { name: 'Croatia', rank: 23 }, { name: 'Poland', rank: 29 }, { name: 'Switzerland', rank: 35 },
      { name: 'Serbia and Montenegro', rank: 44 }, { name: 'Ukraine', rank: 45, debut: true },
    ],
    CONMEBOL: [
      { name: 'Brazil', rank: 1 }, { name: 'Argentina', rank: 9 }, { name: 'Paraguay', rank: 33 },
      { name: 'Ecuador', rank: 39 },
    ],
    CONCACAF: [
      { name: 'Mexico', rank: 4 }, { name: 'United States', rank: 5 }, { name: 'Costa Rica', rank: 26 },
      { name: 'Trinidad and Tobago', rank: 47, debut: true },
    ],
    CAF: [
      { name: 'Tunisia', rank: 21 }, { name: 'Ivory Coast', rank: 32, debut: true },
      { name: 'Ghana', rank: 48, debut: true }, { name: 'Angola', rank: 57, debut: true },
      { name: 'Togo', rank: 61, debut: true },
    ],
    AFC: [
      { name: 'Japan', rank: 18 }, { name: 'Iran', rank: 23 }, { name: 'South Korea', rank: 29 },
      { name: 'Saudi Arabia', rank: 34 },
    ],
    OFC: [
      { name: 'Australia', rank: 42 },
    ],
  },
  2010: {
    UEFA: [
      { name: 'Spain', rank: 2 }, { name: 'Portugal', rank: 3 }, { name: 'Netherlands', rank: 4 },
      { name: 'Italy', rank: 5 }, { name: 'Germany', rank: 6 }, { name: 'England', rank: 8 },
      { name: 'France', rank: 9 }, { name: 'Greece', rank: 13 }, { name: 'Serbia', rank: 15 },
      { name: 'Switzerland', rank: 24 }, { name: 'Slovenia', rank: 25 }, { name: 'Slovakia', rank: 34, debut: true },
      { name: 'Denmark', rank: 36 },
    ],
    CONMEBOL: [
      { name: 'Brazil', rank: 1 }, { name: 'Argentina', rank: 7 }, { name: 'Uruguay', rank: 16 },
      { name: 'Chile', rank: 18 }, { name: 'Paraguay', rank: 31 },
    ],
    CONCACAF: [
      { name: 'United States', rank: 14 }, { name: 'Mexico', rank: 17 }, { name: 'Honduras', rank: 38 },
    ],
    CAF: [
      { name: 'Cameroon', rank: 19 }, { name: 'Nigeria', rank: 21 }, { name: 'Ivory Coast', rank: 27 },
      { name: 'Algeria', rank: 30 }, { name: 'Ghana', rank: 32 }, { name: 'South Africa', rank: 83 },
    ],
    AFC: [
      { name: 'Australia', rank: 20 }, { name: 'Japan', rank: 45 }, { name: 'South Korea', rank: 47 },
      { name: 'North Korea', rank: 105 },
    ],
    OFC: [
      { name: 'New Zealand', rank: 78 },
    ],
  },
  2014: {
    UEFA: [
      { name: 'Spain', rank: 1 }, { name: 'Germany', rank: 2 }, { name: 'Portugal', rank: 4 },
      { name: 'Switzerland', rank: 6 }, { name: 'Italy', rank: 9 }, { name: 'England', rank: 10 },
      { name: 'Belgium', rank: 11 }, { name: 'Greece', rank: 12 }, { name: 'Netherlands', rank: 15 },
      { name: 'France', rank: 17 }, { name: 'Croatia', rank: 18 }, { name: 'Russia', rank: 19 },
      { name: 'Bosnia and Herzegovina', rank: 21, debut: true },
    ],
    CONMEBOL: [
      { name: 'Brazil', rank: 3 }, { name: 'Argentina', rank: 5 }, { name: 'Uruguay', rank: 7 },
      { name: 'Colombia', rank: 8 }, { name: 'Chile', rank: 14 }, { name: 'Ecuador', rank: 26 },
    ],
    CONCACAF: [
      { name: 'United States', rank: 13 }, { name: 'Mexico', rank: 20 }, { name: 'Costa Rica', rank: 28 },
      { name: 'Honduras', rank: 33 },
    ],
    CAF: [
      { name: 'Algeria', rank: 22 }, { name: 'Ivory Coast', rank: 23 }, { name: 'Ghana', rank: 37 },
      { name: 'Nigeria', rank: 44 }, { name: 'Cameroon', rank: 56 },
    ],
    AFC: [
      { name: 'Iran', rank: 43 }, { name: 'Japan', rank: 46 }, { name: 'South Korea', rank: 57 },
      { name: 'Australia', rank: 62 },
    ],
    OFC: [],
  },
  2018: {
    UEFA: [
      { name: 'Germany', rank: 1 }, { name: 'Belgium', rank: 3 }, { name: 'Portugal', rank: 4 },
      { name: 'Switzerland', rank: 6 }, { name: 'France', rank: 7 }, { name: 'Poland', rank: 8 },
      { name: 'Spain', rank: 10 }, { name: 'England', rank: 12 }, { name: 'Denmark', rank: 12 },
      { name: 'Croatia', rank: 20 }, { name: 'Iceland', rank: 22, debut: true }, { name: 'Sweden', rank: 24 },
      { name: 'Serbia', rank: 34 }, { name: 'Russia', rank: 70 },
    ],
    CONMEBOL: [
      { name: 'Brazil', rank: 2 }, { name: 'Argentina', rank: 5 }, { name: 'Peru', rank: 11 },
      { name: 'Uruguay', rank: 14 }, { name: 'Colombia', rank: 16 },
    ],
    CONCACAF: [
      { name: 'Mexico', rank: 15 }, { name: 'Costa Rica', rank: 23 }, { name: 'Panama', rank: 55, debut: true },
    ],
    CAF: [
      { name: 'Tunisia', rank: 21 }, { name: 'Senegal', rank: 27 }, { name: 'Morocco', rank: 41 },
      { name: 'Egypt', rank: 45 }, { name: 'Nigeria', rank: 48 },
    ],
    AFC: [
      { name: 'Australia', rank: 36 }, { name: 'Iran', rank: 37 }, { name: 'South Korea', rank: 57 },
      { name: 'Japan', rank: 61 }, { name: 'Saudi Arabia', rank: 67 },
    ],
    OFC: [],
  },
  2022: {
    UEFA: [
      { name: 'Belgium', rank: 2 }, { name: 'France', rank: 4 }, { name: 'England', rank: 5 },
      { name: 'Spain', rank: 7 }, { name: 'Netherlands', rank: 8 }, { name: 'Portugal', rank: 9 },
      { name: 'Denmark', rank: 10 }, { name: 'Germany', rank: 11 }, { name: 'Croatia', rank: 12 },
      { name: 'Switzerland', rank: 15 }, { name: 'Wales', rank: 19, debut: true }, { name: 'Serbia', rank: 21 },
      { name: 'Poland', rank: 26 },
    ],
    CONMEBOL: [
      { name: 'Brazil', rank: 1 }, { name: 'Argentina', rank: 3 }, { name: 'Uruguay', rank: 14 },
      { name: 'Ecuador', rank: 44 },
    ],
    CONCACAF: [
      { name: 'Mexico', rank: 13 }, { name: 'United States', rank: 16 }, { name: 'Costa Rica', rank: 31 },
      { name: 'Canada', rank: 41 },
    ],
    CAF: [
      { name: 'Senegal', rank: 18 }, { name: 'Morocco', rank: 22 }, { name: 'Tunisia', rank: 30 },
      { name: 'Cameroon', rank: 43 }, { name: 'Ghana', rank: 61 },
    ],
    AFC: [
      { name: 'Iran', rank: 20 }, { name: 'Japan', rank: 24 }, { name: 'South Korea', rank: 28 },
      { name: 'Australia', rank: 38 }, { name: 'Qatar', rank: 50, debut: true }, { name: 'Saudi Arabia', rank: 51 },
    ],
    OFC: [],
  },
  2026: {
    UEFA: [
      { name: 'Spain', rank: 2 }, { name: 'France', rank: 3 }, { name: 'England', rank: 4 },
      { name: 'Portugal', rank: 5 }, { name: 'Netherlands', rank: 8 }, { name: 'Belgium', rank: 9 },
      { name: 'Germany', rank: 10 }, { name: 'Croatia', rank: 11 }, { name: 'Switzerland', rank: 19 },
      { name: 'Turkey', rank: 22 }, { name: 'Austria', rank: 24 }, { name: 'Norway', rank: 31 },
      { name: 'Sweden', rank: 38 }, { name: 'Czech Republic', rank: 40 }, { name: 'Scotland', rank: 42 },
      { name: 'Bosnia and Herzegovina', rank: 64 },
    ],
    CONMEBOL: [
      { name: 'Argentina', rank: 1 }, { name: 'Brazil', rank: 6 }, { name: 'Colombia', rank: 13 },
      { name: 'Uruguay', rank: 16 }, { name: 'Ecuador', rank: 23 }, { name: 'Paraguay', rank: 41 },
    ],
    CONCACAF: [
      { name: 'Mexico', rank: 14 }, { name: 'United States', rank: 17 }, { name: 'Canada', rank: 30 },
      { name: 'Panama', rank: 34 }, { name: 'Curaçao', rank: 82, debut: true }, { name: 'Haiti', rank: 83 },
    ],
    CAF: [
      { name: 'Morocco', rank: 7 }, { name: 'Senegal', rank: 15 }, { name: 'Algeria', rank: 28 },
      { name: 'Egypt', rank: 29 }, { name: 'Ivory Coast', rank: 33 }, { name: 'Tunisia', rank: 45 },
      { name: 'DR Congo', rank: 46 }, { name: 'South Africa', rank: 60 },
      { name: 'Cape Verde', rank: 67, debut: true }, { name: 'Ghana', rank: 73 },
    ],
    AFC: [
      { name: 'Japan', rank: 18 }, { name: 'Iran', rank: 20 }, { name: 'South Korea', rank: 25 },
      { name: 'Australia', rank: 27 }, { name: 'Uzbekistan', rank: 50, debut: true }, { name: 'Qatar', rank: 56 },
      { name: 'Iraq', rank: 57 }, { name: 'Saudi Arabia', rank: 61 }, { name: 'Jordan', rank: 63, debut: true },
    ],
    OFC: [
      { name: 'New Zealand', rank: 85 },
    ],
  },
}

// Pre-compute confederation section y-positions for all years
const SECTION_POS = DATA.map(d => {
  const pos = {}
  let by = BASELINE_Y
  let prevHad = false
  CONFS.forEach(c => {
    const N = d[c.key]
    if (N > 0) {
      if (prevHad) by -= CONF_GAP
      const bottomY = by
      const topY    = by - (N * (BLOCK_H + GAP) - GAP)
      pos[c.key] = { bottomY, topY, N }
      by -= N * (BLOCK_H + GAP)
      prevHad = true
    } else {
      pos[c.key] = null
    }
  })
  return pos
})

const TOTALS = DATA.map(d => CONFS.reduce((s, c) => s + d[c.key], 0))

export default function ConfederationViz() {
  const [hovConf, setHovConf] = useState(null)
  const [tooltip, setTooltip] = useState(null) // { year, conf, x, y }
  const containerRef = useRef(null)

  const annotConf = CONFS.find(c => c.key === hovConf)

  const showTooltip = (year, conf) => e => {
    setHovConf(conf)
    const rect = containerRef.current.getBoundingClientRect()
    setTooltip({ year, conf, x: e.clientX - rect.left, y: e.clientY - rect.top, containerW: rect.width })
  }
  const moveTooltip = e => {
    if (!tooltip) return
    const rect = containerRef.current.getBoundingClientRect()
    setTooltip(t => t && ({ ...t, x: e.clientX - rect.left, y: e.clientY - rect.top, containerW: rect.width }))
  }
  const hideTooltip = () => {
    setHovConf(null)
    setTooltip(null)
  }

  const tooltipCountries = tooltip ? COUNTRY_DATA[tooltip.year]?.[tooltip.conf] : null

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: W, margin: '0 auto', position: 'relative' }}>
      <div className="chart-header">
        <p className="chart-title">Europe&rsquo;s Shrinking Slice</p>
        <p className="chart-subtitle">Men&rsquo;s football World Cup team allocations by confederation · 1994–2026 · Each block = one team slot</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}>

        {/* ── Legend ── */}
        {CONFS.map((c, i) => {
          const lx     = LEGEND_X[i]
          const active = !hovConf || hovConf === c.key
          return (
            <g key={c.key}
              onMouseEnter={() => setHovConf(c.key)}
              onMouseLeave={() => setHovConf(null)}
              style={{ cursor: 'pointer' }}>
              <rect x={lx} y={26} width={14} height={14} rx={2}
                fill={c.color}
                opacity={active ? 1 : 0.18}
                style={{ transition: 'opacity 0.18s' }} />
              <text x={lx + 20} y={38}
                fontSize={11} fontWeight="500"
                fontFamily="'DM Sans', system-ui, sans-serif"
                fill={active ? '#4a3828' : '#c0b0a0'}
                style={{ transition: 'fill 0.18s' }}>
                {c.label}
              </text>
            </g>
          )
        })}

        {/* ── Baseline hairline ── */}
        <line
          x1={LEFT_PAD - 4} y1={BASELINE_Y}
          x2={LEFT_PAD + 8 * COL_STEP + BLOCK_W + 4} y2={BASELINE_Y}
          stroke="rgba(0,0,0,0.08)" strokeWidth="1" />

        {/* ── Sankey bands (drawn behind columns) ── */}
        {DATA.slice(0, -1).map((_, ci) => {
          const pos1 = SECTION_POS[ci]
          const pos2 = SECTION_POS[ci + 1]
          const x1   = LEFT_PAD + ci * COL_STEP + BLOCK_W
          const x2   = LEFT_PAD + (ci + 1) * COL_STEP
          const mx   = (x1 + x2) / 2
          const tot2 = TOTALS[ci + 1]

          return (
            <g key={`sk-${ci}`}>
              {CONFS.map(c => {
                const p1 = pos1[c.key]
                const p2 = pos2[c.key]
                if (!p1 || !p2) return null

                const active = !hovConf || hovConf === c.key
                const midB   = (p1.bottomY + p2.bottomY) / 2
                const midT   = (p1.topY    + p2.topY)    / 2
                const midH   = midB - midT
                const pct    = Math.round(p2.N / tot2 * 100)
                const path   = [
                  `M ${x1} ${p1.bottomY}`,
                  `C ${mx} ${p1.bottomY},${mx} ${p2.bottomY},${x2} ${p2.bottomY}`,
                  `L ${x2} ${p2.topY}`,
                  `C ${mx} ${p2.topY},${mx} ${p1.topY},${x1} ${p1.topY}`,
                  'Z',
                ].join(' ')

                return (
                  <g key={c.key}
                    onMouseEnter={() => setHovConf(c.key)}
                    onMouseLeave={() => setHovConf(null)}
                    style={{ cursor: 'pointer' }}>
                    <path d={path} fill={c.color}
                      opacity={active ? (hovConf ? 0.44 : 0.28) : 0.05}
                      style={{ transition: 'opacity 0.18s' }} />
                    {midH > 12 && active && (
                      <text
                        x={mx} y={(midB + midT) / 2 + 3}
                        textAnchor="middle"
                        fontSize={10} fontWeight="700"
                        fontFamily="'DM Sans', system-ui, sans-serif"
                        fill="white"
                        style={{ pointerEvents: 'none' }}>
                        {pct}%
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* ── Year columns ── */}
        {DATA.map((d, ci) => {
          const colX  = LEFT_PAD + ci * COL_STEP
          const colCX = colX + BLOCK_W / 2
          const is26  = d.year === '2026'
          const total = TOTALS[ci]

          const blocks = []
          let by = BASELINE_Y
          let prevHadTeams = false

          CONFS.forEach(c => {
            if (d[c.key] > 0) {
              if (prevHadTeams) by -= CONF_GAP
              for (let j = 0; j < d[c.key]; j++) {
                blocks.push({ conf: c.key, color: c.color, y: by - BLOCK_H })
                by -= (BLOCK_H + GAP)
              }
              prevHadTeams = true
            }
          })

          const topY = by + GAP

          return (
            <g key={d.year}>

              {/* Team blocks */}
              {blocks.map((b, bi) => {
                const active = !hovConf || hovConf === b.conf
                return (
                  <rect key={bi}
                    x={colX} y={b.y} width={BLOCK_W} height={BLOCK_H} rx={1.5}
                    fill={b.color}
                    opacity={active ? 0.88 : 0.1}
                    style={{ transition: 'opacity 0.18s', cursor: 'pointer' }}
                    onMouseEnter={showTooltip(d.year, b.conf)}
                    onMouseMove={moveTooltip}
                    onMouseLeave={hideTooltip} />
                )
              })}

              {/* Count badge above column when confederation is hovered */}
              {hovConf && (
                <text x={colCX} y={topY - 9} textAnchor="middle"
                  fontSize={14} fontWeight="600"
                  fontFamily="'DM Sans', system-ui, sans-serif"
                  fill={d[hovConf] > 0 ? annotConf?.color : 'rgba(0,0,0,0.2)'}
                  style={{ transition: 'fill 0.18s' }}>
                  {d[hovConf] > 0 ? d[hovConf] : '—'}
                </text>
              )}

              {/* Year label */}
              <text x={colCX} y={BASELINE_Y + 19} textAnchor="middle"
                fontSize={is26 ? 15 : 13.5} fontWeight={is26 ? '700' : '600'}
                fontFamily="'Raleway', system-ui, sans-serif"
                fill={is26 ? '#14100b' : '#4a3828'}>
                {d.year}
              </text>

              {/* Team count */}
              <text x={colCX} y={BASELINE_Y + 33} textAnchor="middle"
                fontSize={11} fontFamily="'DM Sans', system-ui, sans-serif"
                fill="#9a8870">
                {total} teams
              </text>

            </g>
          )
        })}

        {/* ── Source note ── */}
        <text x={W / 2} y={H - 14} textAnchor="middle"
          fontSize={8.5} fontStyle="italic"
          fontFamily="'DM Sans', system-ui, sans-serif" fill="#9a8870">
          Source: FIFA · Confederation berths per tournament · Hover a block to see countries and FIFA world ranking at the start of that World Cup
        </text>

      </svg>

      {tooltip && tooltipCountries && (
        <div style={{
          position: 'absolute',
          top: tooltip.y + 16,
          left: tooltip.containerW - tooltip.x < 190 ? undefined : tooltip.x + 14,
          right: tooltip.containerW - tooltip.x < 190 ? tooltip.containerW - tooltip.x + 14 : undefined,
          background: 'rgba(253, 250, 244, 0.97)',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 6,
          boxShadow: '0 6px 20px rgba(20,16,11,0.18)',
          padding: '10px 14px',
          minWidth: 170,
          maxWidth: 210,
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <div style={{
            fontFamily: "'Raleway', system-ui, sans-serif",
            fontWeight: 700, fontSize: 13,
            color: '#2d2410', marginBottom: 6,
          }}>
            {tooltip.conf} · {tooltip.year}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {tooltipCountries.map(c => (
              <div key={c.name} style={{
                display: 'flex', justifyContent: 'space-between', gap: 10,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: 11.5, color: '#4a3828',
              }}>
                <span>
                  {c.name}
                  {c.debut && <span style={{ color: '#c1121f', fontWeight: 700 }}> ★</span>}
                </span>
                <span style={{ color: '#9a8870', fontWeight: 600 }}>#{c.rank}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(0,0,0,0.08)',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 9.5, color: '#9a8870', fontStyle: 'italic',
          }}>
            # = FIFA world ranking<br />★ tournament debut
          </div>
        </div>
      )}
    </div>
  )
}
