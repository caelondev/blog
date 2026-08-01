#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://blog.caelondev.net";
const ARTICLES_DIR = "src/articles";
const OUTPUT = "public/rss.xml";

function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!match) return {};

  const meta = {};

  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;

    const idx = line.indexOf(":");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    // Quoted string
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // Array
    else if (value.startsWith("[") && value.endsWith("]")) {
      try {
        value = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        value = [];
      }
    }

    meta[key] = value;
  }

  return meta;
}

const posts = fs
  .readdirSync(ARTICLES_DIR)
  .filter((file) => file.endsWith(".md"))
  .map((file) => {
    const content = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");

    return {
      slug: file.replace(/\.md$/, ""),
      ...parseFrontmatter(content),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date))
  .reverse()
  .map((post, i) => ({
    ...post,
    title: `${String(i).padStart(2, "0")}: ${post.title}`,
  }))
  .reverse();

function categoriesXml(post) {
  const tags = Array.isArray(post.tags) ? post.tags : [];

  if (!tags.length) return "";

  return tags
    .map((tag) => `      <category>${escapeXml(tag)}</category>`)
    .join("\n") + "\n";
}

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>caelondev</title>
    <link>${SITE_URL}</link>
    <description>Jericho's devlog, weblog, and freedom wall</description>
    <language>en-us</language>

${posts
  .map(
    (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/posts/${post.slug}</link>
      <guid>${SITE_URL}/posts/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
${categoriesXml(post)}      <description>${escapeXml(post.excerpt)}</description>
    </item>`,
  )
  .join("\n")}

  </channel>
</rss>
`;

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, rss, "utf8");

console.log(`✓ rss.xml generated with ${posts.length} post(s) -> ${OUTPUT}`);
