import { useEffect, useState } from "react";
import styles from "./Hero.module.css";

export default function Hero() {
  const [fact, setFact] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}facts.json`)
      .then((res) => res.json())
      .then((facts: string[]) => {
        if (cancelled || facts.length === 0) return;
        const random = facts[Math.floor(Math.random() * facts.length)];
        setFact(random);
      })
      .catch(() => {
        if (!cancelled) setFact("");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={styles.hero}>
      <img
        src={`${import.meta.env.BASE_URL}caelon-cat.png`}
        alt="caelondev avatar"
        className={styles.avatar}
      />
      <div className={styles.intro}>
        <p className={styles.blurb}>
          Hey! this blog is where I share my thoughts, opinions, insights, and
          somewhat-hot takes about programming. everyone is welcome! :3
        </p>
        {fact && (
          <p className={styles.fact}>
            <span className={styles.factLabel}>did you know?</span>{" "}
            <span className={styles.factText}>{fact}</span>
          </p>
        )}
      </div>
    </section>
  );
}
