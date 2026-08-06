import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./CommentBox.module.css";

declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          size?: "invisible" | "normal" | "compact";
          appearance?: "always" | "execute" | "interaction-only";
          execution?: "render" | "execute";
          callback?: (token: string) => void;
          "error-callback"?: () => void;
        },
      ) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface NewComment {
  author: string;
  body: string;
  createdAt: string;
}

interface CommentBoxProps {
  slug: string;
  onCommentPosted?: (comment: NewComment) => void;
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export function CommentBox({ slug, onCommentPosted }: CommentBoxProps) {
  const AUTHOR_KEY = "blog-comment-author";

  const [author, setAuthor] = useState(
    () => localStorage.getItem(AUTHOR_KEY) || "",
  );
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerify, setShowVerify] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenResolverRef = useRef<((token: string) => void) | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(AUTHOR_KEY, author);
    }, 300);
    return () => clearTimeout(timeout);
  }, [author]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      console.error(
        "VITE_TURNSTILE_SITE_KEY is missing — check your .env file and restart the dev server",
      );
      return;
    }

    if (!window.turnstile || !widgetRef.current || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      size: "normal",
      appearance: "execute",
      execution: "execute",
      callback: (token: string) => {
        tokenResolverRef.current?.(token);
        tokenResolverRef.current = null;
      },
      "error-callback": () => {
        setError("verification failed, try again");
        setIsSubmitting(false);
        tokenResolverRef.current = null;
      },
    });

    return () => {
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  const getToken = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      setShowVerify(true);
      tokenResolverRef.current = (token: string) => {
        setShowVerify(false);
        resolve(token);
      };
      if (widgetIdRef.current) {
        window.turnstile.execute(widgetIdRef.current);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !body.trim()) {
      setError("fill in both fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getToken();

      await axios.post(
        `https://api.caelondev.net/blog/posts/${slug}/comments`,
        { author, body },
        {
          headers: {
            "x-turnstile-token": token,
          },
        },
      );

      onCommentPosted?.({
        author,
        body,
        createdAt: new Date().toISOString(),
      });

      setAuthor("");
      setBody("");
    } catch (err) {
      console.error(err);
      setError("failed to post comment, try again");
    } finally {
      setIsSubmitting(false);
      if (widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }
  }

  return (
    <form className={styles.commentBox} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="username"
        className={styles.authorInput}
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        maxLength={32}
      />
      <textarea
        placeholder="say something..."
        className={styles.bodyInput}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={1000}
      />
      {error && <p className={styles.error}>{error}</p>}
      <button
        type="submit"
        className={styles.sendButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? "sending..." : "send"}
      </button>

      <div
        className={`${styles.verifyBackdrop} ${
          showVerify ? styles.verifyBackdropActive : ""
        }`}
      >
        <div className={styles.verifyCard}>
          <p className={styles.verifyLabel}>verifying...</p>
          <div ref={widgetRef} className={styles.turnstileWidget} />
        </div>
      </div>
    </form>
  );
}
