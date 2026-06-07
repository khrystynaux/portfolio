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

export default function AiSearchContent() {
  return (
    <>
      <BackButton />
      <main id="main-content">

        {/* ── 01 Hero ───────────────────────────────────────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.heroCover}>
            <Image
              src="/images/ai-search/hero.png"
              alt="Magnifying glass in an autumn forest — AI Search case study"
              fill
              className={styles.heroImg}
              priority
            />
          </div>
          <div className={styles.heroOverlay} />
          <motion.div
            className={styles.heroContent}
            variants={wakeUpContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 className={styles.heroTitle} variants={fadeUp}>
              Complex Search Made Easy
            </motion.h1>
            <motion.div className={styles.heroSubGroup} variants={fadeUp}>
              <p className={styles.heroSub}>
                A redesign of a classic query builder — enhanced with AI — to
                make complex data searches accessible to everyone.
              </p>
              <p className={styles.heroMeta}>case study completed in 2024</p>
            </motion.div>
          </motion.div>
        </section>

        {/* ── 02 Overview + Stats ───────────────────────────────────────────── */}
        <section className={styles.section}>
          <motion.div className={styles.container} {...inView()}>

            <div className={styles.problemBlock}>
              <p className={styles.label}>The Problem</p>
              <div className={styles.pullQuote}>
                <div className={styles.quoteBar} />
                <p className={styles.quoteText}>
                  "Non-technical users need a simplified way to perform complex
                  searches, to ensure the most accurate results."
                </p>
              </div>
            </div>

            <h2 className={styles.sectionHeading}>Search <em>habits.</em></h2>

            <div className={styles.narrative}>

              <div className={styles.narrativeBlock}>
                <div className={styles.narrativeAnnotation}>
                  <p className={styles.narrativeP}>
                    Searching and filtering is second nature in consumer apps.
                  </p>
                </div>
                <div className={styles.benchmarkRow}>
                  <figure className={styles.benchFigure}>
                    <div className={`${styles.benchImgWrap} ${styles.benchConsumer}`}>
                      <Image
                        src="/images/ai-search/ikea.png"
                        alt="Ikea filter panel"
                        fill
                        className={styles.benchImgCover}
                      />
                    </div>
                    <figcaption className={styles.caption}>Ikea</figcaption>
                  </figure>
                  <figure className={styles.benchFigure}>
                    <div className={`${styles.benchImgWrap} ${styles.benchConsumer}`}>
                      <Image
                        src="/images/ai-search/carvana.png"
                        alt="Carvana filter panel"
                        fill
                        className={styles.benchImgCover}
                      />
                    </div>
                    <figcaption className={styles.caption}>Carvana</figcaption>
                  </figure>
                </div>
              </div>

              <div className={styles.narrativeBlock}>
                <p className={styles.narrativeP}>
                  But enterprise query builders require understanding of boolean
                  logic, operators, and data relationships. For non-technical
                  staff, that&apos;s a wall.
                </p>
                <div className={styles.benchmarkRow}>
                  <figure className={styles.benchFigure}>
                    <div className={`${styles.benchImgWrap} ${styles.benchEnt}`}>
                      <Image
                        src="/images/ai-search/devops.png"
                        alt="Azure DevOps query interface"
                        fill
                        className={styles.benchImg}
                      />
                    </div>
                    <figcaption className={styles.caption}>DevOps</figcaption>
                  </figure>
                  <figure className={styles.benchFigure}>
                    <div className={`${styles.benchImgWrap} ${styles.benchEnt}`}>
                      <Image
                        src="/images/ai-search/github.png"
                        alt="GitHub search interface"
                        fill
                        className={styles.benchImg}
                      />
                    </div>
                    <figcaption className={styles.caption}>GitHub</figcaption>
                  </figure>
                </div>
              </div>

              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>29%</span>
                  <p className={styles.statLabel}>
                    of users found traditional query builders challenging without
                    training
                  </p>
                  <span className={styles.statSource}>Datapine</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>25%</span>
                  <p className={styles.statLabel}>
                    of businesses needed extra training for complex data tools
                  </p>
                  <span className={styles.statSource}>Modern BI</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>42%</span>
                  <p className={styles.statLabel}>
                    of analysts believe organizations underutilize data due to
                    tool complexity
                  </p>
                  <span className={styles.statSource}>Prisma</span>
                </div>
              </div>

            </div>

          </motion.div>
        </section>

        {/* ── 03 Goals ─────────────────────────────────────────────────────── */}
        <section className={styles.goalsSection}>
          <motion.div className={styles.container} {...inView()}>
            <p className={`${styles.label} ${styles.labelLight}`}>Goals</p>
            <div className={styles.goalGrid}>
              <div className={styles.goalCard}>
                <h2 className={styles.goalHeading}>Intuitive design</h2>
                <p className={styles.goalBody}>
                  Simplify query-building through more intuitive visual
                  interfaces — accessible to both technical and non-technical
                  users via AI integration.
                </p>
              </div>
              <div className={styles.goalCard}>
                <h2 className={styles.goalHeading}>Efficient tool</h2>
                <p className={styles.goalBody}>
                  Enhance productivity through faster, more accurate data
                  queries. Reduce the learning curve via in-context guidance
                  and help content.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── 04 Entry Point ───────────────────────────────────────────────── */}
        <section className={styles.section}>
          <motion.div className={styles.container} {...inView()}>
            <p className={styles.label}>The Solution</p>
            <h2 className={styles.sectionHeading}>
              Two paths in, <em>one outcome.</em>
            </h2>

            <div className={styles.featureRow}>
              <div className={styles.featureScreen}>
                <Image
                  src="/images/ai-search/frame-87.jpg"
                  alt="Advanced Search modal — Search Manually or Search with AI"
                  fill
                  className={styles.featureImg}
                />
              </div>
              <div className={styles.featureAnnotation}>
                <p>
                  Instead of forcing all users through the same complex query
                  interface, the redesign opens with a clear choice: build the
                  search yourself, or describe it in plain language and let AI
                  handle the logic.
                </p>
                <p>
                  This split accommodates power users who want precise control
                  and non-technical staff who just want results — without
                  compromising either experience.
                </p>
              </div>
            </div>

            <div className={styles.dbRow}>
              <div className={styles.dbAnnotation}>
                <p className={styles.label}>The Data Layer</p>
                <h3 className={styles.featureHeading}>
                  A real database,
                  <br />not a search bar
                </h3>
                <p>
                  To showcase capabilities of this initiative, let&apos;s look at
                  this feature within a simple animal shelter database.
                </p>
              </div>
              <div className={styles.dbScreen}>
                <Image
                  src="/images/ai-search/img-4.png"
                  alt="Pets Database — structured table with multiple columns"
                  width={1734}
                  height={280}
                  className={styles.wideImg}
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── 05 Manual Search ─────────────────────────────────────────────── */}
        <section className={`${styles.section} ${styles.sectionDivider}`}>
          <motion.div className={styles.container} {...inView()}>
            <p className={styles.label}>Manual Search</p>
            <h2 className={styles.sectionHeading}>
              Guided logic, <em>step by step.</em>
            </h2>

            <div className={styles.walkthroughStack}>

              <div className={styles.walkStep}>
                <div className={styles.walkAnnotation}>
                  <span className={styles.stepNum}>01</span>
                  <h3 className={styles.featureHeading}>Start with everything</h3>
                  <p>
                    The panel opens showing the full record count — 100 total.
                    Placeholder text guides users on what criteria to filter by,
                    before a single selection is made. No blank-slate anxiety.
                  </p>
                </div>
                <div className={styles.walkScreen}>
                  <Image
                    src="/images/ai-search/frame-144.png"
                    alt="Empty search state — 100 total records, placeholder text"
                    fill
                    className={styles.walkImg}
                  />
                </div>
              </div>

              <div className={styles.walkStep}>
                <div className={styles.walkAnnotation}>
                  <span className={styles.stepNum}>02</span>
                  <h3 className={styles.featureHeading}>Live result feedback</h3>
                  <p>
                    Each filter narrows the count in real time — 41 results for
                    "Species: Cat". Users always know how broad or narrow their
                    search is before running it, and can course-correct at any
                    point.
                  </p>
                </div>
                <div className={`${styles.walkScreen} ${styles.walkScreenShort}`}>
                  <Image
                    src="/images/ai-search/results.png"
                    alt="One filter applied — Species: Cat, 41 results"
                    fill
                    className={styles.walkImg}
                  />
                </div>
              </div>

              <div className={styles.walkStep}>
                <div className={styles.walkAnnotation}>
                  <span className={styles.stepNum}>03</span>
                  <h3 className={styles.featureHeading}>Groups and boolean logic</h3>
                  <p>
                    For conditions like "Cat — if female must be neutered" —
                    filters can be grouped. AND/OR connectors are visual and
                    togglable, making logical relationships explicit without
                    SQL knowledge.
                  </p>
                </div>
                <div className={`${styles.walkScreen} ${styles.walkScreenTall}`}>
                  <Image
                    src="/images/ai-search/frame-157.png"
                    alt="Complex grouped query — AND/OR logic, 21 results"
                    fill
                    className={styles.walkImg}
                  />
                </div>
              </div>

            </div>
          </motion.div>
        </section>

        {/* ── 06 Help callout ──────────────────────────────────────────────── */}
        <section className={styles.helpSection}>
          <motion.div className={styles.container} {...inView()}>
            <div className={styles.helpRow}>
              <div className={styles.helpAnnotation}>
                <p className={styles.label}>Supporting Feature</p>
                <h3 className={styles.featureHeading}>
                  Help when
                  <br />you need it
                </h3>
                <p>
                  A persistent help icon opens contextual guidance — explaining
                  Is/Is Not logic and AND/OR combinations in plain language.
                  Designed for users learning while using, not after reading a
                  manual.
                </p>
              </div>
              <div className={styles.helpScreen}>
                <Image
                  src="/images/ai-search/help.png"
                  alt="Help panel explaining Is/Is Not and AND/OR logic"
                  width={756}
                  height={382}
                  className={styles.featureImg}
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── 07 AI Search ─────────────────────────────────────────────────── */}
        <section className={styles.section}>
          <motion.div className={styles.container} {...inView()}>
            <p className={styles.label}>AI Search</p>
            <h2 className={styles.sectionHeading}>
              Just say what <em>you&apos;re looking for.</em>
            </h2>
            <p className={styles.sectionIntro}>
              For users who don&apos;t want to think in fields and operators —
              AI search accepts natural language. Describe the record you need,
              and the system builds the query.
            </p>

            <div className={styles.walkthroughStack}>

              <div className={styles.walkStep}>
                <div className={styles.walkAnnotation}>
                  <span className={styles.stepNum}>01</span>
                  <h3 className={styles.featureHeading}>Natural language input</h3>
                  <p>
                    Users describe what they&apos;re searching for in plain text.
                    Recent searches appear as clickable chips — so repeat
                    lookups are one tap, not a re-typed sentence.
                  </p>
                </div>
                <div className={`${styles.walkScreen} ${styles.walkScreenMid}`}>
                  <Image
                    src="/images/ai-search/recent-searches.png"
                    alt="AI search input with recent search history chips"
                    fill
                    className={styles.walkImg}
                  />
                </div>
              </div>

              <div className={styles.walkStep}>
                <div className={styles.walkAnnotation}>
                  <span className={styles.stepNum}>02</span>
                  <h3 className={styles.featureHeading}>Real-time visibility</h3>
                  <p>
                    As AI processes the prompt, the query builds visibly in the
                    familiar filter UI. There&apos;s no black-box moment — users
                    follow along as each filter is constructed. Trust is built
                    through transparency.
                  </p>
                </div>
                <div className={styles.walkScreen}>
                  <Image
                    src="/images/ai-search/visibility.png"
                    alt="AI building the query in real time"
                    fill
                    className={styles.walkImg}
                  />
                </div>
              </div>

              <div className={styles.walkStep}>
                <div className={styles.walkAnnotation}>
                  <span className={styles.stepNum}>03</span>
                  <h3 className={styles.featureHeading}>Edit after generation</h3>
                  <p>
                    Once AI has built the query, users can modify it directly —
                    adjust values, add filters, change operators. AI is the
                    starting point, not a locked output. Users stay in control.
                  </p>
                </div>
                <div className={styles.walkScreen}>
                  <Image
                    src="/images/ai-search/editing.png"
                    alt="Post-generation query editing"
                    fill
                    className={styles.walkImg}
                  />
                </div>
              </div>

            </div>

            <div className={styles.demoBlock}>
              <p className={styles.label}>Quick Demo</p>
              <div className={styles.demoCard}>
                <img
                  src="/images/ai-search/ai-demo.gif"
                  alt="AI search end-to-end animated demo"
                  className={styles.demoGif}
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── 08 Next Steps ────────────────────────────────────────────────── */}
        <section className={`${styles.nextSection} ${styles.sectionDivider}`}>
          <motion.div className={styles.container} {...inView()}>
            <p className={styles.label}>Next Steps</p>
            <h2 className={styles.nextHeading}>What&apos;s Next</h2>
            <div className={styles.nextGrid}>
              <div className={styles.nextCard}>
                <h3 className={styles.nextCardHeading}>Operators flexibility</h3>
                <p>
                  Expand operators to allow multiple value inclusion per filter
                  row — reducing the number of filters needed for common
                  searches.
                </p>
              </div>
              <div className={styles.nextCard}>
                <h3 className={styles.nextCardHeading}>Empty field search</h3>
                <p>
                  Introduce the ability to search for null fields — enabling
                  users to surface records with missing data, a common
                  data-quality need.
                </p>
              </div>
              <div className={styles.nextCard}>
                <h3 className={styles.nextCardHeading}>User testing</h3>
                <p>
                  Continue iterative usability testing to validate the AI flow
                  and surface edge cases in query interpretation before wider
                  rollout.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Case nav ─────────────────────────────────────────────────────── */}
        <nav className={styles.caseNav} aria-label="Case study navigation">
          <div className={styles.container}>
            <div className={styles.caseNavInner}>
              <Link href="/#work" className={styles.caseNavBack}>
                ← All work
              </Link>
              <Link href="/work/safeeats" className={styles.caseNavNext}>
                <span className={styles.caseNavDir}>Next case study</span>
                <span className={styles.caseNavTitle}>User Awareness Where It Matters the Most →</span>
              </Link>
            </div>
          </div>
        </nav>

      </main>
    </>
  );
}
