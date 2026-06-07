"use client";

import { motion } from "framer-motion";
import { tools, categories } from "@/lib/tools";
import styles from "./Tools.module.css";

const ICON_SIZE = 18;

export default function Tools() {
  return (
    <section id="tools" className={styles.section} aria-label="Tools and stack">
      <div className={styles.inner}>

        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
        >
          Tools &amp; Stack
        </motion.h2>

        <div className={styles.groups}>
          {categories.map((category, catIdx) => {
            const categoryTools = tools.filter((t) => t.category === category);
            if (!categoryTools.length) return null;

            return (
              <motion.div
                key={category}
                className={styles.group}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, ease: [0, 0, 0.2, 1], delay: catIdx * 0.08 }}
              >
                <p className={styles.groupLabel}>{category}</p>
                <div className={styles.pills}>
                  {categoryTools.map((tool, toolIdx) => (
                    <motion.div
                      key={tool.id}
                      className={styles.pill}
                      initial={{ opacity: 0, scale: 0.92 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.3,
                        ease: [0, 0, 0.2, 1],
                        delay: catIdx * 0.08 + toolIdx * 0.06,
                      }}
                    >
                      <span
                        className={`${styles.iconWrapper} ${
                          tool.iconStyle === "stroke" ? styles.stroke : styles.fill
                        }`}
                        aria-hidden="true"
                      >
                        <tool.Icon size={ICON_SIZE} />
                      </span>
                      <span className={styles.toolName}>{tool.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
