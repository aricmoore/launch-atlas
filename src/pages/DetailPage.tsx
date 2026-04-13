import { useState } from 'react'
import { useLaunchData } from '@/hooks/useLaunchData'
import { LineChart } from '@/components/LineChart'
import { LoadingScreen } from '@/components/LoadingScreen'
import type { CountryKey, YearCountryData } from '@/types'
import { COUNTRY_HEX, COUNTRY_FLAGS } from '@/utils/colors'
import styles from './DetailPage.module.css'

const ALL_COUNTRIES: CountryKey[] = ['USA', 'Russia', 'China', 'Europe', 'Japan', 'India', 'SpaceX', 'Other']

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div
        className={styles.statValue}
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  )
}

function computeStats(raw: YearCountryData[], yearRange: [number, number]) {
  const filtered = raw.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1])
  const total = filtered.reduce((s, d) => s + d.launches, 0)
  const reusable = filtered.reduce((s, d) => s + d.reusable, 0)

  const byCountry = ALL_COUNTRIES.map(c => ({
    country: c,
    launches: filtered.filter(d => d.country === c).reduce((s, d) => s + d.launches, 0),
  })).sort((a, b) => b.launches - a.launches)

  const peakYear = (() => {
    const byYear = new Map<number, number>()
    for (const d of filtered) {
      byYear.set(d.year, (byYear.get(d.year) ?? 0) + d.launches)
    }
    let maxY = 0, maxV = 0
    byYear.forEach((v, y) => { if (v > maxV) { maxV = v; maxY = y } })
    return { year: maxY, launches: maxV }
  })()

  return { total, reusable, byCountry, peakYear }
}

export function DetailPage() {
  const { lineSeries, raw, loading, progress, source } = useLaunchData()
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2025])

  if (loading) return <LoadingScreen progress={progress} />

  const stats = computeStats(raw, yearRange)

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowTag}>Annual Detail View</span>
            {source === 'static' && (
              <span className={styles.staticBadge}>Static dataset</span>
            )}
          </div>
          <h1 className={styles.title}>Launch Count by Year</h1>
          <p className={styles.subtitle}>
            Annual orbital launches per country and provider. Toggle countries
            and adjust the year range to compare trajectories.
          </p>
        </header>

        {/* Year range filter */}
        <div className={styles.rangeWrap}>
          <div className={styles.rangeLabel}>
            <span className={styles.rangeLabelText}>Year range</span>
            <span className={styles.rangeValue}>
              {yearRange[0]} to {yearRange[1]}
            </span>
          </div>
          <div className={styles.rangeInputs}>
            <div className={styles.rangeGroup}>
              <label className={styles.rangeInputLabel}>From: {yearRange[0]}</label>
              <input
                type="range"
                className={styles.rangeInput}
                min={2000}
                max={2025}
                value={yearRange[0]}
                onChange={e => {
                  const val = Number(e.target.value)
                  setYearRange([Math.min(val, yearRange[1] - 1), yearRange[1]])
                }}
              />
            </div>
            <div className={styles.rangeGroup}>
              <label className={styles.rangeInputLabel}>To: {yearRange[1]}</label>
              <input
                type="range"
                className={styles.rangeInput}
                min={2000}
                max={2025}
                value={yearRange[1]}
                onChange={e => {
                  const val = Number(e.target.value)
                  setYearRange([yearRange[0], Math.max(val, yearRange[0] + 1)])
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
          <StatCard
            label="Total launches"
            value={stats.total.toLocaleString()}
            sub={`${yearRange[0]}–${yearRange[1]}`}
          />
          <StatCard
            label="Reusable flights"
            value={stats.reusable.toLocaleString()}
            sub={`${stats.total > 0 ? Math.round((stats.reusable / stats.total) * 100) : 0}% of total`}
            color="var(--color-spacex)"
          />
          <StatCard
            label="Peak year"
            value={stats.peakYear.year}
            sub={`${stats.peakYear.launches} launches`}
          />
          <StatCard
            label="Top country"
            value={`${COUNTRY_FLAGS[stats.byCountry[0]?.country ?? 'Other']} ${stats.byCountry[0]?.country ?? 'N/A'}`}
            sub={`${stats.byCountry[0]?.launches ?? 0} total`}
            color={COUNTRY_HEX[stats.byCountry[0]?.country ?? 'Other']}
          />
        </div>

        {/* Chart */}
        <div className={styles.chartSection}>
          <LineChart series={lineSeries} yearRange={yearRange} />
        </div>

        {/* Country breakdown table */}
        <div className={styles.tableSection}>
          <h2 className={styles.tableTitle}>
            Country Breakdown: {yearRange[0]}–{yearRange[1]}
          </h2>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Country</span>
              <span>Launches</span>
              <span>Share</span>
              <span>Reusable</span>
            </div>
            {stats.byCountry.map((row, i) => (
              <div key={row.country} className={styles.tableRow}>
                <span className={styles.tableCountry}>
                  <span className={styles.tableRank}>{i + 1}</span>
                  <span
                    className={styles.tableCountryDot}
                    style={{ background: COUNTRY_HEX[row.country] }}
                  />
                  {COUNTRY_FLAGS[row.country]} {row.country}
                </span>
                <span className={styles.tableNum}>{row.launches.toLocaleString()}</span>
                <span className={styles.tableNum}>
                  {stats.total > 0
                    ? `${Math.round((row.launches / stats.total) * 100)}%`
                    : 'N/A'}
                </span>
                <span className={styles.tableNum}>
                  {raw
                    .filter(d => d.country === row.country && d.year >= yearRange[0] && d.year <= yearRange[1])
                    .reduce((s, d) => s + d.reusable, 0)
                    .toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className={styles.back}>
          <a href="/" className={styles.backLink}>
            ← Back to race view
          </a>
        </div>

      </div>
    </main>
  )
}
