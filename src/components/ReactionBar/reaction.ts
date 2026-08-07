export const REACTIONS = [
  "👍",
  "❤️",
  "🔥",
  "🤔",
  "😲",
  "😎",
  "🚀",
  "☕",
  "👏",
  "😂",
  "🎉",
  "🤯",
] as const;

export type ReactionEmoji = (typeof REACTIONS)[number];
