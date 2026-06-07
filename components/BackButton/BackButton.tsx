"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./BackButton.module.css";

export default function BackButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.wrap}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        >
          <Link href="/#work" className={styles.btn} aria-label="Back to all work">
            <span className={styles.arrow}>←</span>
            <span className={styles.label}>Go Back</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
