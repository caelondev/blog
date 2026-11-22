import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { createHighlighter } from "shiki";

const iglot = JSON.parse(
  readFileSync(new URL("./src/syntaxes/iglot.tmLanguage.json", import.meta.url), "utf8"),
);

export default defineConfig({
  base: "/",
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        mdExtensions: [],
        mdxExtensions: [".mdx", ".md"],
        remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypePrettyCode,
            {
              theme: "rose-pine",
              getHighlighter: (options: any) =>
                createHighlighter({ ...options, langs: [iglot] })
            },
          ],
        ],
        providerImportSource: "@mdx-js/react",
      }),
    },
    react(),
  ],
});
