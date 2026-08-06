import axios from "axios";
import { useEffect, useState } from "react";
import styles from "./ViewPost.module.css";
import { signRequest } from "../../utils/signRequest";

interface ViewPostProps {
  slug: string;
}

export function ViewPost({ slug }: ViewPostProps) {
  let [views, setViews] = useState("loading");

  useEffect(() => {
    (async () => {
      try {
        let res: any;
        if (import.meta.env.DEV) {
          // meh, dont count progress on dev
          res = await axios.get(
            `https://api.caelondev.net/blog/posts/${slug}/views`,
          );
        } else {
          const ts = Date.now()
          const sign = await signRequest({ ts });
          res = await axios.post(
            `https://api.caelondev.net/blog/posts/${slug}/views`,
            { ts },
            {
              headers: {
                "x-trace-id": sign,
              },
            },
          );
        }

        setViews(`${res.data.count} views`);
      } catch (err) {
        console.error(err);
        setViews("error! :<");
      }
    })();
  }, []);

  return <span className={styles.viewPost}>{views}</span>;
}
