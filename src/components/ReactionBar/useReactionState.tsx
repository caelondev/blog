import { useEffect, useRef, useState } from "react";
import { REACTIONS, type ReactionEmoji } from "./reaction";
import { signRequest } from "../../utils/signRequest";

export interface ReactionEntry {
  count: number;
  reacted: boolean;
}

type ReactionState = Record<ReactionEmoji, ReactionEntry>;

const DEBOUNCE_MS = 1000;

function buildDefaultState(): ReactionState {
  const state = {} as ReactionState;
  for (const emoji of REACTIONS) {
    state[emoji] = { count: 0, reacted: false };
  }
  return state;
}

export function useReactionState(slug: string, apiBase: string) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<ReactionState>(buildDefaultState);

  const entriesRef = useRef(entries);
  const serverStateRef = useRef<ReactionState>(buildDefaultState());
  const timersRef = useRef<
    Partial<Record<ReactionEmoji, ReturnType<typeof setTimeout>>>
  >({});

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/${slug}/reactions`);
        const data: Record<string, ReactionEntry> = await res.json();

        const initial = buildDefaultState();
        for (const [emoji, info] of Object.entries(data)) {
          if (emoji in initial) {
            initial[emoji as ReactionEmoji] = {
              count: info.count,
              reacted: info.reacted,
            };
          }
        }

        if (!ignore) {
          setEntries(initial);
          serverStateRef.current = initial;
        }
      } catch {
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [slug, apiBase]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((t) => t && clearTimeout(t));
    };
  }, []);

  const settleReaction = async (emoji: ReactionEmoji) => {
    timersRef.current[emoji] = undefined;

    const displayed = entriesRef.current[emoji];
    const server = serverStateRef.current[emoji];

    if (displayed.reacted === server.reacted) return;

    const reactionTypes = [emoji].sort();
    const payload = { reactionType: reactionTypes };
    const trace = await signRequest(payload);

    try {
      if (displayed.reacted) {
        const res = await fetch(`${apiBase}/${slug}/reactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-trace-id": trace,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok && res.status !== 409) throw new Error("post failed");

        const data = res.status === 409 ? null : await res.json();
        const count =
          data?.results?.find((r: any) => r.emoji === emoji)?.count ??
          displayed.count;
        const confirmed = { count, reacted: true };
        serverStateRef.current[emoji] = confirmed;
        setEntries((prev) => ({ ...prev, [emoji]: confirmed }));
      } else {
        const res = await fetch(
          `${apiBase}/${slug}/reactions?reactionType=${encodeURIComponent(emoji)}`,
          {
            method: "DELETE",
            headers: { "x-trace-id": trace },
          },
        );

        if (!res.ok && res.status !== 404) throw new Error("delete failed");

        const data = res.status === 404 ? null : await res.json();
        const confirmed = {
          count: data?.count ?? displayed.count,
          reacted: false,
        };
        serverStateRef.current[emoji] = confirmed;
        setEntries((prev) => ({ ...prev, [emoji]: confirmed }));
      }
    } catch {
      const fallback = serverStateRef.current[emoji];
      setEntries((prev) => ({ ...prev, [emoji]: { ...fallback } }));
    }
  };

  const toggle = (emoji: ReactionEmoji) => {
    setEntries((prev) => {
      const current = prev[emoji];
      const nextReacted = !current.reacted;
      return {
        ...prev,
        [emoji]: {
          count: current.count + (nextReacted ? 1 : -1),
          reacted: nextReacted,
        },
      };
    });

    const existingTimer = timersRef.current[emoji];
    if (existingTimer) clearTimeout(existingTimer);

    timersRef.current[emoji] = setTimeout(
      () => settleReaction(emoji),
      DEBOUNCE_MS,
    );
  };

  return { loading, entries, toggle };
}
