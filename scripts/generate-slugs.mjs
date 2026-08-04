#!/usr/bin/env node

import fs from "node:fs";

const ARTICLES_DIR = "src/articles";
const OUTPUT = "public/slug.json";

const slug = fs
  .readdirSync(ARTICLES_DIR)
  .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
  .map((f) => f.replace(/\.mdx?$/, ""));

fs.writeFileSync(OUTPUT, JSON.stringify(slug, null, 2), "utf-8");
