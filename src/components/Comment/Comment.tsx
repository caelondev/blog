import styles from "./Comment.module.css";

interface CommentProp {
  author: string;
  body: string;
  createdAt: string;
}

export function Comment({ author, body, createdAt }: CommentProp) {
  return (
    <div className={styles.comment}>
      <div className={styles.info}>
        <span className={styles.author}>{author}</span>
        <span className={styles.createdAt}>
          {new Date(createdAt).toLocaleString()}
        </span>
      </div>
      <p className={styles.body}>{body}</p>
    </div>
  );
}
