import { useState } from 'react'

// Public-folder assets are referenced with a root-relative path (e.g. '/players/x.jpg'),
// which needs the configured base prepended when the site is deployed under a sub-path.
const assetUrl = path => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

// ── Shared palette ────────────────────────────────────────────────────────────
const INK = {
  Portugal:  '#8b0020',
  Argentina: '#74acdf',
  Spain:     '#aa151b',
  France:    '#002395',
  England:   '#cf142b',
  Brazil:    '#009c3b',
  Norway:    '#ef2b2d',
  Egypt:     '#c8202a',
  Germany:   '#1c1c2c',
}
const ink = c => INK[c] ?? '#4a3828'

// ── Player roster ─────────────────────────────────────────────────────────────
const PLAYERS = [
  { rank: 1,  name: 'Cristiano Ronaldo',      short: 'RONALDO',    club: 'Al-Nassr',      country: 'Portugal',  score: 100,  wikiViews: 5738025, photo: '/players/ronaldo.jpg',    age: 41, position: 'Forward',    caps: 228, intGoals: 143 },
  { rank: 2,  name: 'Lionel Messi',           short: 'MESSI',      club: 'Inter Miami',   country: 'Argentina', score: 65.2, wikiViews: 3739693, photo: '/players/messi.jpg',      age: 38, position: 'Forward',    caps: 199, intGoals: 117 },
  { rank: 3,  name: 'Lamine Yamal',           short: 'YAMAL',      club: 'Barcelona',     country: 'Spain',     score: 43.9, wikiViews: 2516865, photo: '/players/yamal.jpg',      age: 18, position: 'Winger',     caps: 25,  intGoals: 6   },
  { rank: 4,  name: 'Kylian Mbappé',          short: 'MBAPPÉ',     club: 'Real Madrid',   country: 'France',    score: 40.6, wikiViews: 2332287, photo: '/players/mbappe.jpg',     age: 27, position: 'Forward',    caps: 98,  intGoals: 56  },
  { rank: 5,  name: 'Harry Kane',             short: 'KANE',       club: 'Bayern Munich', country: 'England',   score: 39.4, wikiViews: 2258877, photo: '/players/kane.jpg',       age: 32, position: 'Striker',    caps: 114, intGoals: 79  },
  { rank: 6,  name: 'Neymar Jr.',             short: 'NEYMAR',     club: 'Al-Hilal',      country: 'Brazil',    score: 37.7, wikiViews: 2163891, photo: '/players/neymar.jpg',     age: 34, position: 'Forward',    caps: 128, intGoals: 79  },
  { rank: 7,  name: 'Erling Haaland',         short: 'HAALAND',    club: 'Man. City',     country: 'Norway',    score: 31.9, wikiViews: 1832749, photo: '/players/haaland.jpg',    age: 25, position: 'Striker',    caps: 50,  intGoals: 55  },
  { rank: 8,  name: 'Mohamed Salah',          short: 'SALAH',      club: 'Liverpool',     country: 'Egypt',     score: 28.8, wikiViews: 1654930, photo: '/players/salah.jpg',      age: 33, position: 'Winger',     caps: 84,  intGoals: 60  },
  { rank: 9,  name: 'Vinicius Jr.',           short: 'VINICIUS',   club: 'Real Madrid',   country: 'Brazil',    score: 19.6, wikiViews: 1125466, photo: '/players/vinicius.jpg',   age: 25, position: 'Winger',     caps: 49,  intGoals: 9   },
  { rank: 10, name: 'Bukayo Saka',            short: 'SAKA',       club: 'Arsenal',       country: 'England',   score: 16.5, wikiViews:  944846, photo: '/players/saka.jpg',       age: 24, position: 'Winger',     caps: 49,  intGoals: 14  },
  { rank: 11, name: 'Jude Bellingham',        short: 'BELLINGHAM', club: 'Real Madrid',   country: 'England',   score: 15.2, wikiViews:  873063, photo: '/players/bellingham.jpg', age: 22, position: 'Midfielder', caps: 48,  intGoals: 6   },
  { rank: 12, name: 'Raphinha',               short: 'RAPHINHA',   club: 'Barcelona',     country: 'Brazil',    score: 12.2, wikiViews:  700257, photo: '/players/raphinha.jpg',   age: 29, position: 'Winger',     caps: 40,  intGoals: 11  },
  { rank: 13, name: 'Phil Foden',             short: 'FODEN',      club: 'Man. City',     country: 'England',   score: 8.4,  wikiViews:  483837, photo: '/players/foden.jpg',      age: 26, position: 'Midfielder', caps: 49,  intGoals: 4   },
  { rank: 14, name: 'Trent Alexander-Arnold', short: 'T. ARNOLD',  club: 'Real Madrid',   country: 'England',   score: 8.2,  wikiViews:  468741, photo: '/players/taa.jpg',        age: 27, position: 'Right Back', caps: 34,  intGoals: 4   },
  { rank: 15, name: 'Florian Wirtz',          short: 'WIRTZ',      club: 'Bayern Munich', country: 'Germany',   score: 7.8,  wikiViews:  449941, photo: '/players/wirtz.jpg',      age: 23, position: 'Midfielder', caps: 42,  intGoals: 11  },
]
const playerByName = Object.fromEntries(PLAYERS.map(p => [p.name, p]))

const INJURED       = new Set(['Neymar Jr.'])
const NOT_SELECTED  = new Set(['Trent Alexander-Arnold', 'Phil Foden'])
const isSidelined   = n => INJURED.has(n) || NOT_SELECTED.has(n)
const sidelineLabel = n => INJURED.has(n) ? 'INJURED' : 'NOT SELECTED'

// ── US tile-cartogram grid ────────────────────────────────────────────────────
// col/row positions replicate the "birds" schematic layout
// col/row values derived from the reference site's actual grid data
// (us_state_hex_locations.csv) — alternating rows are offset by half a column,
// producing the same brick/staggered tile-grid look.
const STATES = [
  { name: 'Alaska',               label: 'ALASKA',        col: 0,    row: 0 },
  { name: 'Maine',                label: 'MAINE',         col: 11,   row: 0 },
  { name: 'Vermont',              label: 'VERMONT',       col: 9.5,  row: 1 },
  { name: 'New Hampshire',        label: 'NEW HAMPSHIRE', col: 10.5, row: 1 },
  { name: 'Washington',           label: 'WASHINGTON',    col: 1,    row: 2 },
  { name: 'Montana',              label: 'MONTANA',       col: 2,    row: 2 },
  { name: 'North Dakota',         label: 'N. DAKOTA',     col: 3,    row: 2 },
  { name: 'Minnesota',            label: 'MINNESOTA',     col: 4,    row: 2 },
  { name: 'Wisconsin',            label: 'WISCONSIN',     col: 5,    row: 2 },
  { name: 'Michigan',             label: 'MICHIGAN',      col: 7,    row: 2 },
  { name: 'New York',             label: 'NEW YORK',      col: 9,    row: 2 },
  { name: 'Massachusetts',        label: 'MASSACHUSETTS', col: 10,   row: 2 },
  { name: 'Rhode Island',         label: 'RHODE ISLAND',  col: 11,   row: 2 },
  { name: 'Idaho',                label: 'IDAHO',         col: 1.5,  row: 3 },
  { name: 'Wyoming',              label: 'WYOMING',       col: 2.5,  row: 3 },
  { name: 'South Dakota',         label: 'S. DAKOTA',     col: 3.5,  row: 3 },
  { name: 'Iowa',                 label: 'IOWA',          col: 4.5,  row: 3 },
  { name: 'Illinois',             label: 'ILLINOIS',      col: 5.5,  row: 3 },
  { name: 'Indiana',              label: 'INDIANA',       col: 6.5,  row: 3 },
  { name: 'Ohio',                 label: 'OHIO',          col: 7.5,  row: 3 },
  { name: 'Pennsylvania',         label: 'PENNSYLVANIA',  col: 8.5,  row: 3 },
  { name: 'New Jersey',           label: 'NEW JERSEY',    col: 9.5,  row: 3 },
  { name: 'Connecticut',          label: 'CONNECTICUT',   col: 10.5, row: 3 },
  { name: 'Oregon',               label: 'OREGON',        col: 1,    row: 4 },
  { name: 'Nevada',               label: 'NEVADA',        col: 2,    row: 4 },
  { name: 'Colorado',             label: 'COLORADO',      col: 3,    row: 4 },
  { name: 'Nebraska',             label: 'NEBRASKA',      col: 4,    row: 4 },
  { name: 'Missouri',             label: 'MISSOURI',      col: 5,    row: 4 },
  { name: 'Kentucky',             label: 'KENTUCKY',      col: 6,    row: 4 },
  { name: 'West Virginia',        label: 'W. VIRGINIA',   col: 7,    row: 4 },
  { name: 'Maryland',             label: 'MARYLAND',      col: 8,    row: 4 },
  { name: 'Delaware',             label: 'DELAWARE',      col: 9,    row: 4 },
  { name: 'California',           label: 'CALIFORNIA',    col: 1.5,  row: 5 },
  { name: 'Arizona',              label: 'ARIZONA',       col: 2.5,  row: 5 },
  { name: 'Utah',                 label: 'UTAH',          col: 3.5,  row: 5 },
  { name: 'Kansas',               label: 'KANSAS',        col: 4.5,  row: 5 },
  { name: 'Arkansas',             label: 'ARKANSAS',      col: 5.5,  row: 5 },
  { name: 'Tennessee',            label: 'TENNESSEE',     col: 6.5,  row: 5 },
  { name: 'Virginia',             label: 'VIRGINIA',      col: 7.5,  row: 5 },
  { name: 'North Carolina',       label: 'N. CAROLINA',   col: 8.5,  row: 5 },
  { name: 'District of Columbia', label: 'D.C.',          col: 10.5, row: 5 },
  { name: 'New Mexico',           label: 'NEW MEXICO',    col: 3,    row: 6 },
  { name: 'Oklahoma',             label: 'OKLAHOMA',      col: 4,    row: 6 },
  { name: 'Louisiana',            label: 'LOUISIANA',     col: 5,    row: 6 },
  { name: 'Mississippi',          label: 'MISSISSIPPI',   col: 6,    row: 6 },
  { name: 'Alabama',              label: 'ALABAMA',       col: 7,    row: 6 },
  { name: 'South Carolina',       label: 'S. CAROLINA',   col: 8,    row: 6 },
  { name: 'Texas',                label: 'TEXAS',         col: 3.5,  row: 7 },
  { name: 'Georgia',              label: 'GEORGIA',       col: 7.5,  row: 7 },
  { name: 'Hawaii',               label: 'HAWAII',        col: 0,    row: 7 },
  { name: 'Florida',              label: 'FLORIDA',       col: 8,    row: 8 },
]

// ── Real Google Trends data ────────────────────────────────────────────────────
// Source: trends.google.com interest_by_region, US, Jan–Jun 2026, downloaded 15 Jun 2026.
// Values are each player's share (%) of searches among the top 5 in that state.
const STATE_DATA = {
  'Wyoming':              { 'Cristiano Ronaldo': 37, 'Lionel Messi': 28, 'Kylian Mbappé': 18, 'Lamine Yamal': 12, 'Harry Kane':  5 },
  'California':           { 'Cristiano Ronaldo': 42, 'Lionel Messi': 32, 'Lamine Yamal':  12, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'Texas':                { 'Cristiano Ronaldo': 41, 'Lionel Messi': 34, 'Lamine Yamal':  12, 'Kylian Mbappé': 12, 'Harry Kane': 1 },
  'New Jersey':           { 'Cristiano Ronaldo': 40, 'Lionel Messi': 31, 'Kylian Mbappé': 14, 'Lamine Yamal':  13, 'Harry Kane': 2 },
  'Kansas':               { 'Cristiano Ronaldo': 39, 'Lionel Messi': 35, 'Kylian Mbappé': 13, 'Lamine Yamal':  11, 'Harry Kane': 2 },
  'New York':             { 'Cristiano Ronaldo': 37, 'Lionel Messi': 35, 'Kylian Mbappé': 14, 'Lamine Yamal':  12, 'Harry Kane': 2 },
  'Virginia':             { 'Cristiano Ronaldo': 38, 'Lionel Messi': 33, 'Kylian Mbappé': 14, 'Lamine Yamal':  13, 'Harry Kane': 2 },
  'Florida':              { 'Lionel Messi': 37, 'Cristiano Ronaldo': 36, 'Kylian Mbappé': 13, 'Lamine Yamal':  12, 'Harry Kane': 2 },
  'Illinois':             { 'Cristiano Ronaldo': 41, 'Lionel Messi': 32, 'Kylian Mbappé': 13, 'Lamine Yamal':  12, 'Harry Kane': 2 },
  'Maryland':             { 'Lionel Messi': 37, 'Cristiano Ronaldo': 36, 'Kylian Mbappé': 13, 'Lamine Yamal':  12, 'Harry Kane': 2 },
  'Georgia':              { 'Cristiano Ronaldo': 42, 'Lionel Messi': 31, 'Kylian Mbappé': 13, 'Lamine Yamal':  12, 'Harry Kane': 2 },
  'Connecticut':          { 'Cristiano Ronaldo': 41, 'Lionel Messi': 31, 'Lamine Yamal':  13, 'Kylian Mbappé': 13, 'Harry Kane': 2 },
  'Rhode Island':         { 'Cristiano Ronaldo': 40, 'Lionel Messi': 31, 'Kylian Mbappé': 14, 'Lamine Yamal':  13, 'Harry Kane': 2 },
  'Massachusetts':        { 'Cristiano Ronaldo': 40, 'Lionel Messi': 30, 'Kylian Mbappé': 15, 'Lamine Yamal':  12, 'Harry Kane': 3 },
  'Nevada':               { 'Cristiano Ronaldo': 41, 'Lionel Messi': 32, 'Lamine Yamal':  13, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'Washington':           { 'Cristiano Ronaldo': 41, 'Lionel Messi': 34, 'Kylian Mbappé': 12, 'Lamine Yamal':  11, 'Harry Kane': 2 },
  'North Carolina':       { 'Cristiano Ronaldo': 39, 'Lionel Messi': 34, 'Lamine Yamal':  13, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'Arizona':              { 'Cristiano Ronaldo': 42, 'Lionel Messi': 32, 'Lamine Yamal':  12, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'Utah':                 { 'Lionel Messi': 44, 'Cristiano Ronaldo': 33, 'Kylian Mbappé': 11, 'Lamine Yamal':  10, 'Harry Kane': 2 },
  'District of Columbia': { 'Cristiano Ronaldo': 34, 'Lionel Messi': 33, 'Kylian Mbappé': 16, 'Lamine Yamal':  13, 'Harry Kane': 4 },
  'Delaware':             { 'Cristiano Ronaldo': 37, 'Lionel Messi': 36, 'Kylian Mbappé': 14, 'Lamine Yamal':  11, 'Harry Kane': 2 },
  'Louisiana':            { 'Cristiano Ronaldo': 40, 'Lionel Messi': 30, 'Kylian Mbappé': 15, 'Lamine Yamal':  13, 'Harry Kane': 2 },
  'Pennsylvania':         { 'Cristiano Ronaldo': 40, 'Lionel Messi': 35, 'Kylian Mbappé': 12, 'Lamine Yamal':  11, 'Harry Kane': 2 },
  'Missouri':             { 'Cristiano Ronaldo': 42, 'Lionel Messi': 34, 'Lamine Yamal':  11, 'Kylian Mbappé': 11, 'Harry Kane': 2 },
  'Colorado':             { 'Lionel Messi': 42, 'Cristiano Ronaldo': 36, 'Lamine Yamal':  10, 'Kylian Mbappé': 10, 'Harry Kane': 2 },
  'Nebraska':             { 'Cristiano Ronaldo': 39, 'Lionel Messi': 34, 'Lamine Yamal':  13, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'New Mexico':           { 'Cristiano Ronaldo': 41, 'Lionel Messi': 35, 'Lamine Yamal':  11, 'Kylian Mbappé': 11, 'Harry Kane': 2 },
  'South Carolina':       { 'Cristiano Ronaldo': 42, 'Lionel Messi': 32, 'Lamine Yamal':  12, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'Indiana':              { 'Cristiano Ronaldo': 40, 'Lionel Messi': 34, 'Lamine Yamal':  12, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'Minnesota':            { 'Cristiano Ronaldo': 40, 'Lionel Messi': 30, 'Lamine Yamal':  14, 'Kylian Mbappé': 14, 'Harry Kane': 2 },
  'Michigan':             { 'Cristiano Ronaldo': 41, 'Lionel Messi': 33, 'Kylian Mbappé': 12, 'Lamine Yamal':  11, 'Harry Kane': 3 },
  'Tennessee':            { 'Cristiano Ronaldo': 40, 'Lionel Messi': 33, 'Lamine Yamal':  13, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'Oregon':               { 'Cristiano Ronaldo': 40, 'Lionel Messi': 33, 'Lamine Yamal':  13, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'Ohio':                 { 'Cristiano Ronaldo': 42, 'Lionel Messi': 34, 'Lamine Yamal':  11, 'Kylian Mbappé': 11, 'Harry Kane': 2 },
  'Arkansas':             { 'Cristiano Ronaldo': 40, 'Lionel Messi': 33, 'Lamine Yamal':  13, 'Kylian Mbappé': 13, 'Harry Kane': 1 },
  'Iowa':                 { 'Cristiano Ronaldo': 39, 'Lionel Messi': 35, 'Lamine Yamal':  12, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'Idaho':                { 'Cristiano Ronaldo': 42, 'Lionel Messi': 35, 'Kylian Mbappé': 11, 'Lamine Yamal':  10, 'Harry Kane': 2 },
  'Oklahoma':             { 'Cristiano Ronaldo': 41, 'Lionel Messi': 33, 'Lamine Yamal':  12, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'Alabama':              { 'Lionel Messi': 42, 'Cristiano Ronaldo': 36, 'Kylian Mbappé': 11, 'Lamine Yamal':  10, 'Harry Kane': 1 },
  'Mississippi':          { 'Cristiano Ronaldo': 43, 'Lionel Messi': 33, 'Lamine Yamal':  11, 'Kylian Mbappé': 11, 'Harry Kane': 2 },
  'Kentucky':             { 'Cristiano Ronaldo': 39, 'Lionel Messi': 34, 'Lamine Yamal':  13, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'North Dakota':         { 'Cristiano Ronaldo': 45, 'Lionel Messi': 33, 'Lamine Yamal':  12, 'Kylian Mbappé': 10, 'Harry Kane': 0 },
  'Hawaii':               { 'Cristiano Ronaldo': 40, 'Lionel Messi': 35, 'Lamine Yamal':  12, 'Kylian Mbappé': 11, 'Harry Kane': 2 },
  'New Hampshire':        { 'Cristiano Ronaldo': 38, 'Lionel Messi': 34, 'Kylian Mbappé': 13, 'Lamine Yamal':  12, 'Harry Kane': 3 },
  'Wisconsin':            { 'Cristiano Ronaldo': 40, 'Lionel Messi': 33, 'Lamine Yamal':  13, 'Kylian Mbappé': 12, 'Harry Kane': 2 },
  'South Dakota':         { 'Cristiano Ronaldo': 41, 'Lionel Messi': 33, 'Lamine Yamal':  14, 'Kylian Mbappé': 10, 'Harry Kane': 2 },
  'Maine':                { 'Cristiano Ronaldo': 38, 'Lionel Messi': 34, 'Kylian Mbappé': 14, 'Lamine Yamal':  12, 'Harry Kane': 2 },
  'Vermont':              { 'Lionel Messi': 38, 'Cristiano Ronaldo': 37, 'Kylian Mbappé': 13, 'Lamine Yamal':  12, 'Harry Kane': 0 },
  'Alaska':               { 'Cristiano Ronaldo': 41, 'Lionel Messi': 36, 'Kylian Mbappé': 11, 'Lamine Yamal':   9, 'Harry Kane': 3 },
  'West Virginia':        { 'Cristiano Ronaldo': 40, 'Lionel Messi': 35, 'Kylian Mbappé': 12, 'Lamine Yamal':  11, 'Harry Kane': 2 },
  'Montana':              { 'Cristiano Ronaldo': 41, 'Lionel Messi': 39, 'Lamine Yamal':  11, 'Kylian Mbappé':  9, 'Harry Kane': 0 },
}

// Players 6–15 ordered by global Wikipedia interest (no state-level data for these)
const TAIL = [
  'Neymar Jr.', 'Erling Haaland', 'Mohamed Salah', 'Vinicius Jr.',
  'Bukayo Saka', 'Jude Bellingham', 'Raphinha', 'Phil Foden',
  'Trent Alexander-Arnold', 'Florian Wirtz',
]

// Derive ranked arrays and fill any missing states
const STATE_RANKINGS = {}
for (const s of STATES) {
  const data = STATE_DATA[s.name]
  if (data) {
    const top5 = Object.entries(data).sort((a, b) => b[1] - a[1]).map(([n]) => n)
    STATE_RANKINGS[s.name] = [...top5, ...TAIL]
  } else {
    STATE_RANKINGS[s.name] = ['Cristiano Ronaldo', 'Lionel Messi', 'Kylian Mbappé', 'Lamine Yamal', 'Harry Kane', ...TAIL]
  }
}

// ── Layout constants ──────────────────────────────────────────────────────────
// Row spacing is tighter than column spacing (like the reference US tile-grid map),
// which keeps the 9-row grid short enough to fit a laptop screen without scrolling.
const CELL_X  = 110
const CELL_Y  = 96
const PAD_X   = 55
const PAD_TOP = 30    // top margin above grid (title/subtitle now rendered as HTML above the SVG)
const PAD_BOT = 60    // bottom margin below grid
const R_PHOTO = 38    // inner photo/ring radius
const R_OUTER = 55    // hex circumradius — 2*R_OUTER=CELL_X, R_OUTER*√3≈CELL_Y → tiles pack perfectly
const W = 12 * CELL_X + PAD_X * 2
const H = PAD_TOP + 9 * CELL_Y + PAD_BOT

// Flat-top regular hexagon — horizontal flat edges at top/bottom, pointed left/right.
// With R_OUTER=55: width=2*55=CELL_X=110, height=√3*55≈95.3≈CELL_Y=96 → tiles pack tight.
const hexPoints = (cx, cy, r) =>
  [0, 1, 2, 3, 4, 5]
    .map(i => `${cx + r * Math.cos(i * Math.PI / 3)},${cy + r * Math.sin(i * Math.PI / 3)}`)
    .join(' ')

// ── Hover panel (rankings + top player card) ─────────────────────────────────
function StatePanel({ stateName, screenX, screenY }) {
  const rankings   = STATE_RANKINGS[stateName] ?? []
  const stateData  = STATE_DATA[stateName] ?? {}
  const topPlayer  = playerByName[rankings[0]]
  const accentColor = topPlayer ? ink(topPlayer.country) : '#4a3828'

  const isMobile = window.innerWidth < 640
  const width    = isMobile ? 168 : 292
  const toLeft   = screenX > window.innerWidth * 0.55
  const left     = toLeft ? screenX - width - 24 : screenX + 24
  const top      = Math.max(10, Math.min(screenY - 80, window.innerHeight - (isMobile ? 280 : 460)))

  return (
    <div style={{
      position: 'fixed', left, top, zIndex: 1000,
      width,
      background: '#fdfaf4',
      borderRadius: 6,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      {/* State name header */}
      <div style={{
        padding: isMobile ? '6px 9px 6px' : '11px 16px 10px',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        fontSize: isMobile ? 7.5 : 10.5, fontWeight: 700, letterSpacing: '0.15em',
        color: '#5a4220', textTransform: 'uppercase',
        animation: 'stateSlink 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}>
        {stateName}
      </div>

      {/* Top-5 rankings */}
      <div style={{ padding: isMobile ? '4px 0 5px' : '8px 0 10px' }}>
        {rankings.slice(0, 5).map((pName, i) => {
          const p     = playerByName[pName]
          if (!p) return null
          const color = ink(p.country)
          const pct   = stateData[pName]
          return (
            <div key={pName} style={{ display: 'flex', alignItems: 'center', padding: isMobile ? '3px 9px' : '5px 16px' }}>
              <span style={{ width: 13, fontSize: isMobile ? 7.5 : 11, fontWeight: 600, color: '#9a8870', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, marginRight: 6 }} />
              <span style={{ fontSize: isMobile ? 8.5 : 13, color: '#14100b', fontWeight: i === 0 ? 600 : 400 }}>{pName}</span>
              <span style={{ marginLeft: 'auto', fontSize: isMobile ? 7 : 10, color: pct != null ? color : '#ccc', fontWeight: 500 }}>
                {pct != null ? `${pct}%` : '—'}
              </span>
            </div>
          )
        })}
      </div>
      <div style={{ padding: isMobile ? '4px 9px 5px' : '6px 16px 9px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: isMobile ? 6.5 : 9, color: '#b0a090', fontStyle: 'italic' }}>
        % = Google Trends interest share (Jan–Jun 2026)
      </div>

      {/* Player card for #1 */}
      {topPlayer && (
        <>
          <div style={{ height: 3, background: accentColor }} />

          <div style={{ padding: isMobile ? '6px 9px 5px' : '10px 15px 8px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: isMobile ? 6.5 : 9.5, color: accentColor, fontWeight: 700, letterSpacing: '0.13em',
              textTransform: 'uppercase', marginBottom: 4 }}>
              {topPlayer.country}
              {isSidelined(topPlayer.name) && (
                <span style={{ marginLeft: 8, background: '#8b1a1a', color: '#fff',
                  padding: '1px 6px', borderRadius: 2, fontSize: isMobile ? 7 : 8.5, letterSpacing: '0.1em' }}>
                  {sidelineLabel(topPlayer.name)}
                </span>
              )}
            </div>
            <div style={{ fontSize: isMobile ? 10.5 : 17, fontWeight: 700, color: '#14100b', lineHeight: 1.1 }}>
              {topPlayer.name}
            </div>
            <div style={{ fontSize: isMobile ? 7.5 : 11, color: '#7a6e60', marginTop: 3 }}>
              {topPlayer.position}&ensp;·&ensp;{topPlayer.club}
            </div>
          </div>

          <div style={{ padding: isMobile ? '6px 9px 8px' : '11px 15px 13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: isMobile ? '4px 6px' : '8px 12px', marginBottom: isMobile ? 6 : 10 }}>
              {[
                { label: 'Age at WC',  value: topPlayer.age      },
                { label: 'Caps',       value: topPlayer.caps      },
                { label: 'Int. Goals', value: topPlayer.intGoals  },
              ].map(({ label: l, value }) => (
                <div key={l}>
                  <div style={{ fontSize: isMobile ? 6.5 : 9, color: '#9a8870', textTransform: 'uppercase',
                    letterSpacing: '0.09em', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: isMobile ? 9.5 : 15, fontWeight: 600, color: '#14100b' }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: isMobile ? 5 : 9, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: isMobile ? 6.5 : 9, color: '#9a8870', textTransform: 'uppercase',
                letterSpacing: '0.09em', marginBottom: 2 }}>Google Search Share</div>
              <div style={{ fontSize: isMobile ? 9.5 : 15, fontWeight: 600, color: accentColor }}>
                {stateData[topPlayer.name] != null ? `${stateData[topPlayer.name]}%` : '—'}
              </div>
              <div style={{ fontSize: isMobile ? 8.5 : 10, color: '#9a8870', marginTop: 2 }}>
                In {stateName}, Jan–Jun 2026
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StateViz() {
  const [hovered, setHovered] = useState(null)
  const [tooltipPos, setPos]  = useState({ x: 0, y: 0 })

  return (
    <>
    <style>{`
      @keyframes stateSlink {
        0%   { opacity: 0; transform: translateY(-6px); letter-spacing: 0.55em; }
        60%  { letter-spacing: 0.12em; }
        100% { opacity: 1; transform: translateY(0);    letter-spacing: 0.15em; }
      }
      @keyframes panelSlide {
        from { opacity: 0; transform: translateY(10px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0)    scale(1); }
      }
      @keyframes stampRipple {
        from { transform: scale(1);    opacity: 0.55; }
        to   { transform: scale(1.42); opacity: 0;    }
      }
      .stamp-ripple {
        transform-box: fill-box;
        transform-origin: center center;
        animation: stampRipple 0.52s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        pointer-events: none;
      }
    `}</style>
    <div style={{
      width: '100%',
      // Fill available width — the grid is tall enough that capping by viewport
      // height shrinks the hexagons significantly; width-first fills the screen better.
      maxWidth: W,
      margin: '0 auto', position: 'relative',
    }} onClick={() => setHovered(null)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-label="Most searched footballer by US state — Google Trends Jan–Jun 2026"
      >
        {/* ── Background ── */}
        <rect width={W} height={H} fill="#ede8df" />
        <rect x={12} y={12} width={W - 24} height={H - 24} rx={5}
          fill="none" stroke="rgba(130,100,55,0.15)" strokeWidth="1" />

        {/* ── Title — fontSize 64/18 matches the .chart-title/.chart-subtitle size used on the other charts ── */}
        <text x={W / 2} y={142} textAnchor="middle"
          fill="#2d2410" fontSize={94} fontWeight="700"
          fontFamily="'Raleway', system-ui, sans-serif">
          Ronaldo Rules
        </text>
        <text x={W / 2} y={190} textAnchor="middle"
          fill="#8a7860" fontSize={26} fontWeight="400"
          fontFamily="'Raleway', system-ui, sans-serif">
          He leads search interest in 45 states and Washington, D.C.
        </text>

        {/* ── State cells ── */}
        {STATES.map(state => {
          const cx      = PAD_X + state.col * CELL_X + CELL_X / 2
          const cy      = PAD_TOP + state.row * CELL_Y + CELL_Y / 2
          const topName = (STATE_RANKINGS[state.name] ?? [])[0]
          const player  = playerByName[topName]
          const color   = player ? ink(player.country) : '#aaa'
          const isHov   = hovered === state.name
          const clipId   = `sc-${state.name.replace(/[\s.]/g, '-')}`
          // y of the flat top edge of the hexagon
          const topEdgeY = cy - R_OUTER * Math.sqrt(3) / 2
          const fsz      = state.label.length > 12 ? 7.5 : state.label.length > 9 ? 8.5 : 10

          return (
            <g key={state.name}
              style={{
                cursor: 'pointer',
                transform: isHov ? 'scale(1.07)' : 'scale(1)',
                transformBox: 'fill-box',
                transformOrigin: 'center center',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.45, 0.64, 1)',
              }}
              onMouseEnter={e => { setHovered(state.name); setPos({ x: e.clientX, y: e.clientY }) }}
              onMouseLeave={() => setHovered(null)}
              onClick={e => {
                e.stopPropagation()
                if (hovered === state.name) {
                  setHovered(null)
                } else {
                  setHovered(state.name)
                  setPos({ x: e.clientX, y: e.clientY })
                }
              }}
            >
              <defs>
                {/* Hex clip for the player photo */}
                <clipPath id={clipId}>
                  <polygon points={hexPoints(cx, cy, R_PHOTO)} />
                </clipPath>
              </defs>

              {/* Ripple hex — mounts on hover and animates outward once */}
              {isHov && (
                <polygon className="stamp-ripple"
                  points={hexPoints(cx, cy, R_OUTER)}
                  fill="none" stroke={color} strokeWidth="2"
                />
              )}

              {/* Outer hexagon background */}
              <polygon points={hexPoints(cx, cy, R_OUTER)}
                fill="#ddd8ce"
                stroke={isHov ? color : 'rgba(185,165,130,0.45)'}
                strokeWidth={isHov ? 2.2 : 1.4}
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s',
                         filter: isHov ? `drop-shadow(0 3px 12px ${color}55)` : 'none' }}
              />

              {/* Player photo clipped to hex */}
              {player && (
                <image
                  href={assetUrl(player.photo)}
                  x={cx - R_PHOTO} y={cy - R_PHOTO - R_PHOTO * 0.12}
                  width={R_PHOTO * 2} height={R_PHOTO * 2 * 1.25}
                  clipPath={`url(#${clipId})`}
                  preserveAspectRatio="xMidYMin slice"
                  style={{
                    opacity: isHov ? 1 : 0.88,
                    filter: isHov ? 'saturate(1.25) brightness(1.04)' : 'saturate(1) brightness(1)',
                    transition: 'opacity 0.2s, filter 0.25s',
                  }}
                />
              )}

              {/* Country colour hex ring (inner) */}
              <polygon points={hexPoints(cx, cy, R_PHOTO)}
                fill="none" stroke={color}
                strokeWidth={isHov ? 3 : 2.2}
                style={{ transition: 'stroke-width 0.2s' }}
              />

              {/* State name on the flat top edge of the hexagon */}
              <g style={{
                opacity:    isHov ? 0 : 1,
                transform:  isHov ? 'translateY(6px)' : 'translateY(0px)',
                transition: 'opacity 0.2s ease-out, transform 0.22s ease-out',
              }}>
                <text
                  x={cx} y={topEdgeY + fsz + 1}
                  textAnchor="middle"
                  fill={isHov ? color : '#6a5638'}
                  fontSize={fsz}
                  fontFamily="'Raleway', 'Arial Narrow', sans-serif"
                  fontWeight="700"
                  letterSpacing="0.5"
                >
                  {state.label}
                </text>
              </g>
            </g>
          )
        })}

      </svg>

      {/* ── Hover panel ── */}
      {hovered && (
        <StatePanel
          key={hovered}
          stateName={hovered}
          screenX={tooltipPos.x}
          screenY={tooltipPos.y}
        />
      )}


    </div>
    </>
  )
}
