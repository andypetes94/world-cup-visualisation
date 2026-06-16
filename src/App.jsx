import { useState } from 'react'
import './App.css'
import PassportViz from './PassportViz'
import StateViz from './StateViz'
import TicketViz from './TicketViz'
import ConfederationViz from './ConfederationViz'
import AirMilesViz from './AirMilesViz'

/* Decorative SVG — concentric pitch rings */
function PitchRings() {
  return (
    <div className="hero-rings" aria-hidden="true">
      <svg viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="400" cy="400" r="380" stroke="#2e2820" strokeWidth="1" />
        <circle cx="400" cy="400" r="300" stroke="#2e2820" strokeWidth="1" />
        <circle cx="400" cy="400" r="200" stroke="#2e2820" strokeWidth="1.5" />
        <circle cx="400" cy="400" r="100" stroke="#2a5c3f" strokeWidth="1.5" />
        <circle cx="400" cy="400" r="40"  stroke="#2a5c3f" strokeWidth="2" />
        <circle cx="400" cy="400" r="5"   fill="#2a5c3f" />
        {/* Crosshairs */}
        <line x1="400" y1="20"  x2="400" y2="780" stroke="#2e2820" strokeWidth="0.5" />
        <line x1="20"  y1="400" x2="780" y2="400" stroke="#2e2820" strokeWidth="0.5" />
        {/* Corner arcs */}
        <path d="M 20 20 A 50 50 0 0 1 70 70"    stroke="#2e2820" strokeWidth="0.75" fill="none" />
        <path d="M 780 20 A 50 50 0 0 0 730 70"   stroke="#2e2820" strokeWidth="0.75" fill="none" />
        <path d="M 20 780 A 50 50 0 0 0 70 730"   stroke="#2e2820" strokeWidth="0.75" fill="none" />
        <path d="M 780 780 A 50 50 0 0 1 730 730"  stroke="#2e2820" strokeWidth="0.75" fill="none" />
      </svg>
    </div>
  )
}

/* Decorative corner motifs — line-art football iconography framing the hero */
function HeroMotifs() {
  return (
    <div className="hero-motifs" aria-hidden="true">
      {/* Corner flag — top left */}
      <svg className="hero-motif hero-motif--tl" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="30" y1="140" x2="30" y2="20" stroke="#2e2820" strokeWidth="1.5" />
        <path d="M 30 20 L 100 38 L 30 56 Z" stroke="#2e2820" strokeWidth="1.2" fill="none" />
        <circle cx="30" cy="146" r="6" stroke="#2e2820" strokeWidth="1" />
        <path d="M 6 146 A 24 24 0 0 1 54 146" stroke="#2e2820" strokeWidth="0.75" />
      </svg>

      {/* Football — top right */}
      <svg className="hero-motif hero-motif--tr" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="80" r="54" stroke="#2e2820" strokeWidth="1.2" />
        <path d="M80 35 L101 51 L93 79 L67 79 L59 51 Z" stroke="#2e2820" strokeWidth="1" />
        <path d="M80 35 L80 22 M101 51 L124 45 M93 79 L110 99 M67 79 L50 99 M59 51 L36 45"
          stroke="#2e2820" strokeWidth="0.75" />
      </svg>

      {/* Goalposts — bottom left */}
      <svg className="hero-motif hero-motif--bl" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 140 L20 28 L130 28 L130 140" stroke="#2e2820" strokeWidth="1.5" />
        {[44, 68, 92, 116].map(x => (
          <line key={x} x1={x} y1="28" x2={x - 10} y2="140" stroke="#2e2820" strokeWidth="0.5" />
        ))}
        {[56, 84, 112].map(y => (
          <line key={y} x1="20" y1={y} x2="130" y2={y} stroke="#2e2820" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Trophy — bottom right */}
      <svg className="hero-motif hero-motif--br" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M55 30 H105 V54 C105 80 92 92 80 92 C68 92 55 80 55 54 Z" stroke="#2e2820" strokeWidth="1.2" />
        <path d="M55 36 C38 36 33 54 52 60" stroke="#2e2820" strokeWidth="1" />
        <path d="M105 36 C122 36 127 54 108 60" stroke="#2e2820" strokeWidth="1" />
        <rect x="72" y="92" width="16" height="14" stroke="#2e2820" strokeWidth="1" />
        <path d="M58 118 H102" stroke="#2e2820" strokeWidth="1.5" />
        <path d="M64 118 L72 106 M96 118 L88 106" stroke="#2e2820" strokeWidth="0.75" />
      </svg>
    </div>
  )
}

const SITE_URL   = 'https://andypetes94.github.io/world-cup-visualisation/'
const SHARE_TEXT = 'Before the Whistle — a data portrait of the 2026 World Cup'

const SHARE_LINKS = [
  { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}` },
  { label: 'Bluesky',  href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${SHARE_TEXT} ${SITE_URL}`)}` },
  { label: 'X',        href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}` },
  { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}` },
]

function SectionDivider() {
  return (
    <div className="divider container" aria-hidden="true">
      <span className="divider__icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22"  stroke="currentColor" strokeWidth="0.75" />
          <circle cx="24" cy="24" r="15"  stroke="currentColor" strokeWidth="0.75" />
          <circle cx="24" cy="24" r="8.5" stroke="currentColor" strokeWidth="1"    />
          <circle cx="24" cy="24" r="3"   stroke="currentColor" strokeWidth="1.25" />
          <circle cx="24" cy="24" r="1"   fill="currentColor" />
          <line x1="24" y1="2"  x2="24" y2="46" stroke="currentColor" strokeWidth="0.35" />
          <line x1="2"  y1="24" x2="46" y2="24" stroke="currentColor" strokeWidth="0.35" />
          <path d="M 2 2 A 5 5 0 0 1 7 7"     stroke="currentColor" strokeWidth="0.5" />
          <path d="M 46 2 A 5 5 0 0 0 41 7"   stroke="currentColor" strokeWidth="0.5" />
          <path d="M 2 46 A 5 5 0 0 0 7 41"   stroke="currentColor" strokeWidth="0.5" />
          <path d="M 46 46 A 5 5 0 0 1 41 41" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </span>
    </div>
  )
}


export default function App() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <>
      {/* ── Navigation ── */}
      <nav className="site-nav">
        <span className="nav-brand">World Cup 2026</span>
        <button
          className={`nav-burger${navOpen ? ' nav-burger--open' : ''}`}
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={navOpen}
          onClick={() => setNavOpen(open => !open)}
        >
          <span /><span /><span />
        </button>
        <ul className={`nav-links${navOpen ? ' nav-links--open' : ''}`}>
          <li><a href="#chapter-1" onClick={() => setNavOpen(false)}>The Players</a></li>
          <li><a href="#chapter-2" onClick={() => setNavOpen(false)}>The States</a></li>
          <li><a href="#chapter-3" onClick={() => setNavOpen(false)}>The Tickets</a></li>
          <li><a href="#chapter-4" onClick={() => setNavOpen(false)}>The Confederations</a></li>
          <li><a href="#chapter-5" onClick={() => setNavOpen(false)}>The Road to the Final</a></li>
        </ul>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <PitchRings />
        <HeroMotifs />
        <div className="hero-content">
          <span className="hero-eyebrow">FIFA World Cup</span>
          <p className="hero-year">World Cup 2026</p>
          <h1 className="hero-title">Before the Whistle</h1>
          <p className="hero-tagline">
            The world's biggest sporting event is coming to North America. Before a
            ball is kicked, the data already tells a story — of icons, obsessions,
            and a nation falling in love with the beautiful game.
          </p>
          <div className="hero-meta">
            <span>Kicks off June 11, 2026</span>
            <span className="hero-meta-sep">·</span>
            <span>USA &nbsp;·&nbsp; Canada &nbsp;·&nbsp; Mexico</span>
            <span className="hero-meta-sep">·</span>
            <span>48 Teams &nbsp;·&nbsp; 104 Matches</span>
          </div>
          <p className="hero-byline">Concept, analysis, design, and development by Andrew Peters</p>
        </div>
        <div className="hero-scroll" aria-label="Scroll to continue">
          <div className="hero-scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="intro-section">
        <div className="container--narrow">
          <p className="intro-lead">
            "The World Cup is not just a football tournament — it is the closest
            thing the world has to a shared story."
          </p>
          <p className="intro-body">
            The 2026 FIFA World Cup has barely kicked off, but the world is already
            watching. Wikipedia page views and Google searches reveal a handful of
            players commanding almost all of the attention. Ticket marketplaces show
            fans already paying record prices to be there in person. Not to mention that the
            tournament has nearly doubled in size — and
            in complexity — since the United States last played host. What follows
            is a data-driven portrait of football fever in the months before the
            tournament: who the world is watching, what it's costing them,
            and how far the game itself will have to travel to crown a winner.
          </p>
          <p className="intro-body">
            For the first time since 1994, the United States is a host nation — but this
            time it shares that honour with Canada and Mexico.
            As North America gears up for its biggest sporting moment in a generation,
            the data reveals just how deeply, and how differently, the game has
            taken hold.
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* ── Chapter 1: The 48 Nations ── */}
      <section id="chapter-1" className="chapter">
        <div className="chapter-inner">
          <header className="chapter-header">
            <span className="chapter-eyebrow">Part I</span>
            <h2 className="chapter-title">The Players the World Can't Stop Searching</h2>
            <p className="chapter-subtitle">
              Wikipedia page views from January to June 2026 reveal which footballers
              are dominating global attention — before a single match has been played.
            </p>
          </header>

          {/* Key stats */}
          <div className="stat-row">
            {[
              { n: '5.7M',  label: 'Ronaldo Wikipedia views' },
            ].map(({ n, label }) => (
              <div className="stat-item" key={label}>
                <div className="stat-number">{n}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="chapter-body">
            <p>
              Cristiano Ronaldo, at 41, remains the most searched footballer on earth
              by a margin that defies his age and his league. His Wikipedia page drew
              5.7 million English-language views in the first half of 2026 alone —
              nearly double that of Lionel Messi in second place. Whatever the sport
              decides on the pitch, the internet has already rendered its verdict.
            </p>
            <p>
              Messi's continued relevance at 38 — playing in MLS with Inter Miami —
              is remarkable in itself. Behind them, a new generation presses: Lamine
              Yamal, eighteen years old, already pulling in over 2.5 million views.
              Three household names — Neymar, Phil Foden, and Trent Alexander-Arnold —
              are absent from the tournament entirely, either through injury or omission.
              The top 15 players per Wikipedia views are displayed in the visual below.
            </p>
          </div>

          <PassportViz />
          <p className="chapter-annotation">
            Wikipedia English page views, January – June 2026 · Normalised to Ronaldo = 100 · Stamp size reflects interest score · Source: Wikimedia REST API · Photos: Wikimedia Commons (CC BY-SA)
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* ── Chapter 2: Three Host Nations ── */}
      <section id="chapter-2" className="chapter">
        <div className="chapter-inner">
          <header className="chapter-header">
            <span className="chapter-eyebrow">Part II</span>
            <h2 className="chapter-title">Soccer Mania Sweeps the United States</h2>
            <p className="chapter-subtitle">
              The US is hosting its first World Cup since 1994. Google Trends data
              from the six months before kick-off reveals which footballers Americans
              are searching for.
            </p>
          </header>

          <div className="host-grid">
            {[
              {
                country: 'Ronaldo Reigns',
                detail: 'Cristiano Ronaldo is the most-Googled footballer in 45 states and Washington D.C. — an extraordinary show of dominance for a player in the Saudi Pro League.',
                stadiums: '45 states + D.C.',
              },
              {
                country: "Messi's Six",
                detail: 'Lionel Messi leads in Florida — home of his club Inter Miami — as well as Maryland, Utah, Colorado, Alabama, and Vermont, where searches skew toward his Argentine fanbase.',
                stadiums: 'Florida · Maryland · Utah · Colorado · Alabama · Vermont',
              },
            ].map(({ country, detail, stadiums }) => (
              <div className="host-card" key={country}>
                <span className="host-card__country">{country}</span>
                <p className="host-card__detail">{detail}</p>
                <span className="host-card__stadiums">{stadiums}</span>
              </div>
            ))}
          </div>

          <div className="chapter-body">
            <p>
              Football has long been growing in the United States, but the 2026 World
              Cup represents a step-change in mainstream attention. Google searches for
              individual players have surged since the tournament draw in December 2025,
              with Ronaldo and Messi — two players whose clubs are in Saudi Arabia and
              Florida respectively — pulling far ahead of active European league stars.
            </p>
            <p>
              The regional patterns are telling. Messi's grip on Florida is directly
              tied to his move to Inter Miami; his presence in the state has converted
              casual fans into devoted followers. Utah and Colorado, with large Latino
              populations and growing MLS fanbases, lean Messi too. Everywhere else,
              Ronaldo's global social media dominance translates directly into search.
            </p>
          </div>

          <StateViz />
          <p className="chapter-annotation">
            Most searched footballer per state · Google Trends, Jan–Jun 2026 · Border colour = player's country · Hover a state to see the top 5
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* ── Chapter 3: Ticket Pricing ── */}
      <section id="chapter-3" className="chapter">
        <div className="chapter-inner">
          <header className="chapter-header">
            <span className="chapter-eyebrow">Part III</span>
            <h2 className="chapter-title">The Price of the Beautiful Game</h2>
            <p className="chapter-subtitle">
              Every four years, a World Cup Final ticket becomes harder to afford.
              Eight tournaments of data tell the story — from a $50 Final ticket
              in 1994 to a $2,030 seat in New Jersey.
            </p>
          </header>

          <div className="stat-row">
            {[
              { n: '$2,030', label: 'Cheapest 2026 Final, face value' },
              { n: '10.2×',  label: 'Final vs. Group Stage multiple, 2026' },
              { n: '1.7×',   label: 'Lowest ever multiple — USA 1994' },
              { n: '$30',    label: 'Cheapest group ticket in dataset — USA 1994' },
            ].map(({ n, label }) => (
              <div className="stat-item" key={label}>
                <div className="stat-number">{n}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="chapter-body">
            <p>
              The 2026 World Cup broke every ticketing precedent. The cheapest group
              stage seat was $200 at face value — the highest ever. The cheapest
              Final ticket was $2,030. That 10.2× gap between a group match and the
              final dwarfs any previous tournament. In 1994, the cheapest Final
              ticket was just $50 — 1.7 times the group stage price of $30.
              The game was still the thing.
            </p>
            <p>
              Each line in the chart below traces one World Cup across three columns:
              group stage price on the left, the Final-to-Group multiplier in the
              centre, and the final price on the right. Because each column is sorted
              independently, lines that cross reveal something real — USA 1994 sits
              at the bottom of the multiplier column despite its rock-bottom $50 Final
              price, reflecting an era when the gap between group and final was barely
              felt. Germany 2006, by contrast, kept group prices high relative to
              the final, producing one of the tightest spreads of the modern era.
            </p>
          </div>

          <TicketViz />
          <p className="chapter-annotation">
            *Does not include discounted tickets offered to residents of host countries, or those resold ·
            Face value, cheapest category, USD · Sources: WorldCupGuide.com; FIFA · 2026 values confirmed by The Economist (May 2026); pre-2026 years estimated · Hover a line to isolate a year
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* ── Chapter 4: Confederations ── */}
      <section id="chapter-4" className="chapter">
        <div className="chapter-inner">
          <header className="chapter-header">
            <span className="chapter-eyebrow">Part IV</span>
            <h2 className="chapter-title">The Changing Face of the World Cup</h2>
            <p className="chapter-subtitle">
              From 24 teams to 48 — the tournament doubles in size, and the world gets a bigger seat at the table.
            </p>
          </header>

          <div className="stat-row">
            {[
              { n: '48',         label: 'Teams at the 2026 World Cup'              },
              { n: '100%',       label: 'Growth in number of teams since 1994'           },
              { n: '54% → 33%',  label: "UEFA's share of teams, 1994 vs 2026"      },
              { n: '+14',        label: 'New CAF + AFC slots combined since 1994'   },
            ].map(({ n, label }) => (
              <div className="stat-item" key={label}>
                <div className="stat-number">{n}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="chapter-body">
            <p>
              For three decades, the 32-team format felt permanent. Then FIFA voted to
              expand. In 2026, the World Cup swells to 48 teams — its largest field ever,
              and double the size of 1994. Each block in the chart below represents one
              team slot, coloured by confederation.
            </p>
            <p>
              The expansion hasn&rsquo;t gone to Europe. UEFA remains the largest
              confederation by count, sending 16 teams to the 2026 World Cup, but its share of the
              field has fallen from 54% in 1994 to just 33%. The real winners are Africa
              and Asia. CAF more than triples its allocation from 3 to 10 teams; AFC more
              than quadruples from 2 to 9. The World Cup is seemingly becoming a genuinely
              global tournament.
            </p>
          </div>

          <ConfederationViz />
          <p className="chapter-annotation">
            Source: FIFA · Confederation berths per tournament · Hover a block to see countries and FIFA world ranking that year, or a legend item to isolate a region across all years
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* ── Chapter 5: Air Miles ── */}
      <section id="chapter-5" className="chapter">
        <div className="chapter-inner">
          <header className="chapter-header">
            <span className="chapter-eyebrow">Part V</span>
            <h2 className="chapter-title">The Road to the Final</h2>
            <p className="chapter-subtitle">
              For the first time, the World Cup spans a continent. Every group's
              winner, runner-up, and third-place finisher faces a different knockout
              journey — some barely leave their time zone, others criss-cross the
              entire map before reaching MetLife Stadium.
            </p>
          </header>

          <div className="stat-row">
            {[
              { n: '16',        label: 'Host stadiums across 3 countries' },
              { n: '32',        label: 'Knockout matches before a champion is crowned' },
              { n: '16,541 km', label: "Longest possible road to the Final — Czech Republic, as Group A runner-up" },
              { n: '5,184 km',  label: 'Shortest possible road to the Final — Mexico, as Group A winner' },
            ].map(({ n, label }) => (
              <div className="stat-item" key={label}>
                <div className="stat-number">{n}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="chapter-body">
            <p>
              The new 48-team format adds a Round of 32, which means every team's
              knockout route now runs through five possible matches across up to
              five different host cities — and that's on top of three group-stage
              fixtures that vary team by team, even within the same group. Mexico
              and South Africa are both in Group A, but they fly two entirely
              different routes to get there.
            </p>
            <p>
              Because the knockout bracket is fixed long before the draw
              of actual qualiying teams, that half of the journey can be mapped in
              advance, for example, any "Group A Winner" or "Group B Runner-up". 
              However, the outcome of said groups can't be knownin advance, so each 
              bar below shows all four teams that could occupy a given
              finishing position, group stage included. Third-place qualifiers add
              one more caveat: a
              third-place finisher's knockout entry point depends on how the seven
              other qualifying third-place teams rank, meaning some groups carry a
              handful of possible routes, not just one! I tried my best to visualise
              the possibilities below!
            </p>
          </div>

          <AirMilesViz />
          <p className="chapter-annotation">
            Source: FIFA · Distances are great-circle (straight-line) between host stadiums, group stage through the Final, with arrows marking each leg's direction of travel · Hover a row for all 4 candidate teams, a dot for one team's full route, or a venue on the map for stadium capacity and hosted rounds
          </p>
        </div>
      </section>

      {/* ── Outro ── */}
      <section className="intro-section">
        <div className="container--narrow">
          <p className="intro-lead">
            "Before the whistle, the numbers already know more than we do."
          </p>
          <p className="intro-body">
            None of this — the search rankings, the ticket prices, the expanded
            bracket, the routes teams will fly — settles anything on the pitch.
            Favourites stumble, unknown teams catch fire, and the data resets the
            moment the first whistle blows. But it does tell us what the world
            is bringing into the tournament: who it's watching, what it's willing
            to pay, and how much bigger this version of the game has become.
          </p>
          <p className="intro-body">
            On June 11, 2026, three host nations and forty-eight teams stop
            anticipating and start playing. Everything above is the story of the
            wait. What happens next is football's.
          </p>
        </div>
      </section>

      {/* ── Share ── */}
      <section className="share-section">
        <div className="container--narrow share-inner">
          <p className="share-title">Share the Story</p>
          <p className="share-sub">If this gave you a new way to look at the World Cup, pass it along.</p>
          <div className="share-buttons">
            {SHARE_LINKS.map(({ label, href }) => (
              <a key={label} className="share-btn" href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <p className="footer-title">World Cup 2026 — Before the Whistle</p>
            <p className="footer-byline">By Andrew Peters</p>
            <p className="footer-sub">
              An independent data project exploring global football interest ahead of
              the 2026 FIFA World Cup. All data sourced from publicly available records.
            </p>
          </div>
          <div className="footer-bottom">
            <span>Data: Wikipedia REST API · Google Trends · StubHub · SeatGeek · Wikimedia Commons · The Economist</span>
            <span>Built with React + D3.js</span>
          </div>
        </div>
      </footer>
    </>
  )
}
