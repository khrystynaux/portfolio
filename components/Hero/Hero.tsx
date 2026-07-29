"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animation";
import HeroBackground from "./HeroBackground";
import styles from "./Hero.module.css";

const item = fadeUp;

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.3,
    },
  },
};

export default function Hero() {
  return (
    <section id="hero" className={styles.hero} aria-label="Introduction">
      <HeroBackground />

      <motion.div
        className={styles.nameplate}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.4 }}
      >
        <motion.p variants={item} className={styles.eyebrow}>
          Senior Product Designer
        </motion.p>

        <motion.h1 variants={item} className={styles.name}>
          Khrystyna <em>Arnoldy</em>
        </motion.h1>
      </motion.div>
    </section>
  );
}
