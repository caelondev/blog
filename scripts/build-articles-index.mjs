import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = resolve(__dirname, "../public/articles");

function parseFrontmatter(raw) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  if (!match) {
    return { title: "untitled", date: "", tags: [], excerpt: "" };
  }

  const meta = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();

    if (key === "tags") {
      meta[key] = val
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((t) => t.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      meta[key] = val.replace(/^["']|["']$/g, "");
    }
  }

  return {
    title: meta.title ?? "untitled",
    date: meta.date ?? "",
    tags: meta.tags ?? [],
    excerpt: meta.excerpt ?? "",
  };
}

function buildIndex() {
  const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    console.warn(`No .md files found in ${ARTICLES_DIR}`);
  }

  const posts = files.map((file) => {
    const raw = readFileSync(join(ARTICLES_DIR, file), "utf-8");
    const meta = parseFrontmatter(raw);
    const slug = file.replace(/\.md$/, "");

    if (!meta.date) {
      console.warn(`⚠ "${file}" is missing a date in frontmatter`);
    }

    return { slug, ...meta };
  });

  posts.sort((a, b) => b.date.localeCompare(a.date));

  const outPath = join(ARTICLES_DIR, "index.json");
  writeFileSync(outPath, JSON.stringify(posts, null, 2));

  console.log(`✓ Generated index.json with ${posts.length} post(s)`);
  posts.forEach((p) => console.log(`  - ${p.slug} (${p.date || "no date"})`));
}

buildIndex();
