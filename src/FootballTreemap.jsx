import { useState, useMemo } from 'react'
import { hierarchy, treemap } from 'd3'

const W = 1100, H = 890
const CX = 550, CY = 400, R = 358

const CONF_COLORS = {
  UEFA:     '#2563eb',
  CONMEBOL: '#e63946',
  CONCACAF: '#2d9d78',
  CAF:      '#f4a261',
  AFC:      '#9b5de5',
  OFC:      '#94a3b8',
}

const YEARS = [
  {
    year: '1994',
    UEFA:     ['Germany','Italy','Spain','Netherlands','Belgium','Sweden','Romania','Bulgaria','Norway','Greece','Switzerland','Ireland','Russia'],
    CONMEBOL: ['Brazil','Argentina','Colombia','Bolivia'],
    CONCACAF: ['USA','Mexico'],
    CAF:      ['Nigeria','Cameroon','Morocco'],
    AFC:      ['South Korea','Saudi Arabia'],
    OFC:      [],
  },
  {
    year: '1998',
    UEFA:     ['France','Germany','Italy','Spain','Netherlands','England','Belgium','Romania','Yugoslavia','Scotland','Denmark','Austria','Croatia','Norway','Bulgaria'],
    CONMEBOL: ['Brazil','Argentina','Chile','Colombia','Paraguay'],
    CONCACAF: ['USA','Mexico','Jamaica'],
    CAF:      ['Nigeria','South Africa','Cameroon','Morocco','Tunisia'],
    AFC:      ['South Korea','Japan','Saudi Arabia','Iran'],
    OFC:      [],
  },
  {
    year: '2002',
    UEFA:     ['Germany','France','Italy','Spain','England','Sweden','Belgium','Russia','Denmark','Poland','Portugal','Turkey','Slovenia','Ireland','Serbia & Montenegro'],
    CONMEBOL: ['Brazil','Argentina','Paraguay','Uruguay','Ecuador'],
    CONCACAF: ['USA','Mexico','Costa Rica'],
    CAF:      ['Senegal','Nigeria','Cameroon','South Africa','Tunisia'],
    AFC:      ['South Korea','Japan','China','Saudi Arabia'],
    OFC:      [],
  },
  {
    year: '2006',
    UEFA:     ['Germany','France','Italy','Spain','Netherlands','England','Portugal','Czech Republic','Croatia','Sweden','Poland','Ukraine','Serbia','Switzerland'],
    CONMEBOL: ['Brazil','Argentina','Ecuador','Paraguay'],
    CONCACAF: ['USA','Mexico','Costa Rica','Trinidad & Tobago'],
    CAF:      ['Ghana','Ivory Coast','Togo','Angola','Tunisia'],
    AFC:      ['Japan','South Korea','Iran','Saudi Arabia'],
    OFC:      [],
  },
  {
    year: '2010',
    UEFA:     ['Spain','Germany','Netherlands','England','France','Italy','Portugal','Denmark','Slovakia','Serbia','Slovenia','Greece','Switzerland'],
    CONMEBOL: ['Brazil','Argentina','Uruguay','Chile','Paraguay'],
    CONCACAF: ['USA','Mexico','Honduras'],
    CAF:      ['South Africa','Ghana','Ivory Coast','Nigeria','Algeria','Cameroon'],
    AFC:      ['Japan','South Korea','Australia','North Korea'],
    OFC:      ['New Zealand'],
  },
  {
    year: '2014',
    UEFA:     ['Germany','France','Netherlands','Spain','England','Italy','Belgium','Portugal','Switzerland','Greece','Bosnia & Herzegovina','Croatia','Russia'],
    CONMEBOL: ['Brazil','Argentina','Colombia','Chile','Uruguay','Ecuador'],
    CONCACAF: ['USA','Mexico','Costa Rica','Honduras'],
    CAF:      ['Algeria','Ivory Coast','Ghana','Nigeria','Cameroon'],
    AFC:      ['Japan','South Korea','Australia','Iran'],
    OFC:      [],
  },
  {
    year: '2018',
    UEFA:     ['Russia','France','Germany','Spain','Portugal','Belgium','England','Croatia','Poland','Serbia','Switzerland','Iceland','Sweden','Denmark'],
    CONMEBOL: ['Brazil','Argentina','Uruguay','Colombia','Peru'],
    CONCACAF: ['Mexico','Costa Rica','Panama'],
    CAF:      ['Egypt','Nigeria','Senegal','Tunisia','Morocco'],
    AFC:      ['Japan','South Korea','Australia','Iran','Saudi Arabia'],
    OFC:      [],
  },
  {
    year: '2022',
    UEFA:     ['France','England','Spain','Germany','Netherlands','Portugal','Belgium','Denmark','Croatia','Switzerland','Wales','Poland','Serbia'],
    CONMEBOL: ['Brazil','Argentina','Uruguay','Ecuador'],
    CONCACAF: ['USA','Mexico','Costa Rica','Canada'],
    CAF:      ['Morocco','Senegal','Tunisia','Ghana','Cameroon'],
    AFC:      ['Japan','South Korea','Australia','Iran','Saudi Arabia','Qatar'],
    OFC:      [],
  },
  {
    year: '2026',
    UEFA:     ['Spain','France','England','Germany','Portugal','Netherlands','Belgium','Italy','Poland','Austria','Croatia','Hungary','Switzerland','Denmark','Turkey','Serbia'],
    CONMEBOL: ['Argentina','Brazil','Colombia','Uruguay','Ecuador','Venezuela'],
    CONCACAF: ['USA','Mexico','Canada','Costa Rica','Honduras','Panama'],
    CAF:      ['Morocco','Nigeria','Senegal','Ivory Coast','South Africa','Egypt','Ghana','Cameroon','Tunisia'],
    AFC:      ['Japan','South Korea','Australia','Iran','Saudi Arabia','Qatar','Iraq','Uzbekistan'],
    OFC:      ['New Zealand'],
  },
]

const buildHierarchy = () => ({
  name: 'root',
  children: YEARS.map(({ year, ...confs }) => ({
    name: year,
    children: Object.entries(confs)
      .filter(([, countries]) => countries.length > 0)
      .map(([conf, countries]) => ({
        name: conf,
        children: countries.map(name => ({ name })),
      })),
  })),
})

const pentPath = (cx, cy, r) => {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 - 90) * Math.PI / 180
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  })
  return `M ${pts.join(' L ')} Z`
}

const PENT_ANGLES = [0, 72, 144, 216, 288]
const LEGEND_CONFS = Object.keys(CONF_COLORS)
const LEGEND_START = (W - LEGEND_CONFS.length * 135 + 35) / 2

export default function FootballTreemap() {
  const [hovered, setHovered] = useState(null)

  const root = useMemo(() => {
    const h = hierarchy(buildHierarchy())
      .sum(d => (d.children ? 0 : 1))
      .sort((a, b) => b.value - a.value)
    treemap()
      .size([R * 2, R * 2])
      .paddingOuter(5)
      .paddingInner(1)
      .paddingTop(d => d.depth === 1 ? 20 : d.depth === 2 ? 8 : 0)
      .round(true)(h)
    return h
  }, [])

  const tx = CX - R  // treemap → SVG x offset
  const ty = CY - R  // treemap → SVG y offset

  const leaves = root.leaves()

  return (
    <div style={{ width: '100%', maxWidth: W, margin: '0 auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}>

        <defs>
          <clipPath id="ball-clip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
          <radialGradient id="ball-vignette" cx="40%" cy="32%" r="75%">
            <stop offset="0%"   stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.38)" />
          </radialGradient>
        </defs>

        {/* ── Ball background ── */}
        <circle cx={CX} cy={CY} r={R} fill="#0e0c09" />

        {/* ── Treemap + overlays (all clipped to ball) ── */}
        <g clipPath="url(#ball-clip)">

          {/* Country leaf cells */}
          {leaves.map((leaf, i) => {
            const conf    = leaf.parent.data.name
            const year    = leaf.parent.parent.data.name
            const country = leaf.data.name
            const x = leaf.x0 + tx, y = leaf.y0 + ty
            const w = leaf.x1 - leaf.x0, h2 = leaf.y1 - leaf.y0
            const color   = CONF_COLORS[conf]
            const isHov   = hovered?.conf === conf

            return (
              <rect key={i}
                x={x} y={y} width={w} height={h2} rx={1.5}
                fill={color}
                opacity={hovered ? (isHov ? 0.92 : 0.18) : 0.8}
                style={{ transition: 'opacity 0.15s', cursor: 'pointer' }}
                onMouseEnter={() => setHovered({ year, conf, country })}
                onMouseLeave={() => setHovered(null)}
              />
            )
          })}

          {/* Year section labels */}
          {root.children?.map(yn => {
            const yw = yn.x1 - yn.x0
            if (yw < 25) return null
            return (
              <text key={yn.data.name}
                x={yn.x0 + tx + yw / 2}
                y={yn.y0 + ty + 14}
                textAnchor="middle"
                fontSize={Math.min(13, yw * 0.18)} fontWeight="700"
                fontFamily="'Raleway', system-ui, sans-serif"
                fill="rgba(255,255,255,0.88)"
                style={{ pointerEvents: 'none' }}>
                {yn.data.name}
              </text>
            )
          })}

          {/* Confederation sub-labels (where space allows) */}
          {root.children?.flatMap(yn =>
            (yn.children ?? []).map(cn => {
              const cw = cn.x1 - cn.x0
              const ch = cn.y1 - cn.y0
              if (cw < 30 || ch < 12) return null
              return (
                <text key={`${yn.data.name}-${cn.data.name}`}
                  x={cn.x0 + tx + cw / 2}
                  y={cn.y0 + ty + 6}
                  textAnchor="middle"
                  fontSize={6.5} fontWeight="600"
                  fontFamily="'DM Sans', system-ui, sans-serif"
                  fill="rgba(255,255,255,0.65)"
                  style={{ pointerEvents: 'none' }}>
                  {cn.data.name}
                </text>
              )
            })
          )}

          {/* Football pentagon overlays */}
          {PENT_ANGLES.map((deg, i) => {
            const a  = (deg - 90) * Math.PI / 180
            const px = CX + R * 0.52 * Math.cos(a)
            const py = CY + R * 0.52 * Math.sin(a)
            return (
              <path key={i} d={pentPath(px, py, R * 0.115)}
                fill="rgba(0,0,0,0.13)"
                stroke="rgba(0,0,0,0.28)"
                strokeWidth={1.5}
                style={{ pointerEvents: 'none' }} />
            )
          })}
          {/* Centre pentagon */}
          <path d={pentPath(CX, CY, R * 0.115)}
            fill="rgba(0,0,0,0.13)"
            stroke="rgba(0,0,0,0.28)"
            strokeWidth={1.5}
            style={{ pointerEvents: 'none' }} />

          {/* Sphere vignette */}
          <circle cx={CX} cy={CY} r={R}
            fill="url(#ball-vignette)"
            style={{ pointerEvents: 'none' }} />
        </g>

        {/* ── Ball border ── */}
        <circle cx={CX} cy={CY} r={R}
          fill="none" stroke="#0e0c09" strokeWidth={4} />

        {/* ── Hover info bar ── */}
        <g style={{ transition: 'opacity 0.15s' }} opacity={hovered ? 1 : 0}>
          <rect x={CX - 170} y={CY + R + 12} width={340} height={28} rx={5}
            fill="rgba(14,12,9,0.88)" />
          <text x={CX} y={CY + R + 30} textAnchor="middle"
            fontSize={11.5} fontWeight="600"
            fontFamily="'DM Sans', system-ui, sans-serif"
            fill="white">
            {hovered
              ? `${hovered.country} · ${hovered.conf} · ${hovered.year}`
              : ''}
          </text>
        </g>

        {/* ── Legend ── */}
        {LEGEND_CONFS.map((conf, i) => {
          const lx = LEGEND_START + i * 135
          const ly = CY + R + 52
          return (
            <g key={conf}>
              <rect x={lx} y={ly} width={12} height={12} rx={2}
                fill={CONF_COLORS[conf]} />
              <text x={lx + 17} y={ly + 10}
                fontSize={10.5} fontWeight="500"
                fontFamily="'DM Sans', system-ui, sans-serif"
                fill="#4a3828">
                {conf}
              </text>
            </g>
          )
        })}

        {/* ── Source note ── */}
        <text x={W / 2} y={H - 14} textAnchor="middle"
          fontSize={8.5} fontStyle="italic"
          fontFamily="'DM Sans', system-ui, sans-serif" fill="#9a8870">
          Source: FIFA · Each cell = one team slot · Hover to identify country · 2026 squads based on qualification as of June 2026
        </text>
      </svg>
    </div>
  )
}
