import { NavLink } from 'react-router-dom'
import styles from './Nav.module.css'

// Exact Apogee icon from their repo, all strokes in amber
function ApogeeIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="12" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
      <circle cx="14" cy="14" r="3" fill="#f59e0b"/>
      <line x1="14" y1="2" x2="14" y2="8" stroke="#f59e0b" strokeWidth="1.5"/>
      <path d="M 6 22 Q 14 6 22 22" stroke="#f59e0b" strokeWidth="1" fill="none" strokeDasharray="2 2"/>
    </svg>
  )
}

// Launch Atlas mark: open-base A triangle with blue inner exhaust trails
// + LAUNCH in white, ATLAS in blue, IBM Plex Mono
function LaunchAtlasLogo() {
  return (
    <svg
      className={styles.logoSvg}
      viewBox="0 0 420 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Launch Atlas"
    >
      {/* A mark — outer legs in white, open base (no bottom stroke = ascending) */}
      <line x1="22" y1="44" x2="2"  y2="4"  stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="22" y1="44" x2="42" y2="4"  stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Inner blue twin strokes — exhaust / launch trail */}
      <line x1="22" y1="34" x2="12" y2="14" stroke="#60a5fa" strokeWidth="2"   strokeLinecap="round"/>
      <line x1="22" y1="34" x2="32" y2="14" stroke="#60a5fa" strokeWidth="2"   strokeLinecap="round"/>

      {/* LAUNCH in white */}
      <text
        x="56"
        y="36"
        fontFamily="'IBM Plex Mono', 'Courier New', monospace"
        fontSize="40"
        fontWeight="500"
        letterSpacing="1"
        fill="#f4f4f5"
      >LAUNCH</text>

      {/* ATLAS in blue */}
      <text
        x="220"
        y="36"
        fontFamily="'IBM Plex Mono', 'Courier New', monospace"
        fontSize="40"
        fontWeight="500"
        letterSpacing="1"
        fill="#60a5fa"
      >ATLAS</text>
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
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Race
          </NavLink>
          <NavLink
            to="/detail"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Detail
          </NavLink>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span>2000&#8211;2025</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
