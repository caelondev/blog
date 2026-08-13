import { Link, useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { MDXProvider } from "@mdx-js/react";
import { posts, type Post } from "../../lib/posts.js";
import styles from "./PostPage.module.css";
import { ViewPost } from "../ViewPost/ViewPost.js";
import axios from "axios";
import { Comments } from "../Comments/Comments.js";
import { Comment } from "../Comment/Comment.js";
import ReactionBar from "../ReactionBar/ReactionBar.js";

interface CommentResponse {
  author: string;
  body: string;
  createdAt: string;
}

function CodeBlock(props: React.ComponentProps<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState("");

  useEffect(() => {
    const codeEl = preRef.current?.querySelector("code");
    const dataLang = codeEl?.getAttribute("data-language");
    if (dataLang) setLang(dataLang);
  }, []);

  const handleCopy = async () => {
    const text = preRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.codeWrapper}>
      <div className={styles.codeHeader}>
        <span className={styles.langLabel}>{lang}</span>
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? "copied!" : "copy"}
        </button>
      </div>
      <pre ref={preRef} {...props} />
    </div>
  );
}

const components = {
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote className={styles.quote} {...props} />
  ),
  pre: CodeBlock,
};

function PostMetadata({
  title,
  date,
  tags,
  excerpt,
  slug,
}: Pick<Post, "title" | "date" | "tags" | "excerpt" | "slug">) {
  return (
    <div className={styles.postMeta}>
      <h1 className={styles.postTitle}>{title}</h1>
      <div className={styles.metaRow}>
        <ViewPost slug={slug} />
        <time className={styles.metaDate}>{date}</time>
        {tags.length > 0 && (
          <span className={styles.metaTags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </span>
        )}
      </div>
      {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
      <ReactionBar slug={slug} className={styles.reactions} />
      <hr className={styles.metaHr} />
    </div>
  );
}

export function PostPage() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      try {
        const { data } = await axios.get(
          `https://api.caelondev.net/blog/posts/${slug}/comments`,
        );

        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        setIsError(true);
        console.error(err);
      }
    }

    if (slug) {
      fetchComments();
    }
  }, [slug]);

  if (!post) {
    return <p>not found</p>;
  }

  const { Component, title, date, tags, excerpt } = post;

  return (
    <div className={styles.postParent}>
      <Link to="/" className={styles.backLink}>
        &#9664; back to posts
      </Link>

      <PostMetadata
        title={title}
        date={date}
        tags={tags}
        excerpt={excerpt}
        slug={slug || ""}
      />

      <div className={styles.postContent}>
        <MDXProvider components={components}>
          <Component />
        </MDXProvider>
      </div>

      <hr />
      <Comments
        isError={isError}
        slug={slug || ""}
        onCommentPosted={(newComment) =>
          setComments((prev) => [newComment, ...prev])
        }
      >
        {comments.map((c, i) => (
          <>
            <Comment
              key={i}
              author={c.author}
              body={c.body}
              createdAt={c.createdAt}
            />
            {i + 1 < comments.length && <hr className={styles.hr} />}
          </>
        ))}
      </Comments>
    </div>
  );
}
