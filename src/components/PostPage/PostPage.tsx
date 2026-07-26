import { Link, useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { getPostBySlug, type Post } from "../../lib/posts.js";
import styles from "./PostPage.module.css";

function CodeBlock({ children, ...props }: React.ComponentProps<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState("");

  useEffect(() => {
    const el = preRef.current;
    if (!el) return;
    const dataLang =
      el.getAttribute("data-language") ??
      el.querySelector("code")?.getAttribute("data-language");
    if (dataLang) setLang(dataLang);
  }, [children]);

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
      <pre ref={preRef} {...props}>
        {children}
      </pre>
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
}: Pick<Post, "title" | "date" | "tags" | "excerpt">) {
  return (
    <div className={styles.postMeta}>
      <h1 className={styles.postTitle}>{title}</h1>
      <div className={styles.metaRow}>
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
    </div>
  );
}

export default function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    getPostBySlug(slug).then((p) => {
      if (!cancelled) setPost(p);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (post === undefined) return <p>loading...</p>;
  if (post === null) return <p>not found</p>;

  const { title, date, tags, excerpt, content } = post;

  return (
    <div className={styles.postParent}>
      <Link to="/" className={styles.backLink}>
        &#9664; back to posts
      </Link>
      <PostMetadata title={title} date={date} tags={tags} excerpt={excerpt} />
      <div className={styles.postContent}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypePrettyCode, { theme: "rose-pine" }]]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
