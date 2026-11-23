"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MACHINE_HREF } from "@/lib/routes";
import styles from "./BackButton.module.css";

/** Always-visible way out of a content page, pinned top-left from the first frame */
export default function BackButton() {
  return (
    <motion.div
      className={styles.wrap}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: 0.15, ease: [0, 0, 0.2, 1] }}
    >
      <Link href={MACHINE_HREF} className={styles.btn} aria-label="Back to the vending machine">
        <span className={styles.arrow}>←</span>
        <span className={styles.label}>Go Back</span>
      </Link>
    </motion.div>
  );
}
