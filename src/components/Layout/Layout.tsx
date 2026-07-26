import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          blog<span className={styles.dot}>.</span>
          <span className={styles.logoAccent}>caelondev</span>
        </Link>
        <a href="https://git.caelondev.net"
            className={styles.codebergIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              fill="var(--primary)"
              d="M12 1A11 11 0 0 0 1 12a11 11 0 0 0 1.7 6.4L12 6l9.3 12.4A11 11 0 0 0 23 12 11 11 0 0 0 12 1Z"
            />
            <path
              fill="var(--muted)"
              d="M21.3 18.4 12 6l4.4 16.8a11 11 0 0 0 4.9-4.4Z"
            />
          </svg>
        </a>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <nav className={styles.footerLinks}>
          <a
            href="https://caelondev.net"
            className={styles.footerLink}
            target="_blank"
            rel="noreferrer"
          >
            caelondev.net
          </a>
          <span className={styles.footerDivider}>·</span>
          <a
            href={`${import.meta.env.BASE_URL}rss.xml`}
            className={styles.footerLink}
          >
            rss
          </a>
          <span className={styles.footerDivider}>·</span>
          <a href="mailto:me@caelondev.net" className={styles.footerLink}>
            me@caelondev.net
          </a>
        </nav>
        <span className={styles.footerCopy}>
          © {new Date().getFullYear()} caelondev
        </span>
      </footer>
    </div>
  );
}
