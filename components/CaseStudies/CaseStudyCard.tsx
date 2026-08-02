"use client";

import { motion } from "framer-motion";
import { CaseStudy } from "@/lib/caseStudies";
import styles from "./CaseStudyCard.module.css";

interface Props {
  study: CaseStudy;
  index: number;
}

export default function CaseStudyCard({ study, index }: Props) {
  return (
    <motion.a
      href={study.slug}
      className={styles.card}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0, 0, 0.2, 1], delay: index * 0.08 }}
      aria-label={`${study.cardTitle} — ${study.teaser}`}
    >
      <div className={styles.imageWrapper} style={{ background: study.bgColor }}>
        {study.thumbnail && (
          <img
            src={study.thumbnail}
            alt=""
            className={styles.image}
            aria-hidden="true"
            loading="lazy"
          />
        )}
      </div>

      <div className={styles.topScrim} aria-hidden="true">
        <h3 className={styles.title}>{study.cardTitle}</h3>
      </div>

      <div className={styles.teaserScrim} aria-hidden="true">
        <p className={styles.teaser}>{study.teaser}</p>
      </div>
    </motion.a>
  );
}
