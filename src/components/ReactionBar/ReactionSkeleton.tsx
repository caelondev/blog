import styles from "./ReactionBar.module.css";

export function ReactionSkeleton({ className }:{ className: string }) {
  return (
    <div className={`${styles.row} ${className}`} aria-hidden="true">
      <div className={styles.skeletonPill} style={{ width: 58 }} />
      <div className={styles.skeletonPill} style={{ width: 70 }} />
      <div className={styles.skeletonPill} style={{ width: 52 }} />
      <div className={styles.skeletonPlus} />
    </div>
  );
}
