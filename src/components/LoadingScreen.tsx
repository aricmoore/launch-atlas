import styles from './LoadingScreen.module.css'

interface Props {
  progress?: { fetched: number; total: number } | null
}

export function LoadingScreen({ progress }: Props) {
  const pct = progress
    ? Math.min(100, Math.round((progress.fetched / progress.total) * 100))
    : null

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.orbits}>
          <div className={styles.orbit1} />
          <div className={styles.orbit2} />
          <div className={styles.dot} />
        </div>
        <p className={styles.label}>Fetching launch data</p>
        {progress && (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {progress.fetched.toLocaleString()} / {progress.total.toLocaleString()} launches
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
