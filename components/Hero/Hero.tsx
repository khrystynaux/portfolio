"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animation";
import styles from "./Hero.module.css";

const item = fadeUp;

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.72,
    },
  },
};

export default function Hero() {
  return (
    <section id="hero" className={styles.hero} aria-label="Introduction">

      <motion.div
        className={styles.imageWrapper}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
      >
        <img
          src="/images/hero-bg.png"
          alt="A cozy home office with warm light, botanical prints, a wooden desk with a monitor, and an orange tabby cat sleeping on the floor"
          className={styles.bgImage}
          draggable={false}
        />
      </motion.div>

      <motion.div
        className={styles.nameplate}
        variants={container}
        initial="hidden"
        animate="visible"
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
