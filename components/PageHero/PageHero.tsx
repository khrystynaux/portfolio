"use client";

import { motion } from "framer-motion";
import { fadeUp, wakeUpContainer } from "@/lib/animation";
import styles from "./PageHero.module.css";

interface PageHeroProps {
  pill: string;
  title: string;
  sub: string;
  /** The carton colour, so the page opens in the colour the vending machine washed to */
  color: string;
  /** Text colour that reads on `color` */
  ink: string;
}

export default function PageHero({ pill, title, sub, color, ink }: PageHeroProps) {
  return (
    <section className={styles.hero} style={{ background: color, color: ink }}>
      <motion.div className={styles.inner} variants={wakeUpContainer} initial="hidden" animate="visible">
        <motion.span className={styles.pill} variants={fadeUp}>
          {pill}
        </motion.span>
        <motion.h1 className={styles.title} variants={fadeUp}>
          {title}
        </motion.h1>
        <motion.p className={styles.sub} variants={fadeUp}>
          {sub}
        </motion.p>
      </motion.div>
    </section>
  );
}
