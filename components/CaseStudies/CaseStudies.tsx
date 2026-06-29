"use client";

import { motion } from "framer-motion";
import { caseStudies } from "@/lib/caseStudies";
import CaseStudyCard from "./CaseStudyCard";
import styles from "./CaseStudies.module.css";

export default function CaseStudies() {
  return (
    <section id="work" className={styles.section} aria-label="Selected work">
      <div className={styles.inner}>

        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
        >
          <h2 className={styles.heading}>UX Case Studies</h2>
          <span className={styles.subtitle}>Exploring user problems through research, ideation, and iterative design</span>
        </motion.div>

        <div className={styles.grid}>
          {caseStudies.map((study, i) => (
            <CaseStudyCard key={study.id} study={study} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
