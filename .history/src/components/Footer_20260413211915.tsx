import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>
          &copy; 2026 Apogee. All rights reserved.
        </span>
        <div className={styles.links}>
          <a
            href="https://ll.thespacedevs.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Data: Launch Library 2
          </a>
          <span className={styles.sep} />
          <a
            href="https://apogee-review.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Apogee &#x2197;
          </a>
        </div>
      </div>
    </footer>
  )
}
