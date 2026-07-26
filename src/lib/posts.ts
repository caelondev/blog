import type { ComponentType } from "react";

export interface PostMeta {
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
}

interface PostModule {
  default: ComponentType;
  frontmatter: PostMeta;
}

export interface Post extends PostMeta {
  slug: string;
  Component: ComponentType;
}

const modules = import.meta.glob<PostModule>("../articles/*.md", {
  eager: true,
});

export const posts: Post[] = Object.entries(modules)
  .map(([path, mod]) => ({
    slug: path.split("/").pop()!.replace(/\.md$/, ""),
    Component: mod.default,
    ...mod.frontmatter,
  }))
  .sort((a, b) => b.date.localeCompare(a.date));
