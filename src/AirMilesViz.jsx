import { useState, useMemo, useRef } from 'react'
import { geoMercator, geoPath, geoGraticule } from 'd3-geo'
import { feature } from 'topojson-client'
import worldData from 'world-atlas/countries-110m.json'
import { GROUPS, GROUP_PATHS, GROUP_MATCHES, VENUES, VENUE_ROUNDS, KNOCKOUT_MATCHES, haversineKm, kmToMiles } from './WorldCupTravelData'

const W = 1200
const MAP_W = 660, MAP_H = 480, PAD = 28

// Same palette as the Confederations chapter (UEFA blue / CONMEBOL red / CONCACAF teal)
const POS_COLOR = { Winner: '#c1121f', 'Runner-up': '#4895ef', 'Third Place': '#2a9d8f' }

// ── Real North America geometry (USA, Canada, Mexico), projected with d3-geo ──
// Matches the world-map approach used in PassportViz, fit to the venue map's canvas.
const NA_IDS = new Set(['840', '124', '484']) // USA, Canada, Mexico (ISO 3166-1 numeric)
const NA_FEATURES = feature(worldData, worldData.objects.countries).features.filter(f => NA_IDS.has(f.id))
const NA_COLLECTION = { type: 'FeatureCollection', features: NA_FEATURES }

// Fit the projection to the venues themselves (not the full country outlines) — the
// countries' Arctic/Alaska extents would otherwise dominate the bounds and squeeze
// every host city into one corner. The land mass still renders at full extent and
// is simply clipped to the visible map frame.
const VENUE_POINTS = { type: 'Feature', geometry: { type: 'MultiPoint', coordinates: Object.values(VENUES).map(v => [v.lon, v.lat]) } }

// Per-venue label overrides — offsets from dot centre; omit to use default (centred 16px above)
const LABEL_POS = {
  MET:  { dx: -20, dy: 4,  anchor: 'end'    },  // New York → left of dot
  LIN:  { dx: 0,   dy: 22, anchor: 'middle' },  // Philadelphia → below dot
  // Boston stays default (above) — northernmost, has clear space
}
const MAP_PROJECTION = geoMercator().fitExtent([[PAD, PAD], [MAP_W - PAD, MAP_H - PAD]], VENUE_POINTS)
const mapPathGen = geoPath(MAP_PROJECTION)
const NA_PATH = mapPathGen(NA_COLLECTION)
const GRATICULE_PATH = mapPathGen(geoGraticule().step([10, 10])())

// Small plane glyph used as each team's marker on the distance track — nose
// rotated to point right, in the direction of increasing distance.
function PlaneIcon({ size, color, opacity }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', transform: 'rotate(90deg)' }}>
      <path
        d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-5.5l8 2.5z"
        fill={color} opacity={opacity} />
    </svg>
  )
}

function project(lat, lon) {
  const [x, y] = MAP_PROJECTION([lon, lat])
  return { x, y }
}

// Control point for a quadratic curve bowed to one side of the travel direction
// (p1 -> p2), so a leg flown in the opposite direction (p2 -> p1, from a
// different team/route) bows to the other side instead of sitting on top of it.
function legControl(p1, p2) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y
  const len = Math.hypot(dx, dy) || 1
  const offset = Math.min(len * 0.12, 18)
  return { x: (p1.x + p2.x) / 2 + (-dy / len) * offset, y: (p1.y + p2.y) / 2 + (dx / len) * offset }
}

// Splits one quadratic Bézier leg into two at its midpoint (de Casteljau), so a
// direction arrow can sit cleanly mid-line instead of landing on the venue dot.
function splitLeg(p1, p2) {
  const c = legControl(p1, p2)
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
  const q1 = mid(p1, c), r1 = mid(c, p2), q2 = mid(q1, r1)
  return {
    first:  `M ${p1.x} ${p1.y} Q ${q1.x} ${q1.y} ${q2.x} ${q2.y}`,
    second: `M ${q2.x} ${q2.y} Q ${r1.x} ${r1.y} ${p2.x} ${p2.y}`,
  }
}

const POS_KEY = pos => pos.replace(/[^A-Za-z0-9]/g, '')

const ROUND_LABEL = { R32: 'Round of 32', R16: 'Round of 16', QF: 'Quarterfinal', SF: 'Semifinal', '3rd': '3rd Place Play-off', Final: 'Final', GS: 'Group Stage' }
const ROUND_ORDER = ['GS', 'R32', 'R16', 'QF', 'SF', '3rd', 'Final']

function legsKm(venueIds) {
  let total = 0
  for (let i = 0; i < venueIds.length - 1; i++) {
    total += haversineKm(VENUES[venueIds[i]], VENUES[venueIds[i + 1]])
  }
  return total
}

// A team's own 3 group-stage venues, in matchday order.
function teamGroupVenues(group, team) {
  return GROUP_MATCHES
    .filter(m => m.group === group && (m.home === team || m.away === team))
    .sort((a, b) => a.matchday - b.matchday)
    .map(m => m.venue)
}

// Full path for one team in one position: 3 group-stage legs + the knockout chain.
function teamPath(group, team, koChain) {
  const gs = teamGroupVenues(group, team).map(v => ({ venue: v, round: 'GS' }))
  const ko = koChain.map(m => ({ venue: KNOCKOUT_MATCHES[m].venue, round: KNOCKOUT_MATCHES[m].round }))
  const segments = [...gs, ...ko]
  return { segments, venues: segments.map(s => s.venue), km: legsKm(segments.map(s => s.venue)) }
}

// Builds 36 rows (12 groups × 3 finishing positions). Each row carries one
// entry per team in the group, since the group-stage leg is team-specific
// even though the knockout-stage leg is determined purely by finishing position.
function buildRows() {
  const rows = []
  for (const g of Object.keys(GROUPS)) {
    const thirdChains = GROUP_PATHS[g].thirdPlaceOptions

    const teams = GROUPS[g].map(team => {
      const winner   = teamPath(g, team, GROUP_PATHS[g].winner)
      const runnerUp = teamPath(g, team, GROUP_PATHS[g].runnerUp)
      const thirdPaths = thirdChains.map(chain => teamPath(g, team, chain))
      const third = {
        ...thirdPaths[0],
        km: thirdPaths.reduce((a, p) => a + p.km, 0) / thirdPaths.length,
      }
      return { name: team, winner, runnerUp, third }
    })

    rows.push({ group: g, position: 'Winner',     teams: teams.map(t => ({ name: t.name, ...t.winner })) })
    rows.push({ group: g, position: 'Runner-up',   teams: teams.map(t => ({ name: t.name, ...t.runnerUp })) })
    rows.push({ group: g, position: 'Third Place', teams: teams.map(t => ({ name: t.name, ...t.third })), optionCount: thirdChains.length })
  }
  rows.forEach(r => {
    r.minKm = Math.min(...r.teams.map(t => t.km))
    r.maxKm = Math.max(...r.teams.map(t => t.km))
  })
  return rows.sort((a, b) => b.maxKm - a.maxKm)
}

// When two teams in the same row land within a hair's width of each other on the
// shared scale, their dots would otherwise stack exactly on top of one another —
// only the last-rendered one stays hoverable. Nudge near-duplicates apart vertically
// so every team keeps its own hoverable dot.
function buildDotOffsets(rows, maxAllKm) {
  const thresholdKm = maxAllKm * 0.012
  return rows.map(r => {
    const dy = new Array(r.teams.length).fill(0)
    const order = r.teams.map((t, ti) => ({ ti, km: t.km })).sort((a, b) => a.km - b.km)
    let cluster = [order[0]]
    const flush = () => {
      const n = cluster.length
      if (n > 1) {
        const step = 5
        cluster.forEach((c, i) => { dy[c.ti] = (i - (n - 1) / 2) * step })
      }
      cluster = []
    }
    for (let i = 1; i < order.length; i++) {
      if (order[i].km - order[i - 1].km < thresholdKm) {
        cluster.push(order[i])
      } else {
        flush()
        cluster = [order[i]]
      }
    }
    flush()
    return dy
  })
}

export default function AirMilesViz() {
  const rows = useMemo(buildRows, [])
  const [hov, setHov] = useState(null) // { rowIdx, teamIdx? }
  const [tooltip, setTooltip] = useState(null) // { x, y, containerW }
  const [venueTip, setVenueTip] = useState(null) // { id, x, y, containerW }
  const [stadiumImages, setStadiumImages] = useState({}) // venueId -> { url } | { error: true }
  const containerRef = useRef(null)
  const maxAllKm = Math.max(...rows.map(r => r.maxKm))
  const dotOffsets = useMemo(() => buildDotOffsets(rows, maxAllKm), [rows, maxAllKm])

  const hoveredRow = hov ? rows[hov.rowIdx] : null
  const hoveredTeams = hov
    ? (hov.teamIdx !== undefined ? [hoveredRow.teams[hov.teamIdx]] : hoveredRow.teams)
    : []

  // venues touched by the hovered selection, across all its candidate teams
  const activeVenueIds = useMemo(() => {
    const s = new Set()
    hoveredTeams.forEach(t => t.venues.forEach(v => s.add(v)))
    return s
  }, [hoveredTeams])

  const trackMouse = e => {
    const rect = containerRef.current.getBoundingClientRect()
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, containerW: rect.width })
  }

  const trackVenueMouse = (e, id) => {
    const rect = containerRef.current.getBoundingClientRect()
    setVenueTip({ id, x: e.clientX - rect.left, y: e.clientY - rect.top, containerW: rect.width })
    if (!stadiumImages[id]) {
      setStadiumImages(prev => ({ ...prev, [id]: { loading: true } }))
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(VENUES[id].name)}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setStadiumImages(prev => ({ ...prev, [id]: { url: data.thumbnail?.source || null } })))
        .catch(() => setStadiumImages(prev => ({ ...prev, [id]: { error: true } })))
    }
  }

  const isMobile = window.innerWidth < 640
  const tooltipTeam = hov?.teamIdx !== undefined ? hoveredRow.teams[hov.teamIdx] : null
  const tooltipLegs = useMemo(() => {
    if (!tooltipTeam) return null
    return tooltipTeam.segments.slice(1).map((s, i) => {
      const prev = tooltipTeam.segments[i]
      return {
        city: VENUES[s.venue].city,
        round: ROUND_LABEL[s.round],
        km: haversineKm(VENUES[prev.venue], VENUES[s.venue]),
      }
    })
  }, [tooltipTeam])
  // For Third Place rows the legs above trace one representative entry match;
  // sum them directly so the breakdown always foots to the displayed total.
  const tooltipLegsTotal = tooltipLegs?.reduce((a, l) => a + l.km, 0)

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: W, margin: '0 auto', position: 'relative' }}
      onClick={() => { setHov(null); setTooltip(null); setVenueTip(null) }}>
      <div className="chart-header">
        <p className="chart-title">The Road to the Final</p>
        <p className="chart-subtitle">How far each group's qualifiers must fly across the bracket to reach MetLife Stadium &middot; great-circle distance, group stage through the Final, for each of the 4 teams that could occupy that finishing position</p>
      </div>

      <div className="airmiles-panels">

        {/* ── Map ── */}
        <div style={{ flex: '1 1 460px', minWidth: 320, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: '1 1 auto', minHeight: 0 }}>
            <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <clipPath id="na-map-clip">
                <rect x={0} y={0} width={MAP_W} height={MAP_H} rx={6} />
              </clipPath>
              {Object.entries(POS_COLOR).map(([pos, color]) => (
                <marker key={pos} id={`arrow-${POS_KEY(pos)}`}
                  viewBox="0 0 10 10" refX="7" refY="5"
                  markerWidth={7} markerHeight={7}
                  markerUnits="userSpaceOnUse" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
                </marker>
              ))}
            </defs>

            <rect x={0} y={0} width={MAP_W} height={MAP_H} rx={6} fill="#f6f5f2" stroke="rgba(0,0,0,0.08)" />

            <g clipPath="url(#na-map-clip)">
              <path d={GRATICULE_PATH} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth={0.4} />
              <path d={NA_PATH} fill="#dcdad3" stroke="#aba89c" strokeWidth={0.9} />
            </g>

            {/* hovered route(s) — one curved segment per leg, with a direction arrow at its midpoint */}
            {hoveredRow && hoveredTeams.flatMap((t, ti) => {
              const pts = t.venues.map(id => {
                const v = VENUES[id]
                return project(v.lat, v.lon)
              })
              const isMulti = hoveredTeams.length > 1
              const markerId = `arrow-${POS_KEY(hoveredRow.position)}`
              const common = {
                fill: 'none',
                stroke: POS_COLOR[hoveredRow.position],
                strokeWidth: isMulti ? 1.5 : 2.5,
                opacity: isMulti ? 0.55 : 0.85,
                strokeLinecap: 'round',
              }
              return pts.slice(1).flatMap((p2, i) => {
                const { first, second } = splitLeg(pts[i], p2)
                return [
                  <path key={`${ti}-${i}-a`} d={first} {...common} markerEnd={`url(#${markerId})`} />,
                  <path key={`${ti}-${i}-b`} d={second} {...common} />,
                ]
              })
            })}

            {/* venue dots */}
            {Object.entries(VENUES).map(([id, v]) => {
              const { x, y } = project(v.lat, v.lon)
              const active = activeVenueIds.has(id)
              const isVenueHov = venueTip?.id === id
              return (
                <g key={id}
                  onMouseEnter={e => trackVenueMouse(e, id)}
                  onMouseMove={e => trackVenueMouse(e, id)}
                  onMouseLeave={() => setVenueTip(null)}
                  onClick={e => {
                    e.stopPropagation()
                    if (venueTip?.id === id) setVenueTip(null)
                    else trackVenueMouse(e, id)
                  }}
                  style={{ cursor: 'pointer' }}>
                  <circle cx={x} cy={y} r={16} fill="transparent" />
                  <circle cx={x} cy={y} r={isVenueHov ? 14 : (active ? 11 : 8)}
                    fill={active ? (hoveredRow ? POS_COLOR[hoveredRow.position] : '#9a8870') : '#c9a05c'}
                    stroke="#fdfaf4" strokeWidth={1.8}
                    opacity={isVenueHov ? 1 : (hoveredRow ? (active ? 1 : 0.3) : 0.9)}
                    style={{ transition: 'opacity 0.15s, r 0.15s' }} />
                  {(() => {
                    const lo = LABEL_POS[id]
                    const lx = x + (lo?.dx ?? 0)
                    const ly = lo ? y + lo.dy : y - 16
                    const la = lo?.anchor ?? 'middle'
                    return (
                      <text x={lx} y={ly} textAnchor={la}
                        fontSize={14} fontWeight={active || isVenueHov ? 700 : 500}
                        fontFamily="'DM Sans', system-ui, sans-serif"
                        fill={active || isVenueHov ? '#2d2410' : '#9a8870'}
                        opacity={isVenueHov ? 1 : (hoveredRow ? (active ? 1 : 0.3) : 0.75)}
                        style={{ transition: 'opacity 0.15s' }}>
                        {v.city}
                      </text>
                    )
                  })()}
                </g>
              )
            })}
            </svg>
          </div>

          {/* route detail panel */}
          <div style={{
            flex: '0 0 auto', marginTop: 12, minHeight: 64, padding: '10px 14px',
            background: '#fdfaf4', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 6,
          }}>
            {hoveredRow ? (
              <>
                <div style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontWeight: 700, fontSize: 13, color: '#2d2410', marginBottom: 4 }}>
                  Group {hoveredRow.group} &middot; {hoveredRow.position}
                  {hov.teamIdx !== undefined && <span style={{ color: '#9a8870', fontWeight: 500 }}> &middot; {hoveredRow.teams[hov.teamIdx].name}</span>}
                  {hoveredRow.optionCount > 1 && <span style={{ color: '#9a8870', fontWeight: 500 }}> (knockout leg averaged over {hoveredRow.optionCount} possible entry points)</span>}
                </div>
                <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11.5, color: '#6b5a48', lineHeight: 1.6 }}>
                  {hoveredTeams.length === 1
                    ? hoveredTeams[0].segments.map(s => `${VENUES[s.venue].city} (${ROUND_LABEL[s.round]})`).join(' → ')
                    : `Showing all 4 possible teams' routes · hover a dot to isolate one`}
                </div>
              </>
            ) : (
              <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11.5, color: '#9a8870', fontStyle: 'italic' }}>
                Hover a row to see all 4 candidate teams' routes &middot; hover a dot for one team's full path, group stage through the Final &middot; hover a venue on the map for stadium details.
              </div>
            )}
          </div>
        </div>

        {/* ── Bar chart ── */}
        <div style={{ flex: '1 1 480px', minWidth: 320, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'space-between', padding: '0 4px 8px', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a8870' }}>
            <span>Path to the Final</span>
            <span>Distance &middot; group stage through Final</span>
          </div>
          <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', paddingRight: 6 }}>
            {rows.map((r, i) => {
              const isRowHov = hov?.rowIdx === i
              const minPct = (r.minKm / maxAllKm) * 100
              const maxPct = (r.maxKm / maxAllKm) * 100
              return (
                <div key={`${r.group}-${r.position}`}
                  onMouseEnter={() => setHov({ rowIdx: i })}
                  onMouseLeave={() => { setHov(null); setTooltip(null) }}
                  onClick={e => {
                    e.stopPropagation()
                    if (hov?.rowIdx === i && hov?.teamIdx === undefined) {
                      setHov(null)
                      setTooltip(null)
                    } else {
                      setHov({ rowIdx: i })
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '5px 4px', borderRadius: 4, cursor: 'pointer',
                    background: isRowHov ? 'rgba(0,0,0,0.035)' : 'transparent',
                  }}>
                  <div style={{
                    flex: '0 0 110px', fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: 11.5, fontWeight: isRowHov ? 700 : 500,
                    color: isRowHov ? '#2d2410' : '#4a3828', lineHeight: 1.3,
                  }}>
                    Group {r.group}
                    <div style={{ fontSize: 9.5, color: POS_COLOR[r.position], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {r.position}{r.optionCount > 1 ? '*' : ''}
                    </div>
                  </div>

                  <div style={{ flex: 1, height: 22, position: 'relative' }}>
                    {/* dashed flight path */}
                    <div style={{
                      position: 'absolute', top: '50%', left: 2, right: 2, height: 0,
                      borderTop: '1.5px dashed rgba(74,56,40,0.22)', transform: 'translateY(-50%)',
                    }} />
                    {/* departure marker — group stage start */}
                    <div style={{ position: 'absolute', top: '50%', left: 0, transform: 'translate(-50%, -50%)' }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#9a8870',
                      }} />
                      <span style={{
                        position: 'absolute', bottom: '100%', left: '50%',
                        transform: 'translateX(-50%)', marginBottom: 3,
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                        color: '#9a8870', whiteSpace: 'nowrap',
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                      }}>START</span>
                    </div>
                    {/* arrival marker — the Final */}
                    <div style={{ position: 'absolute', top: '50%', right: 0, transform: 'translate(50%, -50%)' }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        border: '1.5px solid #9a8870', background: '#fdfaf4',
                      }} />
                      <span style={{
                        position: 'absolute', bottom: '100%', left: '50%',
                        transform: 'translateX(-50%)', marginBottom: 3,
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                        color: '#9a8870', whiteSpace: 'nowrap',
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                      }}>NYC</span>
                    </div>
                    {/* min–max range band — fades like a contrail from start toward the longer journey */}
                    <div style={{
                      position: 'absolute', top: '50%', height: 4, transform: 'translateY(-50%)',
                      left: 0, width: `${maxPct}%`,
                      background: `linear-gradient(90deg, transparent, ${POS_COLOR[r.position]})`,
                      opacity: isRowHov ? 0.5 : 0.3, borderRadius: 2,
                    }} />
                    {/* one plane marker per candidate team */}
                    {r.teams.map((t, ti) => {
                      const isDotHov = hov?.rowIdx === i && hov?.teamIdx === ti
                      const pct = (t.km / maxAllKm) * 100
                      const dy = dotOffsets[i][ti]
                      const size = isDotHov ? 17 : 13
                      return (
                        <div key={t.name}
                          onMouseEnter={e => { e.stopPropagation(); setHov({ rowIdx: i, teamIdx: ti }); trackMouse(e) }}
                          onMouseMove={e => { e.stopPropagation(); trackMouse(e) }}
                          onClick={e => {
                            e.stopPropagation()
                            if (isDotHov) {
                              setHov(null)
                              setTooltip(null)
                            } else {
                              setHov({ rowIdx: i, teamIdx: ti })
                              trackMouse(e)
                            }
                          }}
                          style={{
                            position: 'absolute', top: '50%', left: `${pct}%`,
                            width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transform: `translate(-50%, -50%) translateY(${dy}px)`,
                            filter: isDotHov ? 'drop-shadow(0 0 3px rgba(0,0,0,0.35))' : 'none',
                            cursor: 'pointer',
                            transition: 'opacity 0.1s',
                          }}>
                          <PlaneIcon size={size} color={POS_COLOR[r.position]}
                            opacity={isDotHov ? 1 : (isRowHov ? 0.9 : 0.7)} />
                        </div>
                      )
                    })}
                  </div>

                  <div style={{
                    flex: '0 0 108px', textAlign: 'right',
                    fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 10.5,
                    fontWeight: isRowHov ? 700 : 500, color: isRowHov ? '#2d2410' : '#6b5a48',
                  }}>
                    {Math.round(r.minKm).toLocaleString()}&ndash;{Math.round(r.maxKm).toLocaleString()} km
                    <div style={{ fontSize: 9.5, color: '#9a8870', fontWeight: 400 }}>
                      {Math.round(kmToMiles(r.minKm)).toLocaleString()}&ndash;{Math.round(kmToMiles(r.maxKm)).toLocaleString()} mi
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p style={{ flex: '0 0 auto', marginTop: 8, fontSize: 9.5, color: '#9a8870', fontStyle: 'italic', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            Each row shows 4 dots, one per team that could finish in that position &mdash; total distance from their first group match through the Final.
            Rows sorted by each position's longest possible journey.
            * Third-place qualifiers enter the bracket at one of several possible matches depending on final group rankings &mdash; the knockout leg shown is averaged across all of that group's possibilities.
          </p>
        </div>
      </div>

      {tooltip && tooltipTeam && (
        <div style={{
          position: 'absolute',
          top: tooltip.y + 16,
          left: tooltip.containerW - tooltip.x < 200 ? undefined : tooltip.x + 14,
          right: tooltip.containerW - tooltip.x < 200 ? tooltip.containerW - tooltip.x + 14 : undefined,
          background: 'rgba(253, 250, 244, 0.97)',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 6,
          boxShadow: '0 6px 20px rgba(20,16,11,0.18)',
          padding: isMobile ? '5px 7px' : '10px 14px',
          minWidth: isMobile ? 115 : 190,
          maxWidth: isMobile ? 140 : 230,
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <div style={{
            fontFamily: "'Raleway', system-ui, sans-serif",
            fontWeight: 700, fontSize: isMobile ? 8.5 : 13,
            color: '#2d2410', marginBottom: 2,
          }}>
            {tooltipTeam.name}
          </div>
          <div style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: isMobile ? 6.5 : 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            color: POS_COLOR[hoveredRow.position], marginBottom: 4,
          }}>
            Group {hoveredRow.group} &middot; {hoveredRow.position}
          </div>
          <div style={{
            fontSize: isMobile ? 7 : 10.5, color: '#9a8870', fontStyle: 'italic', marginBottom: 4,
          }}>
            Starts: {VENUES[tooltipTeam.segments[0].venue].city}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tooltipLegs.map((leg, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', gap: 8,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: isMobile ? 7.5 : 11.5, color: '#4a3828',
              }}>
                <span>{leg.city} <span style={{ color: '#9a8870', fontSize: isMobile ? 6.5 : 9.5 }}>({leg.round})</span></span>
                <span style={{ color: '#9a8870', fontWeight: 600, whiteSpace: 'nowrap' }}>+{Math.round(leg.km).toLocaleString()} km</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(0,0,0,0.08)',
            display: 'flex', justifyContent: 'space-between',
            fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 7.5 : 11.5, fontWeight: 700, color: '#2d2410',
          }}>
            <span>Total</span>
            <span>{Math.round(tooltipLegsTotal).toLocaleString()} km &middot; {Math.round(kmToMiles(tooltipLegsTotal)).toLocaleString()} mi</span>
          </div>
          {hoveredRow.optionCount > 1 && (
            <div style={{
              marginTop: 4, fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: isMobile ? 6.5 : 9.5, color: '#9a8870', fontStyle: 'italic',
            }}>
              One of {hoveredRow.optionCount} possible knockout entry points &mdash; chart bar uses the average
            </div>
          )}
        </div>
      )}

      {venueTip && (() => {
        const v = VENUES[venueTip.id]
        const img = stadiumImages[venueTip.id]
        const rounds = ROUND_ORDER.filter(r => VENUE_ROUNDS[venueTip.id].has(r)).map(r => ROUND_LABEL[r])
        const flip = venueTip.containerW - venueTip.x < 220
        return (
          <div style={{
            position: 'absolute',
            top: venueTip.y + 16,
            left: flip ? undefined : venueTip.x + 14,
            right: flip ? venueTip.containerW - venueTip.x + 14 : undefined,
            background: 'rgba(253, 250, 244, 0.97)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 6,
            boxShadow: '0 6px 20px rgba(20,16,11,0.18)',
            overflow: 'hidden',
            width: isMobile ? 125 : 210,
            pointerEvents: 'none',
            zIndex: 11,
          }}>
            {img?.url && (
              <img src={img.url} alt={v.name} style={{ width: '100%', height: isMobile ? 50 : 110, objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{ padding: isMobile ? '5px 7px' : '10px 14px' }}>
              <div style={{ fontFamily: "'Raleway', system-ui, sans-serif", fontWeight: 700, fontSize: isMobile ? 8.5 : 13, color: '#2d2410' }}>
                {v.name}
              </div>
              <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 6.5 : 10.5, color: '#9a8870', fontStyle: 'italic', marginBottom: 4 }}>
                {v.city}, {v.country}
              </div>
              <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 7.5 : 11.5, color: '#4a3828', marginBottom: 3 }}>
                Capacity: <strong>{v.capacity.toLocaleString()}</strong>
              </div>
              <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 6.5 : 10.5, color: '#4a3828', lineHeight: 1.4 }}>
                {rounds.map((r, i) => <div key={i}>{r}</div>)}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
