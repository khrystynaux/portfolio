"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import BackButton from "@/components/BackButton/BackButton";
import styles from "./page.module.css";
import { wakeUpContainer, fadeUp } from "@/lib/animation";

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as [number, number, number, number], delay },
});

const insightItems = [
  { label: "Synthesis", desc: "turning raw, messy input into structured insight." },
  { label: "Design Solutions", desc: "producing and pressure-testing design variations rigorously." },
  { label: "Scalability", desc: "scope features against the roadmap, making sure the future scalability is taken into account." },
  { label: "Documentation", desc: "organizing handoffs and keeping decisions alive, so the next feature starts smarter." },
];

const phases = [
  {
    num: "01",
    title: "The Knowledge Base",
    body: "Before any design work, every project gets a living knowledge base: product vision, roadmap, personas, past research, design decisions and why they were made, technical constraints, naming conventions, you name it.",
    body2: "This is the essential phase that makes everything else work. When a new feature comes in, AI isn’t reasoning in a vacuum — it’s reasoning inside the product.",
  },
  {
    num: "02",
    title: "Input Synthesis",
    body: "Raw input goes in: meeting notes, stakeholder opinions, scattered feedback, requirements. AI does the organizing — grouping themes, surfacing pain points, summarizing discussions, flagging gaps. Designer still does the thinking and acting based on the output: validating with stakeholders, mapping workflows, deciding UX direction.",
    body2: null,
  },
  {
    num: "03",
    title: "Design Solutions",
    body: "Instead of one careful solution, multiple variants and solutions get drafted. A well-structured design system can speed up this step, with AI leveraging established guidelines to generate relevant solutions alongside the designer. Rough prototypes make the options tangible early, before any high-fidelity investment.",
    body2: null,
  },
  {
    num: "04",
    title: "Scalability Analysis & Structured Critique",
    body: "Every variation gets pressure-tested: gap and scalability analysis against the knowledge base, A/B testing to settle genuine uncertainty, peer review when time allows, and when it doesn’t — an AI critique against a consistent rubric: usability heuristics, accessibility, brand consistency, dev feasibility, plus pros and cons per variant.",
    body2: null,
  },
  {
    num: "05",
    title: "Validation & Loop-Back",
    body: "Documenting stakeholder validation, dev handoff, and decisions — all human-led, yet AI executed. Every decision and its rationale flows back into the knowledge base, so the next feature starts smarter than the last one.",
    body2: null,
  },
];

const outcomes = [
  "Research synthesis went from days to hours",
  "Multiple solution variations tested per sprint — instead of one",
  "Technical constraints surfaced before high-fidelity design, not after",
  "Every design reviewed against a consistent standard, even under deadline pressure",
];

export default function AiWorkflowContent() {
  return (
    <>
      <BackButton />
      <main id="main-content">

        {/* ── 01 Hero ───────────────────────────────────────────────────────── */}
        <section className={styles.hero}>
          <motion.div
            className={styles.heroContent}
            variants={wakeUpContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.span className={styles.heroPill} variants={fadeUp}>
              AI · Process Design
            </motion.span>
            <div className={styles.heroTextGroup}>
              <motion.h1 className={styles.heroTitle} variants={fadeUp}>
                Creating More Space for UX Thinking Using AI
              </motion.h1>
              <motion.div variants={fadeUp}>
                <p className={styles.heroSub}>
                  How I turned scattered AI experiments into a design methodology
                  my whole workflow now runs on.
                </p>
                <p className={styles.heroMeta} style={{ marginTop: 10 }}>process design · 2026</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── 02 Overview ───────────────────────────────────────────────────── */}
        <section className={styles.section}>
          <motion.div className={styles.container} {...inView()}>
            <p className={styles.label}>Overview</p>
            <p className={styles.sectionIntro}>
              Like most designers, starting in 2025 I was testing AI everywhere —
              synthesizing notes, generating variations, sanity-checking my own work
              at midnight. It helped. But it was frantic: no structure, no consistency,
              and no way to tell which parts actually made my work better.
              <br /><br />
              So I audited where AI genuinely added value, cut where it didn’t, and
              consolidated what remained into a multi-phase system I now use on every project.
            </p>
          </motion.div>
        </section>

        {/* ── 03 Analysis ───────────────────────────────────────────────────── */}
        <section className={styles.sectionAlt}>
          <motion.div className={styles.container} {...inView()}>
            <p className={styles.label}>Analysis</p>
            <h2 className={styles.sectionHeading}>
              Treating my own process like a UX problem.
            </h2>
            <p className={styles.bodyText}>
              I stopped randomly guessing “where can I use AI?” and started asking where my processes
              turn into bottlenecks the most. Three answers came to mind:
            </p>
            <div className={styles.insightList}>
              {insightItems.map((item, i) => (
                <div key={i} className={styles.insightItem}>
                  <span className={styles.insightNum}>0{i + 1}</span>
                  <p className={styles.insightText}>
                    <strong>{item.label}</strong> — {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className={styles.bodyText} style={{ marginTop: "2rem" }}>
              Throwing tasks for each of these design phases at AI sometimes produced quite good
              output — but sometimes it was just generic, because the AI had no idea what product
              it was truly designing for.
            </p>
          </motion.div>
        </section>

        {/* ── 04 The Problem ────────────────────────────────────────────────── */}
        <section className={styles.section}>
          <motion.div className={styles.container} {...inView()}>
            <p className={styles.label}>The Problem</p>
            <div className={styles.pullQuote}>
              <div className={styles.quoteBar} />
              <p className={styles.quoteText}>
                “AI made me faster at everything — including going in the wrong direction.”
              </p>
            </div>
          </motion.div>
        </section>

        {/* ── 05 Solution ───────────────────────────────────────────────────── */}
        <section className={styles.sectionAlt}>
          <motion.div className={styles.container} {...inView()}>
            <p className={styles.label}>Solution</p>
            <h2 className={styles.sectionHeading}>
              Designer led and AI executed.
            </h2>
            <p className={styles.bodyText}>From trial and error, a new design process has emerged.</p>
            <div className={styles.phaseStack}>
              {phases.map((phase) => (
                <motion.div key={phase.num} className={styles.phaseCard} {...inView(0.05)}>
                  <div className={styles.phaseNum}>{phase.num}</div>
                  <div className={styles.phaseBody}>
                    <h3 className={styles.phaseTitle}>{phase.title}</h3>
                    <p className={styles.phaseText}>{phase.body}</p>
                    {phase.body2 && <p className={styles.phaseText}>{phase.body2}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── 06 Outcomes ───────────────────────────────────────────────────── */}
        <section className={styles.outcomesSection}>
          <motion.div className={styles.container} {...inView()}>
            <p className={styles.label} style={{ color: "rgba(180,170,255,0.7)" }}>Outcome</p>
            <h2 className={styles.sectionHeading} style={{ color: "#f0eeff" }}>
              What changed.
            </h2>
            <div className={styles.outcomesGrid}>
              {outcomes.map((o) => (
                <div key={o} className={styles.outcomeCard}>
                  <p className={styles.outcomeText}>{o}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── 07 Reflection ─────────────────────────────────────────────────── */}
        <section className={styles.reflectionSection}>
          <motion.div className={styles.container} {...inView()}>
            <p className={styles.label}>Reflection</p>
            <div className={styles.reflectionBody}>
              <p className={styles.bodyText}>
                The most valuable thing AI gave me wasn't speed. Yes, it proved capable of handling
                the heavy lifting—and doing it well—once I invested the time to "train" it. But its
                greatest value was forcing me to take a hard look at my own design process and
                question long-held assumptions. AI is the most powerful tool we've had access to yet,
                but its true potential isn't in replacing our work—it's in knowing what to delegate,
                how to delegate it, and where human judgment still matters most.
              </p>
              <div className={styles.reflectionClosing}>
                <p className={styles.reflectionClosingText}>
                  AI isn’t replacing UX thinking. It’s creating more space for it.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Case nav ──────────────────────────────────────────────────────── */}
        <nav className={styles.caseNav} aria-label="Case study navigation">
          <div className={styles.container}>
            <div className={styles.caseNavInner}>
              <Link href="/#work" className={styles.caseNavBack}>
                ← All work
              </Link>
              <Link href="/work/ai-search" className={styles.caseNavNext}>
                <span className={styles.caseNavDir}>Next case study</span>
                <span className={styles.caseNavTitle}>Complex Search Made Easy →</span>
              </Link>
            </div>
          </div>
        </nav>

      </main>
    </>
  );
}
