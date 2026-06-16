# WC · 2026 — A Data Portrait of the World Cup

A scrollytelling site exploring the data behind the 2026 FIFA World Cup — built with React and D3, ahead of the tournament kicking off in the United States, Canada, and Mexico.

**Live site:** https://andypetes94.github.io/world-cup-visualisation/

Five chapters, each pairing a short narrative with a custom interactive chart:

| | Chapter | Visualization |
|---|---|---|
| **Part I** | The Players the World Can't Stop Searching | `PassportViz` — Wikipedia attention on the world's most-tracked players |
| **Part II** | Soccer Mania Sweeps the United States | `StateViz` — state-by-state Google search interest across the host nation |
| **Part III** | The Price of the Beautiful Game | `TicketViz` — ticket marketplace pricing across matches and rounds |
| **Part IV** | The Changing Face of the World Cup | `ConfederationViz` — confederation representation as the tournament has expanded |
| **Part V** | The Road to the Final | `AirMilesViz` — every group's possible knockout routes, plotted on a real North America basemap |

## Stack

- [React 19](https://react.dev) + [Vite](https://vite.dev) for the app shell and dev/build tooling
- [D3](https://d3js.org) (`d3`, `d3-geo`) for scales, projections, and geographic paths
- [TopoJSON](https://github.com/topojson/topojson-client) + [world-atlas](https://github.com/topojson/world-atlas) for country geometry in `AirMilesViz`

All chart data lives alongside the components that render it (e.g. `WorldCupTravelData.js` for the Road to the Final chapter) so each visualization is self-contained.

## Getting started

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build    # production build
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```
