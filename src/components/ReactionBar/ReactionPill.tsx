import styles from "./ReactionBar.module.css";
import { type ReactionEmoji } from "./reaction";

interface ReactionPillProps {
  emoji: ReactionEmoji;
  count: number;
  reacted: boolean;
  onToggle: (emoji: ReactionEmoji) => void;
}

export function ReactionPill({
  emoji,
  count,
  reacted,
  onToggle,
}: ReactionPillProps) {
  return (
    <button
      type="button"
      className={`${styles.pill} ${reacted ? styles.pillActive : ""}`}
      aria-pressed={reacted}
      aria-label={`React with ${emoji}, ${count} reaction${count === 1 ? "" : "s"}`}
      onClick={() => onToggle(emoji)}
    >
      <span className={styles.emoji}>{emoji}</span>
      <span className={styles.count}>{count}</span>
    </button>
  );
}

