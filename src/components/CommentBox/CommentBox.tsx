import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./CommentBox.module.css";
import { signRequest } from "../../utils/signRequest";

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

interface SessionUser {
  login: string;
  avatar: string;
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const API = "https://api.caelondev.net/blog";

export function CommentBox({ slug, onCommentPosted }: CommentBoxProps) {
  const DRAFT_KEY = `blog-comment-draft:${slug}`;

  const [user, setUser] = useState<SessionUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerify, setShowVerify] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenResolverRef = useRef<((token: string) => void) | null>(null);

  // who's logged in?
  useEffect(() => {
    axios
      .get(`${API}/auth/me`, { withCredentials: true })
      .then((r) => setUser(r.data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true));
  }, []);

  // restore the draft we stashed before the github redirect
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem(DRAFT_KEY);
      if (draft) {
        setBody(draft);
        sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch { }
  }, [DRAFT_KEY]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      console.error(
        "VITE_TURNSTILE_SITE_KEY is missing, check your .env file and restart the dev server",
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

  function loginWithGithub() {
    try {
      if (body.trim()) sessionStorage.setItem(DRAFT_KEY, body);
    } catch { }
    window.location.href = `${API}/auth/github?redirect=${encodeURIComponent(
      window.location.href,
    )}`;
  }

  async function logout() {
    try {
      await axios.post(`${API}/auth/logout`, null, { withCredentials: true });
    } catch (err) {
      console.error(err);
    }
    setUser(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("login with github to comment");
      return;
    }
    if (!body.trim()) {
      setError("say something first");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getToken();
      // the server ignores author and uses the session, this only feeds the signature
      const sign = await signRequest({ author: user.login, body });

      await axios.post(
        `${API}/posts/${slug}/comments`,
        { author: user.login, body },
        {
          withCredentials: true,
          headers: {
            "x-turnstile-token": token,
            "x-trace-id": sign,
          },
        },
      );

      onCommentPosted?.({
        author: user.login,
        body,
        createdAt: new Date().toISOString(),
      });

      setBody("");
    } catch (err) {
      console.error(err);
      const serverMsg = axios.isAxiosError(err)
        ? err.response?.data?.error
        : null;
      setError(
        typeof serverMsg === "string" && serverMsg.length < 100
          ? serverMsg
          : "failed to post comment, try again",
      );
    } finally {
      setIsSubmitting(false);
      if (widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }
  }

  return (
    <form className={styles.commentBox} onSubmit={handleSubmit}>
      {user && (
        <div className={styles.loggedIn}>
          <img src={user.avatar} alt="" className={styles.avatar} />
          <span>
            commenting as <b>@{user.login}</b>
          </span>
          <button type="button" className={styles.linkButton} onClick={logout}>
            logout
          </button>
        </div>
      )}
      <textarea
        placeholder="say something..."
        className={styles.bodyInput}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={1000}
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.sendButton}
          disabled={isSubmitting || !user}
        >
          {isSubmitting ? "sending..." : "send"}
        </button>
        {authReady && !user && (
          <button
            type="button"
            className={`${styles.sendButton} ${styles.githubButton}`}
            onClick={loginWithGithub}
          >
            login with github
          </button>
        )}
      </div>

      <div
        className={`${styles.verifyBackdrop} ${showVerify ? styles.verifyBackdropActive : ""
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
