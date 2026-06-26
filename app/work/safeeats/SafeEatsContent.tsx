"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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

export default function SafeEatsContent() {
  return (
    <>
      <BackButton />
      <main id="main-content">

        {/* ── 01 Hero ───────────────────────────────────────────────────────── */}
        <section className={styles.hero}>
          <motion.div
            className={styles.heroNameplate}
            variants={wakeUpContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.span className={styles.heroPill} variants={fadeUp}>
              Consumer · User Research
            </motion.span>
            <div className={styles.heroContent}>
              <motion.h1 className={styles.heroTitle} variants={fadeUp}>
                User Awareness Where It Matters the Most
              </motion.h1>
              <motion.p className={styles.heroSub} variants={fadeUp}>
                A responsive food recall platform built on user research and
                iterative testing.
              </motion.p>
              <motion.p className={styles.heroMeta} variants={fadeUp}>
                case study completed in 2024
              </motion.p>
            </div>
          </motion.div>
        </section>

        {/* ── 02 Summary ────────────────────────────────────────────────────── */}
        <section className={styles.sectionDefault}>
          <motion.div className={styles.container} {...inView()}>
            <div className={styles.sectionInner}>
              <p className={styles.label}>SUMMARY</p>
              <div className={styles.metaRow}>
                <div className={styles.metaCard}>
                  <span className={styles.metaLabel}>ROLE</span>
                  <span className={styles.metaValue}>UX Designer &amp; Researcher</span>
                </div>
                <div className={styles.metaCard}>
                  <span className={styles.metaLabel}>TIMELINE</span>
                  <span className={styles.metaValue}>2 Weeks</span>
                </div>
              </div>
              <p className={styles.bodyText}>
                <strong>SafeEats</strong> is a responsive web platform making
                food safety information accessible and actionable. I led the
                end-to-end design process — from competitive analysis and user
                research to prototyping and usability testing — creating a tool
                where anyone can quickly find and respond to food recalls.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ── 03 Research ───────────────────────────────────────────────────── */}
        <section className={`${styles.sectionAlt} ${styles.sectionDivider}`}>
          <motion.div className={styles.container} {...inView()}>
            <div className={styles.sectionInner}>
              <p className={styles.label}>RESEARCH</p>
              <p className={styles.introText}>
                I analyzed three major food recall platforms to identify gaps
                and opportunities. Government sites dominated the space, but
                user experience was largely overlooked.
              </p>
              <div className={styles.findingRow}>
                <div className={styles.findingCard}>
                  <span className={styles.findingLabel}>KEY FINDING</span>
                  <p className={styles.findingText}>
                    All 3 platforms lacked mobile-friendly design, with dense
                    text and no clear call-to-action for affected consumers.
                  </p>
                </div>
                <div className={styles.findingCard}>
                  <span className={styles.findingLabel}>OPPORTUNITY</span>
                  <p className={styles.findingText}>
                    A clean, searchable interface with personalized alerts could
                    dramatically improve recall awareness and response rate.
                  </p>
                </div>
              </div>
              <div className={styles.cmaRow}>
                <figure className={styles.cmaFigure}>
                  <div className={styles.cmaImgWrap}>
                    <Image
                      src="/images/safeeats/cma-usda.png"
                      alt="USDA website screenshot"
                      width={494}
                      height={892}
                      className={styles.cmaImg}
                    />
                  </div>
                  <figcaption className={styles.caption}>USDA</figcaption>
                </figure>
                <figure className={styles.cmaFigure}>
                  <div className={styles.cmaImgWrap}>
                    <Image
                      src="/images/safeeats/cma-usda-app.png"
                      alt="USDA Mobile App screenshot"
                      width={1170}
                      height={2532}
                      className={styles.cmaImg}
                    />
                  </div>
                  <figcaption className={styles.caption}>USDA Mobile App</figcaption>
                </figure>
                <figure className={styles.cmaFigure}>
                  <div className={styles.cmaImgWrap}>
                    <Image
                      src="/images/safeeats/cma-fda.png"
                      alt="FDA website screenshot"
                      width={562}
                      height={906}
                      className={styles.cmaImg}
                    />
                  </div>
                  <figcaption className={styles.caption}>FDA</figcaption>
                </figure>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>27%</span>
                  <p className={styles.statLabel}>
                    of 1,022 surveyed Americans expressed that having more
                    information during a food recall would increase their
                    confidence in the safety of the food supply.
                  </p>
                  <span className={styles.statSource}>Food Insight</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>1 in 3</span>
                  <p className={styles.statLabel}>
                    respondents of Australian survey were unaware of recent food
                    recalls.
                  </p>
                  <span className={styles.statSource}>Choice</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── 04 User Research ──────────────────────────────────────────────── */}
        <section className={`${styles.sectionDefault} ${styles.sectionDivider}`}>
          <motion.div className={styles.container} {...inView()}>
            <div className={styles.sectionInner}>
              <p className={styles.label}>USER RESEARCH</p>
              <h2 className={styles.sectionHeading40}>
                Hearing from <em>real users.</em>
              </h2>
              <p className={styles.introTextMuted}>
                Six individuals from diverse backgrounds were interviewed about
                their experience with food recall resources. Three pain points
                emerged consistently across every conversation.
              </p>

              <div className={styles.painStack}>
                <div className={styles.painCard}>
                  <p className={styles.painTitle}>Food Safety Concerns</p>
                  <p className={styles.painBody}>
                    Users rated food quality as highly important and emphasized
                    the need for accessible safety information — especially for
                    families with children or vulnerable individuals.
                  </p>
                </div>

                <div className={styles.painImgGroup}>
                  <div className={styles.painImg}>
                    <Image
                      src="/images/safeeats/pain-1.png"
                      alt="Food safety UI mockup"
                      width={1666}
                      height={581}
                      className={styles.painImgNatural}
                    />
                  </div>
                  <div className={styles.painCard}>
                    <p className={styles.painTitle}>
                      Lack of Accessible Information
                    </p>
                    <p className={styles.painBody}>
                      Most users expressed frustration with the lack of clear
                      and concise information on existing food recall websites,
                      leading to confusion and uncertainty about product safety.
                    </p>
                  </div>
                </div>

                <div className={styles.painImgGroup}>
                  <div className={styles.painImg}>
                    <Image
                      src="/images/safeeats/pain-2.png"
                      alt="Recall information UI mockup"
                      width={1666}
                      height={581}
                      className={styles.painImgNatural}
                    />
                  </div>
                  <div className={styles.painCard}>
                    <p className={styles.painTitle}>Customizable Notifications</p>
                    <p className={styles.painBody}>
                      Users emphasized the importance of receiving timely,
                      personalized notifications about food recalls relevant to
                      their location and shopping habits.
                    </p>
                  </div>
                </div>

                <div className={styles.painImg}>
                  <Image
                    src="/images/safeeats/pain-3.png"
                    alt="Notifications UI mockup"
                    width={1666}
                    height={581}
                    className={styles.painImgNatural}
                  />
                </div>
              </div>

              <div className={styles.personaRow}>
                <div className={styles.personaCard}>
                  <div className={styles.personaImgWrap}>
                    <Image
                      src="/images/safeeats/image-7.png"
                      alt="Kumal persona card — 29, Marketing Manager, San Francisco"
                      fill
                      className={styles.personaImgFit}
                    />
                  </div>
                  <p className={styles.personaCaption}>
                    Kumal — 29 · Marketing Manager, San Francisco
                  </p>
                </div>
                <div className={styles.personaCard}>
                  <div className={styles.personaImgWrap}>
                    <Image
                      src="/images/safeeats/image-8.png"
                      alt="Emily persona card — 34, School Teacher, Austin TX"
                      fill
                      className={styles.personaImgFit}
                    />
                  </div>
                  <p className={styles.personaCaption}>
                    Emily — 34 · School Teacher, Austin TX
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── 05 Problem Statement ──────────────────────────────────────────── */}
        <section className={styles.problemSection}>
          <motion.div className={styles.container} {...inView()}>
            <div className={styles.sectionInner}>
              <p className={styles.labelOnGreen}>PROBLEM STATEMENT</p>
              <p className={styles.problemText}>
                Concerned consumers need a quick access to reliable recall
                information to buy food safely.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ── 06 The Solution ───────────────────────────────────────────────── */}
        <section className={styles.sectionDefault}>
          <motion.div className={styles.container} {...inView()}>
            <div className={styles.sectionInner}>
              <p className={styles.label}>THE SOLUTION</p>
              <h2 className={styles.sectionHeading40}>
                Tested, iterated, <em>refined.</em>
              </h2>
              <p className={styles.introTextMuted}>
                Initial mockups were tested with real users and iterated based
                on collected feedback. Each design element went through multiple
                rounds of refinement before landing on the final version.
              </p>

              <div className={styles.solutionStep}>
                <h3 className={styles.stepHeading}>State Selector</h3>
                <p className={styles.stepDesc}>
                  First-time users were initially asked to input both their
                  state and favorite stores. Based on feedback, later iterations
                  streamlined this to state only — and added a skip option —
                  reducing friction at the critical first step.
                </p>
                <div className={styles.solutionImg} style={{ height: "540px" }}>
                  <Image
                    src="/images/safeeats/state-selector.png"
                    alt="State selector — Initial Design, Iterations, and Latest Version"
                    fill
                    className={styles.coverImg}
                  />
                </div>
              </div>

              <div className={styles.solutionStep}>
                <h3 className={styles.stepHeading}>Filters</h3>
                <p className={styles.stepDesc}>
                  Initial filters only covered &ldquo;Case Statuses&rdquo; and
                  &ldquo;Types of Alerts&rdquo; — users found them confusing
                  and limiting. The redesign makes recall status visible
                  upfront, and expands the full filter list to one click away.
                </p>
                <div className={styles.solutionImg} style={{ height: "742px" }}>
                  <Image
                    src="/images/safeeats/filters.png"
                    alt="Filter panel — Initial Design vs Latest Version"
                    fill
                    className={styles.coverImg}
                  />
                </div>
              </div>

              <div className={styles.solutionStep}>
                <h3 className={styles.stepHeading}>Recall Detail Page</h3>
                <p className={styles.stepDesc}>
                  The recall detail page gained key improvements: Recall Status
                  and Risk Level are now combined into one tag, a list of stores
                  selling the recalled product was added, and links to official
                  sources appear on every page.
                </p>
                <div className={styles.solutionImg} style={{ height: "759px" }}>
                  <Image
                    src="/images/safeeats/recall-page.png"
                    alt="Food recall detail page — iterations from initial to latest"
                    fill
                    className={styles.coverImg}
                  />
                </div>
              </div>

              <div className={styles.solutionStep}>
                <h3 className={styles.stepHeading}>Share Button &amp; Links</h3>
                <p className={styles.stepDesc}>
                  Originally grouped at the page bottom, the Share button was
                  hard to find. It moved to the sticky header for constant
                  visibility. The source link relocated to the bottom as a
                  natural extension of product details.
                </p>
                <div className={styles.solutionImg} style={{ height: "725px" }}>
                  <Image
                    src="/images/safeeats/recall-page-2.png"
                    alt="Share button and source link — iterations"
                    fill
                    className={styles.coverImg}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── 07 Responsive Design ──────────────────────────────────────────── */}
        <section className={`${styles.sectionAlt} ${styles.sectionDivider}`}>
          <motion.div className={styles.container} {...inView()}>
            <div className={styles.sectionInner}>
              <p className={styles.label}>RESPONSIVE DESIGN</p>
              <h2 className={styles.sectionHeading40}>Built for <em>Every Screen</em></h2>
              <p className={styles.introTextMuted}>
                SafeEats was designed mobile-first, ensuring the experience
                works seamlessly across all devices.
              </p>
              <div className={styles.deviceRow}>
                <div className={styles.deviceDesktopWrap}>
                  <div className={styles.deviceDesktop}>
                    <Image
                      src="/images/safeeats/desktop-mockup.png"
                      alt="SafeEats desktop view"
                      fill
                      className={styles.coverImg}
                    />
                  </div>
                  <p className={styles.deviceLabel}>Desktop</p>
                </div>
                <div className={styles.deviceMobileWrap}>
                  <div className={styles.deviceMobile}>
                    <Image
                      src="/images/safeeats/mobile-mockup.png"
                      alt="SafeEats mobile view"
                      fill
                      className={styles.coverImg}
                    />
                  </div>
                  <p className={styles.deviceLabel}>Mobile</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── 08 Usability Testing ──────────────────────────────────────────── */}
        <section className={`${styles.sectionDefault} ${styles.sectionDivider}`}>
          <motion.div className={styles.container} {...inView()}>
            <div className={styles.sectionInner}>
              <p className={styles.label}>USABILITY TESTING</p>
              <h2 className={styles.sectionHeading40}>
                Testing with <em>Real Users</em>
              </h2>
              <p className={styles.introTextMuted}>
                After multiple rounds of iterations, eight users tested the
                interactive prototype and answered questions about navigation,
                filtering, and overall experience.
              </p>

              <div className={styles.testingBlock}>
                <div className={styles.testingCard}>
                  <p className={styles.testingLabel}>Navigation and Usability</p>
                  <p className={styles.testingText}>
                    Most users found the website straightforward and appreciated
                    clear navigation with no clutter. A few minor issues
                    surfaced — expecting the logo to navigate home, and some
                    confusion between &ldquo;Home&rdquo; and &ldquo;Search More
                    Recalls&rdquo;.
                  </p>
                </div>
                <div
                  className={styles.testingImg}
                  style={{ height: "539px" }}
                >
                  <Image
                    src="/images/safeeats/usability-1.png"
                    alt="Navigation and usability testing results"
                    fill
                    className={styles.coverImg}
                  />
                </div>
              </div>

              <div className={styles.testingBlock}>
                <div className={styles.testingCard}>
                  <p className={styles.testingLabel}>Filter Functionality</p>
                  <p className={styles.testingText}>
                    Users liked the filtering options — especially by food
                    category and store. Filters were generally easy to apply,
                    though some encountered delays in the counter updating and
                    had trouble clearing filters.
                  </p>
                </div>
                <div
                  className={styles.testingImg}
                  style={{ height: "566px" }}
                >
                  <Image
                    src="/images/safeeats/usability-2.png"
                    alt="Filter functionality testing results"
                    fill
                    className={styles.coverImg}
                  />
                </div>
              </div>

              <div className={styles.testingBlock}>
                <div className={styles.testingCard}>
                  <p className={styles.testingLabel}>Overall Experience</p>
                  <p className={styles.testingText}>
                    Users appreciated the intuitive design, clear interface, and
                    quick access to information. The shareable recall page and
                    color-coded status were highlighted. Suggestions included a
                    search bar and loading more items before requiring a refresh.
                  </p>
                </div>
                <div
                  className={styles.testingImg}
                  style={{ height: "552px" }}
                >
                  <Image
                    src="/images/safeeats/usability-3.png"
                    alt="Overall experience testing results"
                    fill
                    className={styles.coverImg}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── 09 Next Steps ─────────────────────────────────────────────────── */}
        <section className={`${styles.sectionAlt} ${styles.sectionDivider}`}>
          <motion.div className={styles.container} {...inView()}>
            <div className={styles.sectionInner}>
              <p className={styles.label}>NEXT STEPS</p>
              <h2 className={styles.sectionHeading40}>
                What&apos;s <em>Next</em>
              </h2>
              <div className={styles.nextCards}>
                <div className={styles.nextCard}>
                  <p className={styles.nextCardHeading}>Push Notifications</p>
                  <p className={styles.nextCardBody}>
                    Implement real-time alerts for new recalls matching the
                    user&apos;s saved product preferences.
                  </p>
                </div>
                <div className={styles.nextCard}>
                  <p className={styles.nextCardHeading}>Barcode Scanning</p>
                  <p className={styles.nextCardBody}>
                    Allow users to scan product barcodes to instantly check for
                    active recalls.
                  </p>
                </div>
                <div className={styles.nextCard}>
                  <p className={styles.nextCardHeading}>Accessibility Audit</p>
                  <p className={styles.nextCardBody}>
                    Conduct a full WCAG 2.1 AA audit and remediation to ensure
                    inclusive access for all users.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Case nav ──────────────────────────────────────────────────────── */}
        <nav className={styles.caseNav} aria-label="Case study navigation">
          <div className={styles.container}>
            <div className={styles.caseNavInner}>
              <Link href="/#work" className={styles.caseNavLink}>
                ← All Work
              </Link>
              <Link href="/work/ai-search" className={styles.caseNavLink}>
                Complex Search Made Easy →
              </Link>
            </div>
          </div>
        </nav>

      </main>
    </>
  );
}
