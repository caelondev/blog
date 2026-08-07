import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ReactionBar.module.css";
import { REACTIONS, type ReactionEmoji } from "./reaction";
import { SmilePlus } from "lucide-react";

interface ReactionPickerProps {
  reactedSet: Set<ReactionEmoji>;
  onSelect: (emoji: ReactionEmoji) => void;
}

export function ReactionPicker({ reactedSet, onSelect }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const top = rect.bottom + 8;
    const left = window.innerWidth / 2;

    setDropdownPos({ top, left });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  const handleSelect = (emoji: ReactionEmoji) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <div className={styles.plusWrapper}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.plusButton}
        aria-label="Add a reaction"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <SmilePlus size={20} />
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className={styles.dropdown}
            style={{
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
            }}
            role="menu"
            aria-label="Choose a reaction"
          >
            {REACTIONS.map((emoji) => {
              const active = reactedSet.has(emoji);
              return (
                <button
                  key={emoji}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={active}
                  className={`${styles.dropdownEmoji} ${active ? styles.dropdownEmojiActive : ""}`}
                  aria-label={emoji}
                  onClick={() => handleSelect(emoji)}
                >
                  {emoji}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
