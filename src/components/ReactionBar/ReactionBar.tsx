import styles from "./ReactionBar.module.css";
import { REACTIONS } from "./reaction";
import { useReactionState } from "./useReactionState";
import { ReactionPill } from "./ReactionPill";
import { ReactionPicker } from "./ReactionPicker";
import { ReactionSkeleton } from "./ReactionSkeleton";

interface ReactionBarProps {
  slug: string;
  apiBase?: string;
  className?: string;
}

const DEFAULT_API_BASE = "https://api.caelondev.net/blog/posts";

export default function ReactionBar({
  slug,
  apiBase = DEFAULT_API_BASE,
  className,
}: ReactionBarProps) {
  const { loading, entries, toggle } = useReactionState(slug, apiBase);

  if (loading) {
    return <ReactionSkeleton className={className ?? ""} />;
  }

  const visibleReactions = REACTIONS.filter(
    (emoji) => entries[emoji].count > 0,
  );
  const reactedSet = new Set(
    REACTIONS.filter((emoji) => entries[emoji].reacted),
  );

  return (
    <div
      className={`${styles.wrapper} ${className ?? ""}`}
      role="group"
      aria-label="Reactions"
    >
      {visibleReactions && (
        <div className={styles.row}>
          {visibleReactions.map((emoji) => (
            <ReactionPill
              key={emoji}
              emoji={emoji}
              count={entries[emoji].count}
              reacted={entries[emoji].reacted}
              onToggle={toggle}
            />
          ))}
        </div>
      )}

      <ReactionPicker reactedSet={reactedSet} onSelect={toggle} />
    </div>
  );
}
