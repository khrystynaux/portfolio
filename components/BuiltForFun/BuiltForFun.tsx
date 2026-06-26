"use client";

import { motion } from "framer-motion";
import { funProjects } from "@/lib/funProjects";
import FunCard from "./FunCard";
import styles from "./BuiltForFun.module.css";

export default function BuiltForFun() {
  return (
    <section id="fun" className={styles.section} aria-label="Built for fun">
      <div className={styles.inner}>

        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
        >
          <h2 className={styles.heading}>Built for Fun</h2>
          <span className={styles.subtitle}>Side projects & experiments</span>
        </motion.div>

        {funProjects.map((project, i) => (
          <FunCard key={project.id} project={project} index={i} />
        ))}

      </div>
    </section>
  );
}
