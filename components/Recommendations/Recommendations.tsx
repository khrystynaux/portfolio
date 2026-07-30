"use client";

import { motion } from "framer-motion";
import { recommendations } from "@/lib/recommendations";
import styles from "./Recommendations.module.css";

export default function Recommendations() {
  return (
    <section id="recommendations" className={styles.section} aria-label="Recommendations">
      <div className={styles.inner}>

        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
        >
          <h2 className={styles.heading}>Recommendations</h2>
          <span className={styles.subtitle}>What people say about working with me</span>
        </motion.div>

        <div className={styles.cards}>
          {recommendations.map((rec, i) => (
            <motion.figure
              key={rec.id}
              className={styles.card}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: [0, 0, 0.2, 1], delay: i * 0.13 }}
            >
              <span className={styles.quoteMark} aria-hidden="true">&ldquo;</span>
              <blockquote className={styles.quote}>{rec.quote}</blockquote>
              <figcaption className={styles.attribution}>
                <span className={styles.name}>{rec.name}</span>
                <span className={styles.title}>{rec.title}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>

      </div>
    </section>
  );
}
