import styles from './Footer.module.css'

function ApogeeFooterLogo() {
  return (
    <a
      href="https://apogee-review.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.apogeeLink}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <circle cx="14" cy="14" r="12" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
        <circle cx="14" cy="14" r="3" fill="#f59e0b"/>
        <line x1="14" y1="2" x2="14" y2="8" stroke="#f59e0b" strokeWidth="1.5"/>
        <path d="M 6 22 Q 14 6 22 22" stroke="#f59e0b" strokeWidth="1" fill="none" strokeDasharray="2 2"/>
      </svg>
      <span className={styles.apogeeName}>APOGEE</span>
      <span className={styles.apogeeArrow}>&#x2197;</span>
    </a>
  )
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <ApogeeFooterLogo />
        <div className={styles.right}>
          <span className={styles.copy}>&copy; 2026 Apogee. All rights reserved.</span>
          <span className={styles.sep} />
          <a
            href="https://ll.thespacedevs.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Data: Launch Library 2
          </a>
        </div>
      </div>
    </footer>
  )
}