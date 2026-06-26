"use client";

import { motion } from "framer-motion";
import { FunProject } from "@/lib/funProjects";
import styles from "./FunCard.module.css";

interface Props {
  project: FunProject;
  index: number;
}

export default function FunCard({ project, index }: Props) {
  return (
    <motion.a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0, 0, 0.2, 1], delay: index * 0.13 }}
      aria-label={`${project.cardTitle} — ${project.teaser} (opens in new tab)`}
    >
      {project.thumbnail && (
        <img
          src={project.thumbnail}
          alt={`${project.cardTitle} app screenshot`}
          className={styles.bgImage}
          loading="lazy"
        />
      )}

      <span className={styles.liveBadge}>
        <span className={styles.liveDot} />
        {project.category}
      </span>

      <div className={styles.hoverOverlay} aria-hidden="true" />

      <div className={styles.hoverContent}>
        <h3 className={styles.title}>{project.cardTitle}</h3>
        <p className={styles.teaser}>{project.teaser}</p>
        <span className={styles.cta}>Try it live ↗</span>
      </div>
    </motion.a>
  );
}
