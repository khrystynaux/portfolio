"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, wakeUpContainer } from "@/lib/animation";
import styles from "./About.module.css";

export default function About() {
  return (
    <section id="about" className={styles.section} aria-label="About me">
      <div className={styles.inner}>
        <div className={styles.card}>

          {/* ── Photo ── */}
          <motion.div
            className={styles.imageWrapper}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0, 0, 0.2, 1] }}
          >
            <Image
              src="/images/about-photo.jpg"
              alt="Khrystyna looking out over a lake toward misty mountains"
              fill
              className={styles.illustration}
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </motion.div>

          {/* ── Text content ── */}
          <motion.div
            className={styles.content}
            variants={wakeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 variants={fadeUp} className={styles.heading}>
              About Me
            </motion.h2>

            <motion.div variants={fadeUp} className={styles.bio}>
              <p>
                I&apos;m a senior product designer and a humble traveler from Ukraine.
              </p>
              <p>
                For the last 4 years at TransPerfect, I have been trusted with ownership
                of both legacy and new MVP types of products, various UX initiatives for
                complex scalable features, adaptation of AI-augmented design workflows
                across the team, and building and managing design system.
              </p>
              <p>
                Outside of work you&apos;ll find me escaping into the world of video gaming
                and building intricate book nooks.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <a
                href="/resume.pdf"
                download
                className={styles.resumeBtn}
                aria-label="Download resume PDF"
              >
                Download Resume
              </a>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
