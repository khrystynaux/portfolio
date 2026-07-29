"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { HERO_LOCATIONS } from "./locations";
import styles from "./Hero.module.css";

export default function HeroBackground() {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMobile = () => setIsMobile(mobileQuery.matches);
    const updateMotion = () => setReduceMotion(motionQuery.matches);

    updateMobile();
    updateMotion();
    mobileQuery.addEventListener("change", updateMobile);
    motionQuery.addEventListener("change", updateMotion);
    return () => {
      mobileQuery.removeEventListener("change", updateMobile);
      motionQuery.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    // Changing the `src` attribute alone doesn't make a browser pick up the
    // new source on an already-mounted <video> — it needs an explicit load()
    // before play() will actually play the new file (matters when isMobile
    // flips without a location/key change, e.g. resizing across the breakpoint).
    const el = videoRef.current;
    if (!el) return;
    el.load();
    el.play().catch(() => {});
  }, [index, isMobile]);

  const location = HERO_LOCATIONS[index];
  const nextLocation = HERO_LOCATIONS[(index + 1) % HERO_LOCATIONS.length];
  const src = isMobile ? location.videoMobile : location.video;

  const goNext = () => setIndex((i) => (i + 1) % HERO_LOCATIONS.length);

  return (
    <div className={styles.background}>
      <AnimatePresence>
        <motion.div
          key={location.id}
          className={styles.videoLayer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        >
          {reduceMotion ? (
            <Image
              src={location.poster}
              alt=""
              fill
              priority
              className={styles.media}
            />
          ) : (
            <video
              ref={videoRef}
              className={styles.media}
              src={src}
              poster={location.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          )}
        </motion.div>
      </AnimatePresence>

      <span className={styles.srOnly}>{location.alt}</span>

      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.locationControl}>
        <div className={styles.locationLabel}>
          <span className={styles.locationName}>{location.label}</span>
          <span className={styles.locationYear}>{location.year}</span>
        </div>
        <button
          type="button"
          className={styles.locationArrow}
          onClick={goNext}
          aria-label={`Show next location: ${nextLocation.label}`}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
