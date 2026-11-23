"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import BackButton from "@/components/BackButton/BackButton";
import PageHero from "@/components/PageHero/PageHero";
import Footer from "@/components/Footer/Footer";
import { tools, categories } from "@/lib/tools";
import { recommendations } from "@/lib/recommendations";
import { vendingRows } from "@/lib/vendingItems";
import styles from "./page.module.css";

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as [number, number, number, number], delay },
});

const carton = vendingRows.flat().find((i) => i.id === "about")!;

export default function AboutContent() {
  return (
    <>
      <BackButton />
      <main id="main-content">
        <PageHero
          pill="About Me"
          title="Hi, I’m Khrystyna."
          sub="Senior product designer and a humble traveler from Ukraine."
          color={carton.color}
          ink="#2f2a26"
        />

        {/* ── Story ─────────────────────────────────────────────────────────── */}
        <section className={styles.section} aria-labelledby="story-heading">
          <div className={`${styles.container} ${styles.story}`}>
            <motion.div className={styles.photo} {...inView()}>
              <Image
                src="/images/about-photo.jpg"
                alt="Khrystyna looking out over a lake toward misty mountains"
                fill
                sizes="(max-width: 768px) 100vw, 560px"
                className={styles.photoImg}
                priority
              />
            </motion.div>

            <motion.div className={styles.storyText} {...inView(0.1)}>
              <h2 id="story-heading" className={styles.label}>
                My story
              </h2>
              <p>
                For the last 4 years at TransPerfect, I have been trusted with ownership of both
                legacy and new MVP types of products, various UX initiatives for complex scalable
                features, adaptation of AI-augmented design workflows across the team, and building
                and managing design system.
              </p>
              <p>
                Outside of work you&apos;ll find me escaping into the world of video gaming and
                building intricate book nooks.
              </p>
              <a href="/resume.pdf" download className={styles.resumeBtn}>
                Download Resume
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── Toolkit ───────────────────────────────────────────────────────── */}
        <section className={`${styles.section} ${styles.tinted}`} aria-labelledby="toolkit-heading">
          <div className={styles.container}>
            <motion.div {...inView()}>
              <p className={styles.label}>Toolkit</p>
              <h2 id="toolkit-heading" className={styles.heading}>
                Tools &amp; stack
              </h2>
            </motion.div>

            <div className={styles.toolGroups}>
              {categories.map((category, i) => {
                const list = tools.filter((t) => t.category === category);
                if (!list.length) return null;
                return (
                  <motion.div key={category} className={styles.toolGroup} {...inView(i * 0.08)}>
                    <p className={styles.groupLabel}>{category}</p>
                    <ul className={styles.pills}>
                      {list.map((tool) => (
                        <li key={tool.id} className={styles.pill}>
                          <span
                            className={`${styles.icon} ${tool.iconStyle === "stroke" ? styles.stroke : styles.fill}`}
                            aria-hidden="true"
                          >
                            <tool.Icon size={18} />
                          </span>
                          {tool.name}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Kind words ────────────────────────────────────────────────────── */}
        <section className={styles.section} aria-labelledby="words-heading">
          <div className={styles.container}>
            <motion.div {...inView()}>
              <p className={styles.label}>Kind words</p>
              <h2 id="words-heading" className={styles.heading}>
                What people say about working with me
              </h2>
            </motion.div>

            <div className={styles.quotes}>
              {recommendations.map((rec, i) => (
                <motion.figure key={rec.id} className={styles.quoteCard} {...inView(i * 0.12)}>
                  <span className={styles.quoteMark} aria-hidden="true">
                    &ldquo;
                  </span>
                  <blockquote className={styles.quote}>{rec.quote}</blockquote>
                  <figcaption className={styles.attribution}>
                    <span className={styles.name}>{rec.name}</span>
                    <span className={styles.role}>{rec.title}</span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
