import { useState } from 'react'
import { useLaunchData } from '@/hooks/useLaunchData'
import { BarChartRace } from '@/components/BarChartRace'
import { LoadingScreen } from '@/components/LoadingScreen'
import { COUNTRY_HEX, COUNTRY_FLAGS } from '@/utils/colors'
import type { CountryKey } from '@/types'
import styles from './RacePage.module.css'

const STORY_BEATS = [
  { year: 2000, text: 'Russia dominates early-era launches. The US holds second with legacy Delta and Atlas vehicles.' },
  { year: 2006, text: 'SpaceX makes its first launch attempt. Falcon 1 fails twice before succeeding in 2008.' },
  { year: 2011, text: 'China surpasses Europe, accelerating its Long March program with rapid cadence growth.' },
  { year: 2016, text: 'SpaceX lands Falcon 9 first stage at sea — the reuse era begins in earnest.' },
  { year: 2018, text: 'China reaches 39 launches in a single year, overtaking Russia for the second-place slot.' },
  { year: 2020, text: 'SpaceX\'s reusable fleet scales dramatically. 26 launches, with 22 flying reused hardware.' },
  { year: 2022, text: 'SpaceX breaks 60 launches. Starlink constellation drives unprecedented commercial cadence.' },
  { year: 2023, text: 'SpaceX hits 96 launches — more than any nation-state has ever achieved in a single year.' },
]

export function RacePage() {
  const { raceFrames, loading, progress, source } = useLaunchData()
  const [showAbout, setShowAbout] = useState(false)

  if (loading) return <LoadingScreen progress={progress} />

  // Current frame index driven by BarChartRace is internal — we surface story beats
  // based on a passive frame tracker. For simplicity we show a rotating beat.

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowTag}>Data Visualization</span>
              {source === 'static' && (
                <span className={styles.staticBadge}>Static dataset</span>
              )}
            </div>
            <button
              className={styles.aboutBtn}
              onClick={() => setShowAbout(v => !v)}
            >
              {showAbout ? 'Close' : 'About this data'}
            </button>
          </div>

          <h1 className={styles.title}>
            Global Launch Cadence
            <span className={styles.titleSub}> 2000–2025</span>
          </h1>
          <p className={styles.subtitle}>
            Cumulative orbital launch attempts by country and provider.
            Reusable rockets, new entrants, and China's rise — visualized.
          </p>
        </header>

        {/* About panel */}
        {showAbout && (
          <div className={styles.aboutPanel}>
            <h3 className={styles.aboutTitle}>Methodology</h3>
            <p className={styles.aboutText}>
              Launch data sourced from{' '}
              <a href="https://ll.thespacedevs.com" target="_blank" rel="noopener noreferrer">
                Launch Library 2
              </a>{' '}
              by The Space Devs, a community-maintained database of orbital launch attempts.
              Launches are classified into 8 buckets: SpaceX is separated from the broader USA
              category to highlight the commercial reuse revolution. Europe includes ESA/Arianespace
              and associated national agencies. Cumulative totals represent successful and failed
              attempts combined. Data covers January 2000 through December 2025.
            </p>
            <div className={styles.aboutLegend}>
              {(['USA', 'Russia', 'China', 'Europe', 'Japan', 'India', 'SpaceX', 'Other'] as CountryKey[]).map(c => (
                <div key={c} className={styles.aboutLegendItem}>
                  <span
                    className={styles.aboutLegendDot}
                    style={{ background: COUNTRY_HEX[c] }}
                  />
                  <span>{COUNTRY_FLAGS[c]} {c}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className={styles.chartSection}>
          <BarChartRace frames={raceFrames} />
        </div>

        {/* Story beats */}
        <div className={styles.beats}>
          <h2 className={styles.beatsTitle}>Key Inflection Points</h2>
          <div className={styles.beatsGrid}>
            {STORY_BEATS.map(beat => (
              <div key={beat.year} className={styles.beat}>
                <span className={styles.beatYear}>{beat.year}</span>
                <p className={styles.beatText}>{beat.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA to detail */}
        <div className={styles.cta}>
          <a href="/detail" className={styles.ctaLink}>
            Explore Annual Launch Counts by Country &#x2192;
          </a>
        </div>

      </div>
    </main>
  )
}
