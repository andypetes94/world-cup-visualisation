import { useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { geoNaturalEarth1, geoPath, geoGraticule } from 'd3-geo'
import { feature } from 'topojson-client'
import worldData from 'world-atlas/countries-110m.json'

// Public-folder assets are referenced with a root-relative path (e.g. '/players/x.jpg'),
// which needs the configured base prepended when the site is deployed under a sub-path.
const assetUrl = path => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

// ── Dimensions ────────────────────────────────────────────────────────────────
const W = 1200, H = 900
const cx = W / 2, cy = H / 2 + 10
const BASE_R = 295

// ── World map (computed once at module load) ──────────────────────────────────
// scale=252 makes the map slightly wider than the viewport so it bleeds to all edges
const projection = geoNaturalEarth1().scale(252).translate([cx, cy + 14])
const pathGen = geoPath(projection)
const WORLD_PATH = pathGen(feature(worldData, worldData.objects.land))
const GRATICULE_PATH = pathGen(geoGraticule().step([20, 20])())

// ── Data ──────────────────────────────────────────────────────────────────────
// Scores: Wikipedia English page views Jan–Jun 2026, normalised to Ronaldo = 100.
// Source: wikimedia.org/api/rest_v1/metrics/pageviews (actual data, fetched June 2026).
// dob used to compute age at WC kick-off (June 11 2026). Stats approximate as of Jun 2026.
const PLAYERS = [
  { rank: 1,  name: 'Cristiano Ronaldo',      short: 'RONALDO',    club: 'Al-Nassr',        country: 'Portugal',  score: 100,  wikiViews: 5738025,  photo: '/players/ronaldo.jpg',    age: 41, position: 'Forward',    caps: 228, intGoals: 143 },
  { rank: 2,  name: 'Lionel Messi',           short: 'MESSI',      club: 'Inter Miami',     country: 'Argentina', score: 65.2, wikiViews: 3739693,  photo: '/players/messi.jpg',      age: 38, position: 'Forward',    caps: 199, intGoals: 117 },
  { rank: 3,  name: 'Lamine Yamal',           short: 'YAMAL',      club: 'Barcelona',       country: 'Spain',     score: 43.9, wikiViews: 2516865,  photo: '/players/yamal.jpg',      age: 18, position: 'Winger',     caps: 25,  intGoals: 6   },
  { rank: 4,  name: 'Kylian Mbappé',          short: 'MBAPPÉ',     club: 'Real Madrid',     country: 'France',    score: 40.6, wikiViews: 2332287,  photo: '/players/mbappe.jpg',     age: 27, position: 'Forward',    caps: 98,  intGoals: 56  },
  { rank: 5,  name: 'Harry Kane',             short: 'KANE',       club: 'Bayern Munich',   country: 'England',   score: 39.4, wikiViews: 2258877,  photo: '/players/kane.jpg',       age: 32, position: 'Striker',    caps: 114, intGoals: 79  },
  { rank: 6,  name: 'Neymar Jr.',             short: 'NEYMAR',     club: 'Al-Hilal',        country: 'Brazil',    score: 37.7, wikiViews: 2163891,  photo: '/players/neymar.jpg',     age: 34, position: 'Forward',    caps: 128, intGoals: 79  },
  { rank: 7,  name: 'Erling Haaland',         short: 'HAALAND',    club: 'Man. City',       country: 'Norway',    score: 31.9, wikiViews: 1832749,  photo: '/players/haaland.jpg',    age: 25, position: 'Striker',    caps: 50,  intGoals: 55  },
  { rank: 8,  name: 'Mohamed Salah',          short: 'SALAH',      club: 'Free Agent',      country: 'Egypt',     score: 28.8, wikiViews: 1654930,  photo: '/players/salah.jpg',      age: 33, position: 'Winger',     caps: 84,  intGoals: 60  },
  { rank: 9,  name: 'Vinicius Jr.',           short: 'VINICIUS',   club: 'Real Madrid',     country: 'Brazil',    score: 19.6, wikiViews: 1125466,  photo: '/players/vinicius.jpg',   age: 25, position: 'Winger',     caps: 49,  intGoals: 9   },
  { rank: 10, name: 'Bukayo Saka',            short: 'SAKA',       club: 'Arsenal',         country: 'England',   score: 16.5, wikiViews:  944846,  photo: '/players/saka.jpg',       age: 24, position: 'Winger',     caps: 49,  intGoals: 14  },
  { rank: 11, name: 'Jude Bellingham',        short: 'BELLINGHAM', club: 'Real Madrid',     country: 'England',   score: 15.2, wikiViews:  873063,  photo: '/players/bellingham.jpg', age: 22, position: 'Midfielder', caps: 48,  intGoals: 6   },
  { rank: 12, name: 'Raphinha',               short: 'RAPHINHA',   club: 'Barcelona',       country: 'Brazil',    score: 12.2, wikiViews:  700257,  photo: '/players/raphinha.jpg',   age: 29, position: 'Winger',     caps: 40,  intGoals: 11  },
  { rank: 13, name: 'Phil Foden',             short: 'FODEN',      club: 'Man. City',       country: 'England',   score: 8.4,  wikiViews:  483837,  photo: '/players/foden.jpg',      age: 26, position: 'Midfielder', caps: 49,  intGoals: 4   },
  { rank: 14, name: 'Trent Alexander-Arnold', short: 'T. ARNOLD',  club: 'Real Madrid',     country: 'England',   score: 8.2,  wikiViews:  468741,  photo: '/players/taa.jpg',        age: 27, position: 'Right Back', caps: 34,  intGoals: 4   },
  { rank: 15, name: 'Florian Wirtz',          short: 'WIRTZ',      club: 'Liverpool',       country: 'Germany',   score: 7.8,  wikiViews:  449941,  photo: '/players/wirtz.jpg',      age: 23, position: 'Midfielder', caps: 42,  intGoals: 11  },
]

// Country ink colours — dominant national-team colour
const INK = {
  Portugal:  '#8b0020',  // Selecção deep crimson red
  Argentina: '#74acdf',  // albiceleste sky blue
  Spain:     '#aa151b',  // La Roja red
  France:    '#002395',  // bleu de France
  England:   '#cf142b',  // St George's Cross red
  Brazil:    '#009c3b',  // Canarinha green
  Norway:    '#ef2b2d',  // Norwegian flag red
  Egypt:     '#c8202a',  // Egyptian red (slightly darker than England)
  Germany:   '#1c1c2c',  // near-black (German kits)
}
const ink = c => INK[c] ?? '#4a3828'

// ── Stamp size scale ──────────────────────────────────────────────────────────
const sizeScale = scaleLinear().domain([17, 100]).range([68, 136])

// ── Sidelined players (grayed out + overlay stamp) ───────────────────────────
const INJURED      = new Set(['Neymar Jr.'])
const NOT_SELECTED = new Set(['Trent Alexander-Arnold', 'Phil Foden'])
const isSidelined  = name => INJURED.has(name) || NOT_SELECTED.has(name)
const sidelineLabel = name => INJURED.has(name) ? 'INJURED' : 'REJECTED'

function RejectionOverlay({ x, y, stampW, label }) {
  const r   = Math.max(24, stampW * 0.30)
  const id  = `rej-${Math.round(x)}-${Math.round(y)}`
  const sw  = Math.max(2, stampW * 0.022)
  const fsz = Math.max(6.5, r * 0.20)
  const botArc = `M ${r} 0 A ${r} ${r} 0 0 1 ${-r} 0`

  return (
    <g transform={`translate(${x},${y}) rotate(-18)`} opacity={0.88}>
      <defs>
        <path id={`${id}-b`} d={botArc} />
      </defs>

      {/* Double-ring circle */}
      <circle cx={0} cy={0} r={r}     fill="none" stroke="#8b1a1a" strokeWidth={sw} />
      <circle cx={0} cy={0} r={r - 5} fill="none" stroke="#8b1a1a" strokeWidth={0.8} strokeOpacity={0.5} />

      {/* Label centred */}
      <text x={0} y={-fsz * 0.6} textAnchor="middle" dominantBaseline="middle"
        fill="#8b1a1a" fontSize={fsz * 1.5} fontWeight="700"
        fontFamily="'Arial', 'Helvetica Neue', sans-serif" letterSpacing="2">
        {label}
      </text>

      {/* "WC 2026" arced along bottom half */}
      <text fill="#8b1a1a" fontSize={fsz * 0.82}
        fontFamily="'Arial', 'Helvetica Neue', sans-serif" letterSpacing="1.3">
        <textPath href={`#${id}-b`} startOffset="50%" textAnchor="middle">WC · 2026</textPath>
      </text>
    </g>
  )
}

// ── Host-city decorative stamps ───────────────────────────────────────────────
const CITY_STAMPS = [
  { city: 'TORONTO',     sub: 'CANADA',  color: '#c8102e', x: 1018, y:  88, rot:  13, type: 'circle' },
  { city: 'VANCOUVER',   sub: 'CANADA',  color: '#c8102e', x:  112, y: 192, rot: -15, type: 'circle' },
  { city: 'NEW YORK',    sub: 'USA',     color: '#3c3b6e', x: 1082, y: 400, rot:  -9, type: 'oval'   },
  { city: 'MIAMI',       sub: 'USA',     color: '#3c3b6e', x: 1040, y: 756, rot:   8, type: 'oval'   },
  { city: 'LOS ANGELES', sub: 'USA',     color: '#3c3b6e', x:  115, y: 770, rot:  11, type: 'oval'   },
  { city: 'MEXICO CITY', sub: 'MEXICO',  color: '#006847', x:  494, y: 858, rot:  -5, type: 'rect'   },
]

// ── City stamp component ──────────────────────────────────────────────────────
function CityStamp({ city, sub, color, x, y, rot, type }) {
  const g = (
    <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={0.62}>
      {type === 'circle' && (() => {
        const r1 = 46, r2 = 38
        return (
          <>
            <circle cx={0} cy={0} r={r1} fill="none" stroke={color} strokeWidth="2.6" />
            <circle cx={0} cy={0} r={r2} fill="none" stroke={color} strokeWidth="0.9" strokeOpacity="0.55" />
            {/* Maple-leaf stylised star */}
            <text x={0} y={-16} textAnchor="middle" dominantBaseline="middle"
              fill={color} fontSize="13" fontFamily="serif">✦</text>
            <text x={0} y={3} textAnchor="middle" dominantBaseline="middle"
              fill={color} fontSize="11.5" fontFamily="Raleway, sans-serif"
              fontWeight="700" letterSpacing="1.4">
              {city}
            </text>
            <line x1={-r2 + 6} y1={14} x2={r2 - 6} y2={14} stroke={color} strokeWidth="1.2" />
            <text x={0} y={25} textAnchor="middle" dominantBaseline="middle"
              fill={color} fontSize="9" fontFamily="Raleway, sans-serif"
              fontWeight="400" letterSpacing="2.5">
              {sub}
            </text>
          </>
        )
      })()}
      {type === 'oval' && (() => {
        const rX = 58, rY = 40
        return (
          <>
            <ellipse cx={0} cy={0} rx={rX} ry={rY} fill="none" stroke={color} strokeWidth="2.4" />
            <ellipse cx={0} cy={0} rx={rX - 6} ry={rY - 6}
              fill="none" stroke={color} strokeWidth="0.8" strokeOpacity="0.45" strokeDasharray="3 4" />
            <text x={0} y={-8} textAnchor="middle" dominantBaseline="middle"
              fill={color} fontSize="11" fontFamily="Raleway, sans-serif"
              fontWeight="700" letterSpacing="1.2">
              {city}
            </text>
            <line x1={-rX + 14} y1={4} x2={rX - 14} y2={4} stroke={color} strokeWidth="1.2" />
            <text x={0} y={17} textAnchor="middle" dominantBaseline="middle"
              fill={color} fontSize="8.5" fontFamily="Raleway, sans-serif"
              fontWeight="400" letterSpacing="2.8">
              · {sub} ·
            </text>
          </>
        )
      })()}
      {type === 'rect' && (() => {
        const rW = 114, rH = 64
        return (
          <>
            <rect x={-rW / 2} y={-rH / 2} width={rW} height={rH} rx={7}
              fill="none" stroke={color} strokeWidth="2.4" />
            <rect x={-rW / 2 + 5} y={-rH / 2 + 5} width={rW - 10} height={rH - 10} rx={4}
              fill="none" stroke={color} strokeWidth="0.8" strokeOpacity="0.45" />
            <text x={0} y={-10} textAnchor="middle" dominantBaseline="middle"
              fill={color} fontSize="12.5" fontFamily="Raleway, sans-serif"
              fontWeight="700" letterSpacing="1.4">
              {city}
            </text>
            <line x1={-rW / 2 + 14} y1={2} x2={rW / 2 - 14} y2={2} stroke={color} strokeWidth="1.2" />
            <text x={0} y={16} textAnchor="middle" dominantBaseline="middle"
              fill={color} fontSize="9" fontFamily="Raleway, sans-serif"
              fontWeight="400" letterSpacing="2.8">
              · {sub} ·
            </text>
          </>
        )
      })()}
    </g>
  )
  return g
}

// ── Perforations ──────────────────────────────────────────────────────────────
function Perforations({ x, y, w, h }) {
  const r = Math.max(2.6, w * 0.034)
  const gap = r * 2.8
  const x0 = x - w / 2, y0 = y - h / 2
  const pts = []
  for (let px = x0 + gap; px < x0 + w - gap / 2; px += gap) {
    pts.push([px, y0])
    pts.push([px, y0 + h])
  }
  for (let py = y0 + gap; py < y0 + h - gap / 2; py += gap) {
    pts.push([x0, py])
    pts.push([x0 + w, py])
  }
  return (
    <>
      {pts.map(([pcx, pcy], i) => (
        <circle key={i} cx={pcx} cy={pcy} r={r} fill="#f4ead8" />
      ))}
    </>
  )
}

// ── Stamp ─────────────────────────────────────────────────────────────────────
function Stamp({ player, x, y, w, faded, isHovered, onEnter, onLeave, notSelected }) {
  const h      = w * 1.45
  const color  = ink(player.country)
  const rx     = 7
  const perfR  = Math.max(2.6, w * 0.034)
  const fw     = perfR * 2 + 3        // colored frame width

  const clipId = `ph-${player.rank}`
  const gradId = `gr-${player.rank}`
  const rBadge = Math.max(7, w * 0.1) // rank badge radius

  // Inner content bounds
  const iX = x - w / 2 + fw
  const iY = y - h / 2 + fw
  const iW = w - fw * 2
  const iH = h - fw * 2

  // Photo: top 74% of inner area
  const pH = iH * 0.74

  // Text: bottom 26%
  const tY = iY + pH
  const tH = iH - pH

  const nameSz = Math.max(7, w * 0.098)
  const clubSz = Math.max(5.5, w * 0.078)

  // Rank badge position: top-right inside inner area
  const badgeCx = iX + iW - rBadge - 2
  const badgeCy = iY + rBadge + 2

  return (
    <g
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      opacity={notSelected ? (faded ? 0.12 : 0.42) : (faded ? 0.25 : 1)}
      style={{
        cursor: 'pointer',
        transformBox: 'fill-box',
        transformOrigin: 'center center',
        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
        filter: notSelected
          ? 'grayscale(1)'
          : isHovered
            ? `drop-shadow(0 8px 22px ${color}66)`
            : 'none',
        transition: 'opacity 0.22s ease, transform 0.32s cubic-bezier(0.34, 1.45, 0.64, 1), filter 0.25s ease',
      }}
    >
      {/* Colored stamp frame */}
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={rx} fill={color} />

      {/* Inner cream base */}
      <rect x={iX} y={iY} width={iW} height={iH} rx={Math.max(1, rx - 5)} fill="#faf6ee" />

      {/* Photo */}
      <defs>
        <clipPath id={clipId}>
          <rect x={iX} y={iY} width={iW} height={pH} />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="40%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.52)" />
        </linearGradient>
      </defs>

      {/* Shift image slightly down within clip so face is better centred */}
      <image
        href={assetUrl(player.photo)}
        x={iX} y={iY - pH * 0.12}
        width={iW} height={pH * 1.24}
        clipPath={`url(#${clipId})`}
        preserveAspectRatio="xMidYMin slice"
        style={{
          filter: isHovered ? 'saturate(1.22) brightness(1.05)' : 'saturate(1) brightness(1)',
          transition: 'filter 0.28s ease',
        }}
      />

      {/* Subtle gradient at bottom of photo to blend into text */}
      <rect x={iX} y={iY} width={iW} height={pH}
        fill={`url(#${gradId})`}
        clipPath={`url(#${clipId})`} />

      {/* Rank badge */}
      <circle cx={badgeCx} cy={badgeCy} r={rBadge} fill={color} />
      <text
        x={badgeCx} y={badgeCy}
        textAnchor="middle" dominantBaseline="central"
        fill="white"
        fontSize={Math.max(6, rBadge * 0.95)}
        fontFamily="Raleway, sans-serif"
        fontWeight="800"
      >
        {player.rank}
      </text>

      {/* Text area */}
      <rect x={iX} y={tY} width={iW} height={tH} fill="white" />

      {/* Thin separator line */}
      <line x1={iX + 6} y1={tY} x2={iX + iW - 6} y2={tY} stroke={color} strokeWidth="0.6" strokeOpacity="0.35" />

      {/* Player surname */}
      <text
        x={iX + iW / 2} y={tY + tH * 0.38}
        textAnchor="middle" dominantBaseline="middle"
        fill="#14100b"
        fontSize={nameSz}
        fontFamily="Raleway, sans-serif"
        fontWeight="700"
        letterSpacing="0.8"
      >
        {player.short}
      </text>

      {/* Club / city */}
      <text
        x={iX + iW / 2} y={tY + tH * 0.73}
        textAnchor="middle" dominantBaseline="middle"
        fill="#8a7a6a"
        fontSize={clubSz}
        fontFamily="Raleway, sans-serif"
        fontWeight="400"
        letterSpacing="0.5"
      >
        {player.country.toUpperCase()}
      </text>

      {/* Perforations punched through the colored frame */}
      <Perforations x={x} y={y} w={w} h={h} />

      {/* Ripple rect — mounts on hover and expands outward once */}
      {isHovered && (
        <rect className="stamp-ripple-rect"
          x={x - w / 2} y={y - h / 2} width={w} height={h} rx={rx}
          fill="none" stroke={color} strokeWidth="2.5"
        />
      )}
    </g>
  )
}

// ── Tooltip ──────────────────────────────────────────────────────────────────
const WC_START = new Date('2026-06-11')
function ageAtWC(dob) {
  const d = new Date(dob)
  let age = WC_START.getFullYear() - d.getFullYear()
  const m = WC_START.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && WC_START.getDate() < d.getDate())) age--
  return age
}

function PlayerTooltip({ player, screenX, screenY }) {
  const color    = ink(player.country)
  const rejected = isSidelined(player.name)
  const label    = sidelineLabel(player.name)
  const isMobile = window.innerWidth < 640
  const width    = isMobile ? 188 : 260
  const photoH   = isMobile ? 120 : 190
  const toLeft   = screenX > window.innerWidth * 0.58
  const left     = toLeft ? screenX - width - 24 : screenX + 24
  const top      = Math.max(10, Math.min(screenY - 160, window.innerHeight - (isMobile ? 330 : 460)))

  const statRow = [
    { label: 'Age at WC',  value: player.age },
    { label: 'Caps',       value: player.caps },
    { label: 'Int. Goals', value: player.intGoals },
  ]

  return (
    <div style={{
      position: 'fixed', left, top,
      width, zIndex: 1000, pointerEvents: 'none',
      background: '#fdfaf4',
      borderRadius: 5,
      boxShadow: '0 6px 28px rgba(0,0,0,0.20)',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Country colour accent bar */}
      <div style={{ height: 4, background: color }} />

      {/* Header */}
      <div style={{ padding: isMobile ? '8px 11px 7px' : '11px 15px 9px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: isMobile ? 8 : 9.5, color, fontWeight: 700, letterSpacing: '0.13em',
          textTransform: 'uppercase', marginBottom: 5 }}>
          Rank #{player.rank} · {player.country}
          {rejected && <span style={{ marginLeft: 8, background: '#8b1a1a', color: '#fff',
            padding: '1px 6px', borderRadius: 2, fontSize: 8.5, letterSpacing: '0.1em' }}>
            {label}
          </span>}
        </div>
        <div style={{ fontSize: isMobile ? 14.5 : 19, fontWeight: 700, color: '#14100b',
          lineHeight: 1.1, letterSpacing: '0.01em' }}>
          {player.name}
        </div>
        <div style={{ fontSize: isMobile ? 9.5 : 11, color: '#7a6e60', marginTop: 4 }}>
          {player.position}&ensp;·&ensp;{player.club}
        </div>
      </div>

      {/* Photo */}
      <img src={assetUrl(player.photo)} alt={player.name} style={{
        width: '100%', height: photoH, objectFit: 'cover',
        objectPosition: 'center 18%', display: 'block',
        filter: rejected ? 'grayscale(1)' : 'none',
      }} />

      {/* Stats grid */}
      <div style={{ padding: isMobile ? '9px 11px 10px' : '12px 15px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: isMobile ? '7px 10px' : '10px 14px' }}>
          {statRow.map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: isMobile ? 8 : 9, color: '#9a8870', textTransform: 'uppercase',
                letterSpacing: '0.09em', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: isMobile ? 13 : 16, fontWeight: 600, color: '#14100b' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Popularity score + raw views */}
        <div style={{ marginTop: isMobile ? 8 : 11, paddingTop: isMobile ? 7 : 9, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: isMobile ? 8 : 9, color: '#9a8870', textTransform: 'uppercase',
            letterSpacing: '0.09em', marginBottom: 2 }}>Wikipedia Interest Score</div>
          <div style={{ fontSize: isMobile ? 13 : 16, fontWeight: 600, color }}>{player.score.toFixed(1)} / 100</div>
          <div style={{ fontSize: isMobile ? 8.5 : 10, color: '#9a8870', marginTop: 2 }}>
            {player.wikiViews.toLocaleString()} page views (Jan – Jun 2026)
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Passport page background ──────────────────────────────────────────────────
function PassportBackground() {
  // Horizontal security sine-wave lines
  const waves = []
  for (let wy = 0; wy < H; wy += 10) {
    let d = `M 0 ${wy}`
    for (let wx = 0; wx <= W; wx += 5) {
      d += ` L ${wx} ${wy + 2.8 * Math.sin(wx * 0.038 + wy * 0.08)}`
    }
    waves.push(<path key={wy} d={d} stroke="rgba(120,160,180,0.13)" strokeWidth="0.4" fill="none" />)
  }

  return (
    <>
      {/* Parchment base */}
      <rect width={W} height={H} fill="#f4ead8" />

      {/* Inked world map — land silhouette + graticule grid */}
      <path d={WORLD_PATH}
        fill="rgba(45,28,6,0.14)"
        stroke="rgba(45,28,6,0.22)"
        strokeWidth="0.55"
      />
      <path d={GRATICULE_PATH}
        fill="none"
        stroke="rgba(45,28,6,0.07)"
        strokeWidth="0.35"
      />

      {/* Security guilloché lines on top */}
      {waves}

      {/* Page border — outer double line */}
      <rect x={13} y={13} width={W - 26} height={H - 26} rx={5}
        fill="none" stroke="rgba(130,100,55,0.30)" strokeWidth="1.2" />
      <rect x={19} y={19} width={W - 38} height={H - 38} rx={4}
        fill="none" stroke="rgba(130,100,55,0.15)" strokeWidth="0.6" />
    </>
  )
}

// ── Centre title — matches the reference image style ─────────────────────────
function CentreTitle() {
  return (
    <>
      {/* "THE ROAD TO" */}
      <text x={cx} y={cy - 88} textAnchor="middle"
        fill="#1a1208"
        fontSize="14" fontWeight="600" letterSpacing="5"
        fontFamily="'Raleway', system-ui, sans-serif">
        THE ROAD TO
      </text>

      {/* "WORLD CUP" */}
      <text x={cx} y={cy - 42} textAnchor="middle"
        fill="#1a1208"
        fontSize="44" fontWeight="700" letterSpacing="2"
        fontFamily="'Raleway', system-ui, sans-serif">
        WORLD CUP
      </text>

      {/* "2026" */}
      <text x={cx} y={cy + 18} textAnchor="middle"
        fill="#1a1208"
        fontSize="60" fontWeight="800" letterSpacing="5"
        fontFamily="'Raleway', system-ui, sans-serif">
        2026
      </text>

      {/* Subtitle */}
      <text x={cx} y={cy + 38} textAnchor="middle"
        fill="#1a1208"
        fontSize="11.5" fontWeight="300"
        fontFamily="'Raleway', system-ui, sans-serif">
        Most talked-about players
      </text>
      <text x={cx} y={cy + 54} textAnchor="middle"
        fill="#1a1208"
        fontSize="11.5" fontWeight="300"
        fontFamily="'Raleway', system-ui, sans-serif">
        ahead of the 2026 FIFA World Cup™
      </text>

      {/* Separator */}
      <line x1={cx - 90} y1={cy + 68} x2={cx + 90} y2={cy + 68}
        stroke="rgba(30,18,4,0.25)" strokeWidth="0.75" />

      {/* Data note */}
      <text x={cx} y={cy + 83} textAnchor="middle"
        fill="#5a4220"
        fontSize="9.5" fontStyle="italic" fontWeight="300"
        fontFamily="'Raleway', system-ui, sans-serif">
        Stamp size scaled by Wikipedia page views
      </text>
    </>
  )
}

// ── Flight-path dashed ring ───────────────────────────────────────────────────
function FlightRing() {
  return (
    <circle cx={cx} cy={cy} r={BASE_R + 10}
      fill="none"
      stroke="rgba(130,100,55,0.18)"
      strokeWidth="0.8"
      strokeDasharray="6 10"
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PassportViz() {
  const [hovered, setHovered] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  const handleEnter = (player) => (e) => {
    setHovered(player.rank)
    setTooltip({ player, x: e.clientX, y: e.clientY })
  }
  const handleLeave = () => {
    setHovered(null)
    setTooltip(null)
  }

  const n = PLAYERS.length
  const placed = PLAYERS.map((p, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    const w = sizeScale(p.score)
    const r = BASE_R + (w - 68) * 0.28
    return { ...p, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), w }
  })

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        @keyframes stampRectRipple {
          from { transform: scale(1);    opacity: 0.6; }
          to   { transform: scale(1.44); opacity: 0;   }
        }
        .stamp-ripple-rect {
          transform-box: fill-box;
          transform-origin: center center;
          animation: stampRectRipple 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          pointer-events: none;
        }
      `}</style>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 4 }}
        aria-label="Passport stamp visualisation: most searched footballers pre-World Cup 2026"
      >
        <PassportBackground />
        <FlightRing />
        <CentreTitle />

        {/* Host-city visa stamps */}
        {CITY_STAMPS.map(s => <CityStamp key={s.city} {...s} />)}

        {/* Render smallest stamps first so largest sit on top */}
        {[...placed]
          .sort((a, b) => a.score - b.score)
          .map(p => (
            <Stamp
              key={p.rank}
              player={p}
              x={p.x} y={p.y} w={p.w}
              faded={hovered !== null && hovered !== p.rank}
              isHovered={hovered === p.rank}
              notSelected={isSidelined(p.name)}
              onEnter={handleEnter(p)}
              onLeave={handleLeave}
            />
          ))}

        {/* Rejection overlays rendered last so always on top of other stamps */}
        {placed
          .filter(p => isSidelined(p.name))
          .map(p => (
            <RejectionOverlay key={`rej-${p.rank}`} x={p.x} y={p.y} stampW={p.w} label={sidelineLabel(p.name)} />
          ))}
      </svg>

      {tooltip && (
        <PlayerTooltip player={tooltip.player} screenX={tooltip.x} screenY={tooltip.y} />
      )}

      <p style={{
        textAlign: 'center', marginTop: 10,
        fontSize: 10.5, color: '#9a8c7a', letterSpacing: '0.06em',
        fontFamily: 'Raleway, sans-serif',
      }}>
        Scores: Wikipedia English page views Jan–Jun 2026, normalised to Ronaldo = 100. Source: Wikimedia REST API. Photos: Wikimedia Commons (CC BY-SA).
      </p>
    </div>
  )
}
