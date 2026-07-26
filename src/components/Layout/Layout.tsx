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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={styles.codebergIcon}
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
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} caelondev</span>
      </footer>
    </div>
  );
}
