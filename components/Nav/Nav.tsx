"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Nav.module.css";

const caseStudyLinks = [
  { label: "Complex Search Made Easy", href: "/work/ai-search", external: false },
  { label: "User Awareness Where It Matters the Most", href: "/work/safeeats", external: false },
];

const funLinks = [
  { label: "Stampbook", href: "https://stampbook-rho.vercel.app/", external: true },
  { label: "Where to Eat?", href: "https://where-to-eat-nu.vercel.app/", external: true },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const workRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setWorkOpen(false); };
    const onClickOutside = (e: MouseEvent) => {
      if (workRef.current && !workRef.current.contains(e.target as Node)) {
        setWorkOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  return (
    <motion.header
      className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: 0.8 }}
      role="banner"
    >
      <div className={styles.inner}>
        <a href="#hero" className={styles.logo} aria-label="Khrystyna Arnoldy — home">
          Khrystyna Arnoldy
        </a>

        <nav aria-label="Main navigation">
          <ul className={styles.links} role="list">

            {/* Work — case study dropdown */}
            <li ref={workRef} className={styles.workItem}>
              <button
                className={`${styles.link} ${styles.workBtn} ${workOpen ? styles.linkActive : ""}`}
                onClick={() => setWorkOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={workOpen}
              >
                Work
                <svg
                  className={`${styles.chevron} ${workOpen ? styles.chevronOpen : ""}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 4.5L6 8.5L10 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <AnimatePresence>
                {workOpen && (
                  <motion.ul
                    className={styles.dropdown}
                    role="menu"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
                  >
                    <li role="none" className={styles.dropdownLabel}>UX Case Studies</li>
                    {caseStudyLinks.map((cs) => (
                      <li key={cs.href} role="none">
                        <a
                          href={cs.href}
                          className={styles.dropdownItem}
                          role="menuitem"
                          onClick={() => setWorkOpen(false)}
                        >
                          {cs.label}
                        </a>
                      </li>
                    ))}
                    <li role="none" className={styles.dropdownDivider} aria-hidden="true" />
                    <li role="none" className={styles.dropdownLabel}>Built for Fun</li>
                    {funLinks.map((fl) => (
                      <li key={fl.href} role="none">
                        <a
                          href={fl.href}
                          className={styles.dropdownItem}
                          role="menuitem"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setWorkOpen(false)}
                        >
                          {fl.label}
                        </a>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>

            <li>
              <a href="#about" className={styles.link}>About</a>
            </li>

            <li>
              <a
                href="/resume.pdf"
                className={styles.link}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Resume
              </a>
            </li>

          </ul>
        </nav>
      </div>
    </motion.header>
  );
}
