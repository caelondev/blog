export interface PostMeta {
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
}

export interface PostSummary extends PostMeta {
  slug: string;
}

export interface Post extends PostMeta {
  slug: string;
  content: string;
}

let manifestCache: PostSummary[] | null = null;

export async function getPosts(): Promise<PostSummary[]> {
  if (manifestCache) return manifestCache;

  const res = await fetch(`${import.meta.env.BASE_URL}articles/index.json`);
  if (!res.ok) {
    throw new Error(`Failed to load post index: ${res.status}`);
  }

  const data: PostSummary[] = await res.json();
  manifestCache = [...data].sort((a, b) => b.date.localeCompare(a.date));
  return manifestCache;
}

function parseFrontmatter(raw: string): { meta: PostMeta; content: string } {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!match) {
    return {
      meta: { title: "untitled", date: "", tags: [], excerpt: "" },
      content: raw,
    };
  }

  const [, fm, content] = match;
  const meta: Record<string, unknown> = {};

  for (const line of fm.split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();

    meta[key] =
      key === "tags"
        ? val
            .replace(/^\[|\]$/g, "")
            .split(",")
            .map((t) => t.trim().replace(/^["']|["']$/g, ""))
            .filter(Boolean)
        : val.replace(/^["']|["']$/g, "");
  }

  return {
    meta: {
      title: (meta.title as string) ?? "untitled",
      date: (meta.date as string) ?? "",
      tags: (meta.tags as string[]) ?? [],
      excerpt: (meta.excerpt as string) ?? "",
    },
    content,
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const res = await fetch(`${import.meta.env.BASE_URL}articles/${slug}.md`);
  if (!res.ok) return null;

  const raw = await res.text();
  const { meta, content } = parseFrontmatter(raw);
  return { slug, ...meta, content };
}
