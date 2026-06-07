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
      style={!study.thumbnail ? { background: study.bgColor } : undefined}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0, 0, 0.2, 1], delay: index * 0.13 }}
      aria-label={`${study.cardTitle} — ${study.teaser}`}
    >
      {study.thumbnail && (
        <img
          src={study.thumbnail}
          alt=""
          className={styles.bgImage}
          aria-hidden="true"
          loading="lazy"
        />
      )}
      <div className={styles.overlay} aria-hidden="true" />

      <span className={styles.category}>{study.category}</span>
      <div className={styles.spacer} />

      <div className={styles.bottomContent}>
        <p className={styles.teaser}>{study.teaser}</p>
        <h3 className={styles.title}>{study.cardTitle}</h3>
      </div>
    </motion.a>
  );
}
