import React from "react";
import styles from "./Comments.module.css";
import { CommentBox } from "../CommentBox/CommentBox";

interface NewComment {
  author: string;
  body: string;
  createdAt: string;
}

interface CommentsProp {
  children: React.ReactNode;
  slug: string;
  isError: boolean;
  onCommentPosted: (comment: NewComment) => void;
}

export function Comments({
  children,
  isError,
  slug,
  onCommentPosted,
}: CommentsProp) {
  const hasComments = React.Children.count(children) > 0;

  return (
    <>
      <h2>Comments</h2>
      {isError ? (
        <p className={styles.errMsg}>error :&lt; could not fetch comments</p>
      ) : hasComments ? (
        <div className={styles.commentsList}>{children}</div>
      ) : (
        <p>No comments yet</p>
      )}

      {!isError && <CommentBox slug={slug} onCommentPosted={onCommentPosted} />}
    </>
  );
}
