"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./HomeOfficeLoop.module.css";

// Ambient looping scene over a still photo — all motion is periodic (integer
// sine cycles over DURATION) so the loop is seamless at the seam (progress 0/1).
// Ported from a Claude Design piece; the original ran on a timeline-engine
// (SceneStage) that isn't available here, so the loop clock below is a plain
// rAF replacement for it.

const IMG = "/images/home-office-loop-bg.png";
const W = 1407;
const H = 768;
const TAU = Math.PI * 2;
const DURATION = 15; // seconds — matches the authored scene length

// Deterministic pseudo-random from an index (stable across renders)
function rnd(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface Mote {
  bx: number; by: number; ax: number; ay: number;
  kx: number; ky: number; ko: number;
  px: number; py: number; po: number;
  size: number; o: number;
}

const MOTES: Mote[] = Array.from({ length: 22 }, (_, i) => {
  const inShaft = i < 15;
  return {
    bx: inShaft ? 130 + rnd(i, 1) * 430 : 540 + rnd(i, 1) * 420,
    by: inShaft ? 110 + rnd(i, 2) * 560 : 540 + rnd(i, 2) * 190,
    ax: 8 + rnd(i, 3) * 26,
    ay: 10 + rnd(i, 4) * 30,
    kx: 1 + Math.floor(rnd(i, 5) * 3),
    ky: 1 + Math.floor(rnd(i, 6) * 2),
    ko: 2 + Math.floor(rnd(i, 7) * 4),
    px: rnd(i, 8) * TAU,
    py: rnd(i, 9) * TAU,
    po: rnd(i, 10) * TAU,
    // Rounded: this is the only Mote field rendered directly in JSX (width/
    // height/box-shadow), so it must be byte-identical between server and
    // client — Math.sin can differ in its last bit across JS engines, which
    // otherwise trips a hydration mismatch for no visible difference.
    size: Math.round((1.6 + rnd(i, 11) * 2.6) * 1000) / 1000,
    o: 0.22 + rnd(i, 12) * 0.4,
  };
});

interface Plant {
  x: number; y: number; w: number; h: number;
  k: number; ph: number; amp: number; org: string;
}

const PLANTS: Plant[] = [
  { x: 0,    y: 250, w: 175, h: 330, k: 2, ph: 0.4, amp: 0.50, org: "20% 100%" },
  { x: 55,   y: 590, w: 130, h: 130, k: 3, ph: 2.1, amp: 0.45, org: "30% 100%" },
  { x: 245,  y: 415, w: 100, h: 130, k: 2, ph: 1.2, amp: 0.30, org: "50% 95%" },
  { x: 950,  y: 235, w: 105, h: 115, k: 3, ph: 0.7, amp: 0.35, org: "50% 92%" },
  { x: 1115, y: 300, w: 135, h: 125, k: 2, ph: 2.8, amp: 0.30, org: "50% 92%" },
  { x: 1305, y: 360, w: 102, h: 265, k: 2, ph: 1.7, amp: 0.40, org: "60% 95%" },
  { x: 1090, y: 620, w: 317, h: 148, k: 3, ph: 0.2, amp: 0.45, org: "50% 100%" },
];

const SOFT_MASK = "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 92%)";
const CURTAIN_MASK = "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 95%)";
const CAT_MASK = "radial-gradient(ellipse 50% 50% at 50% 52%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 84%)";

// A masked copy of a region of the base image; transforms move it subtly
// over the untouched base beneath, so the "cutout" always lines back up.
function patchStyle(x: number, y: number, w: number, h: number, origin: string, mask: string): CSSProperties {
  return {
    position: "absolute",
    left: x,
    top: y,
    width: w,
    height: h,
    backgroundImage: `url("${IMG}")`,
    backgroundPosition: `${-x}px ${-y}px`,
    backgroundSize: `${W}px ${H}px`,
    transformOrigin: origin,
    WebkitMaskImage: mask,
    maskImage: mask,
    willChange: "transform",
    pointerEvents: "none",
  };
}

export default function HomeOfficeLoop() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const curtain1Ref = useRef<HTMLDivElement>(null);
  const curtain2Ref = useRef<HTMLDivElement>(null);
  const plantRefs = useRef<(HTMLDivElement | null)[]>([]);
  const catRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const moteRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Cover-fit scaling: the stage is authored at a fixed 1407x768 so every
  // background-position/-size alignment trick above stays correct; only its
  // outer transform scale responds to the container's actual size.
  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;

    const applyScale = () => {
      const { width, height } = wrap.getBoundingClientRect();
      const scale = Math.max(width / W, height / H) || 1;
      stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };

    applyScale();
    const observer = new ResizeObserver(applyScale);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = (p: number) => {
      const wind1 = Math.sin(TAU * 2 * p) * 0.7 + Math.sin(TAU * 5 * p + 1.3) * 0.3;
      const wind2 = Math.sin(TAU * 3 * p + 0.8) * 0.65 + Math.sin(TAU * 7 * p + 2.1) * 0.35;
      const shimmer = 0.5 - 0.5 * Math.cos(TAU * 3 * p);
      const breathe = Math.sin(TAU * 5 * p);
      const catScaleY = 1 + 0.016 * breathe;
      const catScaleX = 1 - 0.005 * breathe;

      if (curtain1Ref.current) {
        curtain1Ref.current.style.transform = `skewX(${wind1 * 0.55}deg) translateX(${wind1 * 3.5}px)`;
      }
      if (curtain2Ref.current) {
        curtain2Ref.current.style.transform = `skewX(${wind2 * 0.7}deg) translateX(${wind2 * 4.5}px)`;
      }
      PLANTS.forEach((pl, i) => {
        const el = plantRefs.current[i];
        if (!el) return;
        const s = Math.sin(TAU * pl.k * p + pl.ph);
        el.style.transform = `rotate(${s * pl.amp}deg)`;
      });
      if (catRef.current) {
        catRef.current.style.transform = `scale(${catScaleX}, ${catScaleY})`;
      }
      if (shimmerRef.current) {
        shimmerRef.current.style.opacity = String(shimmer * 0.55);
      }
      MOTES.forEach((m, i) => {
        const el = moteRefs.current[i];
        if (!el) return;
        const mx = m.bx + m.ax * Math.sin(TAU * m.kx * p + m.px);
        const my = m.by + m.ay * Math.sin(TAU * m.ky * p + m.py);
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(TAU * m.ko * p + m.po));
        el.style.left = `${mx}px`;
        el.style.top = `${my}px`;
        el.style.opacity = String(m.o * tw);
      });
    };

    if (reduceMotion) {
      render(0);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const elapsed = (now - start) / 1000;
      const p = (elapsed % DURATION) / DURATION;
      render(p);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapRef} className={styles.sceneWrap} aria-hidden="true">
      <div ref={stageRef} className={styles.stage}>
        <img src={IMG} alt="" className={styles.base} />

        {/* Curtains — skew from the rod, soft feathered patches */}
        <div ref={curtain1Ref} style={patchStyle(30, 0, 175, 700, "50% 0%", CURTAIN_MASK)} />
        <div ref={curtain2Ref} style={patchStyle(335, 0, 140, 650, "50% 0%", CURTAIN_MASK)} />

        {/* Plants — tiny rotations from their base */}
        {PLANTS.map((pl, i) => (
          <div
            key={i}
            ref={(el) => { plantRefs.current[i] = el; }}
            style={patchStyle(pl.x, pl.y, pl.w, pl.h, pl.org, SOFT_MASK)}
          />
        ))}

        {/* Cat — breathing rise and fall from the belly */}
        <div ref={catRef} style={patchStyle(390, 598, 225, 150, "50% 88%", CAT_MASK)} />

        {/* Sunlight shimmer — warm glow near the window + shaft on the floor */}
        <div
          ref={shimmerRef}
          className={styles.shimmer}
          style={{
            background:
              "radial-gradient(ellipse 30% 45% at 17% 35%, rgba(255,235,190,0.9), rgba(255,235,190,0) 70%), linear-gradient(115deg, rgba(255,240,205,0) 30%, rgba(255,240,205,0.55) 46%, rgba(255,240,205,0) 62%)",
          }}
        />

        {/* Dust motes drifting in the light */}
        {MOTES.map((m, i) => (
          <div
            key={i}
            ref={(el) => { moteRefs.current[i] = el; }}
            className={styles.mote}
            style={{
              width: m.size,
              height: m.size,
              boxShadow: `0 0 ${m.size * 2}px rgba(255,244,210,0.8)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
