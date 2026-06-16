// 2026 FIFA World Cup — venues, schedule, and bracket-path data
// Sources: FIFA / Wikipedia (official venue announcements, December 2025 draw,
// published group-stage schedule, and the 32-match knockout bracket structure).
// Group-stage results reflect only matches completed as of the data pull date;
// later matchdays and all knockout pairings are fixtures, not results.

export const VENUES = {
  AZT:  { name: 'Estadio Azteca',          city: 'Mexico City',           country: 'Mexico',  lat: 19.3029,  lon: -99.1505,  capacity: 80824 },
  AKR:  { name: 'Estadio Akron',           city: 'Guadalajara',           country: 'Mexico',  lat: 20.6797,  lon: -103.4621, capacity: 45664 },
  BBV:  { name: 'Estadio BBVA',            city: 'Monterrey',             country: 'Mexico',  lat: 25.6694,  lon: -100.2458, capacity: 51243 },
  MBS:  { name: 'Mercedes-Benz Stadium',   city: 'Atlanta',               country: 'USA',     lat: 33.7553,  lon: -84.4006,  capacity: 68239 },
  SOFI: { name: 'SoFi Stadium',            city: 'Los Angeles',           country: 'USA',     lat: 33.9535,  lon: -118.3392, capacity: 70492 },
  BCP:  { name: 'BC Place',                city: 'Vancouver',             country: 'Canada',  lat: 49.2768,  lon: -123.1119, capacity: 52497 },
  LUM:  { name: 'Lumen Field',             city: 'Seattle',               country: 'USA',     lat: 47.5952,  lon: -122.3316, capacity: 66925 },
  BMO:  { name: 'BMO Field',               city: 'Toronto',               country: 'Canada',  lat: 43.6332,  lon: -79.4186,  capacity: 43036 },
  LEVI: { name: "Levi's Stadium",          city: 'San Francisco Bay Area', country: 'USA',     lat: 37.4030,  lon: -121.9700, capacity: 68827 },
  GIL:  { name: 'Gillette Stadium',        city: 'Boston',                country: 'USA',     lat: 42.0909,  lon: -71.2643,  capacity: 64146 },
  MET:  { name: 'MetLife Stadium',         city: 'New York/New Jersey',   country: 'USA',     lat: 40.8128,  lon: -74.0742,  capacity: 80663 },
  LIN:  { name: 'Lincoln Financial Field', city: 'Philadelphia',          country: 'USA',     lat: 39.9008,  lon: -75.1675,  capacity: 68324 },
  HR:   { name: 'Hard Rock Stadium',       city: 'Miami',                 country: 'USA',     lat: 25.9580,  lon: -80.2389,  capacity: 64478 },
  NRG:  { name: 'NRG Stadium',             city: 'Houston',               country: 'USA',     lat: 29.6847,  lon: -95.4107,  capacity: 68777 },
  ARR:  { name: 'Arrowhead Stadium',       city: 'Kansas City',           country: 'USA',     lat: 39.0489,  lon: -94.4839,  capacity: 69045 },
  ATT:  { name: 'AT&T Stadium',            city: 'Dallas',                country: 'USA',     lat: 32.7473,  lon: -97.0945,  capacity: 70649 },
}

// Great-circle distance between two venues, in kilometres / miles
export function haversineKm(a, b) {
  const R = 6371
  const toRad = d => d * Math.PI / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
export const kmToMiles = km => km * 0.621371

// ── Groups (December 2025 draw — pots A1–L4 are draw seeding, not final standings) ──
export const GROUPS = {
  A: ['Mexico', 'South Africa', 'South Korea', 'Czech Republic'],
  B: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['United States', 'Paraguay', 'Australia', 'Turkey'],
  E: ['Germany', 'Curaçao', 'Ivory Coast', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'DR Congo', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
}

// ── Group stage: all 72 matches ──
export const GROUP_MATCHES = [
  // Group A
  { group: 'A', matchday: 1, date: '2026-06-11', home: 'Mexico',         away: 'South Africa',         venue: 'AZT'  },
  { group: 'A', matchday: 1, date: '2026-06-11', home: 'South Korea',    away: 'Czech Republic',       venue: 'AKR'  },
  { group: 'A', matchday: 2, date: '2026-06-18', home: 'Czech Republic', away: 'South Africa',         venue: 'MBS'  },
  { group: 'A', matchday: 2, date: '2026-06-18', home: 'Mexico',         away: 'South Korea',          venue: 'AKR'  },
  { group: 'A', matchday: 3, date: '2026-06-24', home: 'Czech Republic', away: 'Mexico',               venue: 'AZT'  },
  { group: 'A', matchday: 3, date: '2026-06-24', home: 'South Africa',   away: 'South Korea',          venue: 'BBV'  },
  // Group B
  { group: 'B', matchday: 1, date: '2026-06-12', home: 'Canada',         away: 'Bosnia and Herzegovina', venue: 'BMO' },
  { group: 'B', matchday: 1, date: '2026-06-13', home: 'Qatar',          away: 'Switzerland',          venue: 'LEVI' },
  { group: 'B', matchday: 2, date: '2026-06-18', home: 'Switzerland',    away: 'Bosnia and Herzegovina', venue: 'SOFI' },
  { group: 'B', matchday: 2, date: '2026-06-18', home: 'Canada',         away: 'Qatar',                venue: 'BCP'  },
  { group: 'B', matchday: 3, date: '2026-06-24', home: 'Switzerland',    away: 'Canada',               venue: 'BCP'  },
  { group: 'B', matchday: 3, date: '2026-06-24', home: 'Bosnia and Herzegovina', away: 'Qatar',         venue: 'LUM'  },
  // Group C
  { group: 'C', matchday: 1, date: '2026-06-13', home: 'Brazil',         away: 'Morocco',              venue: 'MET'  },
  { group: 'C', matchday: 1, date: '2026-06-13', home: 'Haiti',          away: 'Scotland',              venue: 'GIL'  },
  { group: 'C', matchday: 2, date: '2026-06-19', home: 'Scotland',       away: 'Morocco',               venue: 'GIL'  },
  { group: 'C', matchday: 2, date: '2026-06-19', home: 'Brazil',         away: 'Haiti',                venue: 'LIN'  },
  { group: 'C', matchday: 3, date: '2026-06-24', home: 'Scotland',       away: 'Brazil',                venue: 'HR'   },
  { group: 'C', matchday: 3, date: '2026-06-24', home: 'Morocco',        away: 'Haiti',                venue: 'MBS'  },
  // Group D
  { group: 'D', matchday: 1, date: '2026-06-12', home: 'United States',  away: 'Paraguay',             venue: 'SOFI' },
  { group: 'D', matchday: 1, date: '2026-06-13', home: 'Australia',      away: 'Turkey',               venue: 'BCP'  },
  { group: 'D', matchday: 2, date: '2026-06-19', home: 'United States',  away: 'Australia',            venue: 'LUM'  },
  { group: 'D', matchday: 2, date: '2026-06-19', home: 'Turkey',         away: 'Paraguay',             venue: 'LEVI' },
  { group: 'D', matchday: 3, date: '2026-06-25', home: 'Turkey',         away: 'United States',        venue: 'SOFI' },
  { group: 'D', matchday: 3, date: '2026-06-25', home: 'Paraguay',       away: 'Australia',             venue: 'LEVI' },
  // Group E
  { group: 'E', matchday: 1, date: '2026-06-14', home: 'Germany',        away: 'Curaçao',              venue: 'NRG'  },
  { group: 'E', matchday: 1, date: '2026-06-14', home: 'Ivory Coast',    away: 'Ecuador',               venue: 'LIN'  },
  { group: 'E', matchday: 2, date: '2026-06-20', home: 'Germany',        away: 'Ivory Coast',           venue: 'BMO'  },
  { group: 'E', matchday: 2, date: '2026-06-20', home: 'Ecuador',        away: 'Curaçao',              venue: 'ARR'  },
  { group: 'E', matchday: 3, date: '2026-06-25', home: 'Curaçao',       away: 'Ivory Coast',            venue: 'LIN'  },
  { group: 'E', matchday: 3, date: '2026-06-25', home: 'Ecuador',        away: 'Germany',               venue: 'MET'  },
  // Group F
  { group: 'F', matchday: 1, date: '2026-06-14', home: 'Netherlands',    away: 'Japan',                venue: 'ATT'  },
  { group: 'F', matchday: 1, date: '2026-06-14', home: 'Sweden',         away: 'Tunisia',               venue: 'BBV'  },
  { group: 'F', matchday: 2, date: '2026-06-20', home: 'Netherlands',    away: 'Sweden',                venue: 'NRG'  },
  { group: 'F', matchday: 2, date: '2026-06-20', home: 'Tunisia',        away: 'Japan',                venue: 'BBV'  },
  { group: 'F', matchday: 3, date: '2026-06-25', home: 'Japan',          away: 'Sweden',                venue: 'ATT'  },
  { group: 'F', matchday: 3, date: '2026-06-25', home: 'Tunisia',        away: 'Netherlands',           venue: 'ARR'  },
  // Group G
  { group: 'G', matchday: 1, date: '2026-06-15', home: 'Belgium',        away: 'Egypt',                venue: 'LUM'  },
  { group: 'G', matchday: 1, date: '2026-06-15', home: 'Iran',           away: 'New Zealand',           venue: 'SOFI' },
  { group: 'G', matchday: 2, date: '2026-06-21', home: 'Belgium',        away: 'Iran',                  venue: 'SOFI' },
  { group: 'G', matchday: 2, date: '2026-06-21', home: 'New Zealand',    away: 'Egypt',                 venue: 'BCP'  },
  { group: 'G', matchday: 3, date: '2026-06-26', home: 'Egypt',          away: 'Iran',                  venue: 'LUM'  },
  { group: 'G', matchday: 3, date: '2026-06-26', home: 'New Zealand',    away: 'Belgium',                venue: 'BCP'  },
  // Group H
  { group: 'H', matchday: 1, date: '2026-06-15', home: 'Spain',          away: 'Cape Verde',            venue: 'MBS'  },
  { group: 'H', matchday: 1, date: '2026-06-15', home: 'Saudi Arabia',   away: 'Uruguay',                venue: 'HR'   },
  { group: 'H', matchday: 2, date: '2026-06-21', home: 'Spain',          away: 'Saudi Arabia',          venue: 'MBS'  },
  { group: 'H', matchday: 2, date: '2026-06-21', home: 'Uruguay',        away: 'Cape Verde',            venue: 'HR'   },
  { group: 'H', matchday: 3, date: '2026-06-26', home: 'Cape Verde',     away: 'Saudi Arabia',           venue: 'NRG'  },
  { group: 'H', matchday: 3, date: '2026-06-26', home: 'Uruguay',        away: 'Spain',                  venue: 'AKR'  },
  // Group I
  { group: 'I', matchday: 1, date: '2026-06-16', home: 'France',        away: 'Senegal',               venue: 'MET'  },
  { group: 'I', matchday: 1, date: '2026-06-16', home: 'Iraq',           away: 'Norway',                 venue: 'GIL'  },
  { group: 'I', matchday: 2, date: '2026-06-22', home: 'France',        away: 'Iraq',                   venue: 'LIN'  },
  { group: 'I', matchday: 2, date: '2026-06-22', home: 'Norway',         away: 'Senegal',                venue: 'MET'  },
  { group: 'I', matchday: 3, date: '2026-06-26', home: 'Norway',         away: 'France',                 venue: 'GIL'  },
  { group: 'I', matchday: 3, date: '2026-06-26', home: 'Senegal',        away: 'Iraq',                   venue: 'BMO'  },
  // Group J
  { group: 'J', matchday: 1, date: '2026-06-16', home: 'Argentina',      away: 'Algeria',                venue: 'ARR'  },
  { group: 'J', matchday: 1, date: '2026-06-16', home: 'Austria',        away: 'Jordan',                 venue: 'LEVI' },
  { group: 'J', matchday: 2, date: '2026-06-22', home: 'Argentina',      away: 'Austria',                venue: 'ATT'  },
  { group: 'J', matchday: 2, date: '2026-06-22', home: 'Jordan',         away: 'Algeria',                venue: 'LEVI' },
  { group: 'J', matchday: 3, date: '2026-06-27', home: 'Algeria',        away: 'Austria',                venue: 'ARR'  },
  { group: 'J', matchday: 3, date: '2026-06-27', home: 'Jordan',         away: 'Argentina',               venue: 'ATT'  },
  // Group K
  { group: 'K', matchday: 1, date: '2026-06-17', home: 'Portugal',       away: 'DR Congo',               venue: 'NRG'  },
  { group: 'K', matchday: 1, date: '2026-06-17', home: 'Uzbekistan',     away: 'Colombia',                venue: 'AZT'  },
  { group: 'K', matchday: 2, date: '2026-06-23', home: 'Portugal',       away: 'Uzbekistan',              venue: 'NRG'  },
  { group: 'K', matchday: 2, date: '2026-06-23', home: 'Colombia',       away: 'DR Congo',                venue: 'AKR'  },
  { group: 'K', matchday: 3, date: '2026-06-27', home: 'Colombia',       away: 'Portugal',                venue: 'HR'   },
  { group: 'K', matchday: 3, date: '2026-06-27', home: 'DR Congo',       away: 'Uzbekistan',              venue: 'MBS'  },
  // Group L
  { group: 'L', matchday: 1, date: '2026-06-17', home: 'England',        away: 'Croatia',                venue: 'ATT'  },
  { group: 'L', matchday: 1, date: '2026-06-17', home: 'Ghana',          away: 'Panama',                  venue: 'BMO'  },
  { group: 'L', matchday: 2, date: '2026-06-23', home: 'England',        away: 'Ghana',                   venue: 'GIL'  },
  { group: 'L', matchday: 2, date: '2026-06-23', home: 'Panama',         away: 'Croatia',                 venue: 'BMO'  },
  { group: 'L', matchday: 3, date: '2026-06-27', home: 'Panama',         away: 'England',                 venue: 'MET'  },
  { group: 'L', matchday: 3, date: '2026-06-27', home: 'Croatia',        away: 'Ghana',                   venue: 'LIN'  },
]

// ── Knockout bracket: all 32 matches, Round of 32 → Final ──
// `slot` describes who the match is for; `feedsTo` is the next match number
// the winner advances to (omitted for the Final / 3rd-place match).
export const KNOCKOUT_MATCHES = {
  73:  { round: 'R32', date: '2026-06-28', venue: 'SOFI', slot: 'Runner-up A vs Runner-up B',                          feedsTo: 90  },
  74:  { round: 'R32', date: '2026-06-29', venue: 'GIL',  slot: 'Winner E vs 3rd-place (A/B/C/D/F)',                    feedsTo: 89  },
  75:  { round: 'R32', date: '2026-06-29', venue: 'BBV',  slot: 'Winner F vs Runner-up C',                              feedsTo: 90  },
  76:  { round: 'R32', date: '2026-06-29', venue: 'NRG',  slot: 'Winner C vs Runner-up F',                              feedsTo: 91  },
  77:  { round: 'R32', date: '2026-06-30', venue: 'MET',  slot: 'Winner I vs 3rd-place (C/D/F/G/H)',                    feedsTo: 89  },
  78:  { round: 'R32', date: '2026-06-30', venue: 'ATT',  slot: 'Runner-up E vs Runner-up I',                           feedsTo: 91  },
  79:  { round: 'R32', date: '2026-06-30', venue: 'AZT',  slot: 'Winner A vs 3rd-place (C/E/F/H/I)',                    feedsTo: 92  },
  80:  { round: 'R32', date: '2026-07-01', venue: 'MBS',  slot: 'Winner L vs 3rd-place (E/H/I/J/K)',                    feedsTo: 92  },
  81:  { round: 'R32', date: '2026-07-01', venue: 'LEVI', slot: 'Winner D vs 3rd-place (B/E/F/I/J)',                    feedsTo: 94  },
  82:  { round: 'R32', date: '2026-07-01', venue: 'LUM',  slot: 'Winner G vs 3rd-place (A/E/H/I/J)',                    feedsTo: 94  },
  83:  { round: 'R32', date: '2026-07-02', venue: 'BMO',  slot: 'Runner-up K vs Runner-up L',                           feedsTo: 93  },
  84:  { round: 'R32', date: '2026-07-02', venue: 'SOFI', slot: 'Winner H vs Runner-up J',                              feedsTo: 93  },
  85:  { round: 'R32', date: '2026-07-02', venue: 'BCP',  slot: 'Winner B vs 3rd-place (E/F/G/I/J)',                    feedsTo: 96  },
  86:  { round: 'R32', date: '2026-07-03', venue: 'HR',   slot: 'Winner J vs Runner-up H',                              feedsTo: 95  },
  87:  { round: 'R32', date: '2026-07-03', venue: 'ARR',  slot: 'Winner K vs 3rd-place (D/E/I/J/L)',                    feedsTo: 96  },
  88:  { round: 'R32', date: '2026-07-03', venue: 'ATT',  slot: 'Runner-up D vs Runner-up G',                           feedsTo: 95  },

  89:  { round: 'R16', date: '2026-07-04', venue: 'LIN',  slot: 'Winner 74 vs Winner 77',  feedsTo: 97  },
  90:  { round: 'R16', date: '2026-07-04', venue: 'NRG',  slot: 'Winner 73 vs Winner 75',  feedsTo: 97  },
  91:  { round: 'R16', date: '2026-07-05', venue: 'MET',  slot: 'Winner 76 vs Winner 78',  feedsTo: 99  },
  92:  { round: 'R16', date: '2026-07-05', venue: 'AZT',  slot: 'Winner 79 vs Winner 80',  feedsTo: 99  },
  93:  { round: 'R16', date: '2026-07-06', venue: 'ATT',  slot: 'Winner 83 vs Winner 84',  feedsTo: 98  },
  94:  { round: 'R16', date: '2026-07-06', venue: 'LUM',  slot: 'Winner 81 vs Winner 82',  feedsTo: 98  },
  95:  { round: 'R16', date: '2026-07-07', venue: 'MBS',  slot: 'Winner 86 vs Winner 88',  feedsTo: 100 },
  96:  { round: 'R16', date: '2026-07-07', venue: 'BCP',  slot: 'Winner 85 vs Winner 87',  feedsTo: 100 },

  97:  { round: 'QF', date: '2026-07-09', venue: 'GIL',  slot: 'Winner 89 vs Winner 90',   feedsTo: 101 },
  98:  { round: 'QF', date: '2026-07-10', venue: 'SOFI', slot: 'Winner 93 vs Winner 94',   feedsTo: 101 },
  99:  { round: 'QF', date: '2026-07-11', venue: 'HR',   slot: 'Winner 91 vs Winner 92',   feedsTo: 102 },
  100: { round: 'QF', date: '2026-07-11', venue: 'ARR',  slot: 'Winner 95 vs Winner 96',   feedsTo: 102 },

  101: { round: 'SF', date: '2026-07-14', venue: 'ATT', slot: 'Winner 97 vs Winner 98',    feedsTo: 104 },
  102: { round: 'SF', date: '2026-07-15', venue: 'MBS', slot: 'Winner 99 vs Winner 100',   feedsTo: 104 },

  103: { round: '3rd', date: '2026-07-18', venue: 'HR',  slot: 'Loser 101 vs Loser 102'    },
  104: { round: 'Final', date: '2026-07-19', venue: 'MET', slot: 'Winner 101 vs Winner 102' },
}

// Resolve the full venue chain (R32 → Final) starting from any R32 match number.
export function chainFrom(r32MatchNo) {
  const chain = [r32MatchNo]
  let cur = r32MatchNo
  while (KNOCKOUT_MATCHES[cur].feedsTo) {
    cur = KNOCKOUT_MATCHES[cur].feedsTo
    chain.push(cur)
  }
  return chain // e.g. [79, 92, 99, 102, 104]
}

// Each group's Winner and Runner-up enter the bracket at one fixed R32 match.
export const GROUP_ENTRY_MATCH = {
  winner:   { A: 79, B: 85, C: 76, D: 81, E: 74, F: 75, G: 82, H: 84, I: 77, J: 86, K: 87, L: 80 },
  runnerUp: { A: 73, B: 73, C: 75, D: 88, E: 78, F: 76, G: 88, H: 86, I: 78, J: 84, K: 83, L: 83 },
}

// A group's 3rd-placed team has no single fixed entry match — FIFA's predetermined
// table slots it into one of several possible R32 matches depending on which other
// groups also produce a qualifying 3rd-placed team (no lots; ranked by points, GD,
// goals scored, then FIFA World Ranking). These are all the matches it COULD reach.
export const THIRD_PLACE_POSSIBLE_MATCHES = {
  A: [74, 82],
  B: [74, 81],
  C: [74, 77, 79],
  D: [74, 77, 87],
  E: [79, 80, 81, 82, 85, 87],
  F: [74, 77, 79, 81, 85],
  G: [77, 82, 85],
  H: [77, 79, 80, 82],
  I: [79, 80, 81, 82, 85, 87],
  J: [80, 81, 82, 85, 87],
  K: [80, 87],
  L: [87],
}

// Convenience: full venue-chain (R32→R16→QF→SF→Final) per group, for Winner & Runner-up.
export const GROUP_PATHS = Object.fromEntries(
  Object.keys(GROUPS).map(g => [g, {
    winner: chainFrom(GROUP_ENTRY_MATCH.winner[g]),
    runnerUp: chainFrom(GROUP_ENTRY_MATCH.runnerUp[g]),
    thirdPlaceOptions: THIRD_PLACE_POSSIBLE_MATCHES[g].map(chainFrom),
  }])
)

// Distinct rounds played at each venue (group stage + any knockout rounds it hosts).
export const VENUE_ROUNDS = Object.fromEntries(
  Object.keys(VENUES).map(id => [id, new Set()])
)
GROUP_MATCHES.forEach(m => VENUE_ROUNDS[m.venue].add('GS'))
Object.values(KNOCKOUT_MATCHES).forEach(m => VENUE_ROUNDS[m.venue].add(m.round))
