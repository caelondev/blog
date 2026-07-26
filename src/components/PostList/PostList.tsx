import { Link } from "react-router-dom";
import type { PostSummary } from "../../lib/posts.js";
import styles from "./PostList.module.css";

interface PostListProps {
  posts: PostSummary[];
}

export default function PostList({ posts }: PostListProps) {
  return (
    <ul className={styles.list}>
      {posts.map((post) => (
        <li key={post.slug} className={styles.item}>
          <Link to={`/posts/${post.slug}`} className={styles.link}>
            <span className={styles.prompt}>$</span>
            <span className={styles.title}>{post.title}</span>
          </Link>
          <div className={styles.meta}>
            <time className={styles.date}>{post.date}</time>
            {post.tags.length > 0 && (
              <span className={styles.tags}>
                {post.tags.map((tag) => `#${tag}`).join(" ")}
              </span>
            )}
          </div>
          <p className={styles.excerpt}>{post.excerpt}</p>
        </li>
      ))}
    </ul>
  );
}
