import { NavLink } from 'react-router-dom'
import styles from './Nav.module.css'

function ApogeeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="13" cy="13" r="11.5" stroke="#f59e0b" strokeWidth="1.5"/>
      <line x1="3" y1="13" x2="23" y2="13" stroke="#f59e0b" strokeWidth="1.2"/>
      <line x1="13" y1="3" x2="13" y2="23" stroke="#f59e0b" strokeWidth="1.2"/>
      <path d="M 8 13 A 5 5 0 0 1 18 13" stroke="#f59e0b" strokeWidth="1.2" fill="none"/>
      <circle cx="13" cy="13" r="1.8" fill="#f59e0b"/>
    </svg>
  )
}

function LaunchAtlasLogo() {
  return (
    <svg
      className={styles.logoSvg}
      viewBox="0 0 248 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Launch Atlas"
    >
      <text x="0" y="26" fontFamily="'IBM Plex Mono', 'Courier New', monospace" fontSize="17" fontWeight="500" letterSpacing="3" fill="#f4f4f5">LAUNCH</text>
      <line x1="100" y1="2" x2="100" y2="34" stroke="#3b82f6" strokeWidth="2"/>
      <line x1="100" y1="6" x2="115" y2="30" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
      <line x1="100" y1="21" x2="110" y2="21" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round"/>
      <text x="117" y="26" fontFamily="'IBM Plex Mono', 'Courier New', monospace" fontSize="17" fontWeight="500" letterSpacing="3" fill="#f4f4f5">TLAS</text>
    </svg>
  )
}

export function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <NavLink to="/" className={styles.logoLink} aria-label="Launch Atlas home">
            <LaunchAtlasLogo />
          </NavLink>
          <div className={styles.divider} />
          <a
            href="https://apogee-review.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.parentLink}
          >
            <ApogeeIcon />
            <span className={styles.parentLinkText}>APOGEE</span>
            <span className={styles.parentLinkArrow}>&#x2197;</span>
          </a>
        </div>
        <div className={styles.right}>
          <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Race</NavLink>
          <NavLink to="/detail" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Detail</NavLink>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span>2000&#8211;2025</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
