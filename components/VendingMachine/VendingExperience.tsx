"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { loadFonts, readFonts, type Fonts } from "./textures";
import { allItems, itemById, useVending } from "./store";
import { sfx } from "./sound";
import { localTimeOfDay } from "./park/daylight";
import SiteMenu from "./SiteMenu";
import styles from "./VendingMachine.module.css";

const VendingScene = dynamic(() => import("./VendingScene"), { ssr: false });

const SOUND_KEY = "vending-sound";
/**
 * True until the visitor first leaves the machine. Module state survives client-side
 * navigation but resets on a real page load, so the intro and help play on every fresh
 * visit or reload and are skipped when coming back via "Go Back".
 */
const freshPageLoad = { value: true };
const MOBILE = "(max-width: 700px)";

/** Time for the carton to rise to the camera before the colour wash */
const COLLECT_MS = 850;
/** Colour wash duration before navigating */
const WASH_MS = 450;

export default function VendingExperience() {
  const router = useRouter();
  const [fonts, setFonts] = useState<Fonts | null>(null);
  // Chrome blocks a new WebGL context after a loss, so fall back to plain links instead of a dark page
  const [failed, setFailed] = useState(false);
  const [wash, setWash] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const phase = useVending((s) => s.phase);
  const selected = useVending((s) => s.selected);
  const soundOn = useVending((s) => s.soundOn);
  const zoom = useVending((s) => s.zoom);
  const intro = useVending((s) => s.intro);
  const time = useVending((s) => s.time);
  const help = useVending((s) => s.help);
  const setHelp = useVending((s) => s.setHelp);
  const browsing = phase === "idle" || phase === "selected";
  const item = itemById(selected);
  const takeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Labels are painted to canvas, so the web fonts must be ready first
    const f = readFonts();
    loadFonts(f).then(() => setFonts(f));
  }, []);

  useEffect(() => {
    // The store outlives client-side navigation: coming back from a page must start fresh,
    // not mid-"collecting" with the colour wash still up
    useVending.getState().reset();
    useVending.getState().setZoom("full");
    // Day or night follows the visitor's clock; the toggle switches it for this visit
    useVending.getState().setTime(localTimeOfDay());
    document.body.style.cursor = "";

    const fresh = freshPageLoad.value;
    const mobile = window.matchMedia(MOBILE).matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    useVending.getState().setSceneReady(false);
    useVending.getState().setIntro(fresh && !mobile && !reduced ? "playing" : "off");
    useVending.getState().setHelp(fresh);

    const mountedAt = performance.now();
    return () => {
      document.body.style.cursor = "";
      // React's dev-mode double mount unmounts within milliseconds; only a real departure
      // (navigating to a page) should mark the intro as seen
      if (performance.now() - mountedAt > 500) freshPageLoad.value = false;
    };
  }, []);

  useEffect(() => {
    try {
      // Sound is on by default; respect a visitor who switched it off before
      if (localStorage.getItem(SOUND_KEY) === "off") useVending.getState().setSound(false);
    } catch {
      // Storage unavailable (private mode) — sound simply stays off
    }
  }, []);

  // Once the carton has been lifted out: wash the screen in its colour, then leave
  useEffect(() => {
    if (phase !== "collecting" || !item) return;
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setWash(item.color), COLLECT_MS));
    timers.push(
      window.setTimeout(() => {
        if (item.action.type === "navigate") {
          router.push(item.action.href);
          return;
        }
        const a = document.createElement("a");
        a.href = item.action.href;
        a.download = item.action.filename;
        a.click();
        // Resume stays on this page: bring the machine back
        useVending.getState().reset();
        setWash(null);
      }, COLLECT_MS + WASH_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, item, router]);

  // Desktop help labels: dismissed by the first click or key press, or after a while
  useEffect(() => {
    if (!help || intro === "playing" || !ready) return;
    if (window.matchMedia(MOBILE).matches) return; // phones dismiss with "Got it"
    const dismiss = () => setHelp(false);
    const timer = window.setTimeout(dismiss, 9000);
    // Defer so the intro's own events can't dismiss it instantly
    const arm = window.setTimeout(() => {
      window.addEventListener("pointerdown", dismiss, { once: true });
      window.addEventListener("keydown", dismiss, { once: true });
    }, 400);
    return () => {
      clearTimeout(timer);
      clearTimeout(arm);
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", dismiss);
    };
  }, [help, intro, ready, setHelp]);

  // Close the phone menu on outside tap
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [menuOpen]);

  // Scroll drives the view. Full view: scrolling down zooms in. Zoomed in: scrolling moves the
  // machine through the frame and stays zoomed in. Pinching out (trackpad, or two fingers on a
  // phone) returns to the full view. The browser's own page zoom is blocked.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let zoomIntent = 0;
    let pinchIntent = 0;
    // Trackpad momentum keeps firing after a zoom; ignore it so the view doesn't lurch
    let quietUntil = 0;

    const browsingNow = () => {
      const s = useVending.getState();
      return s.intro !== "playing" && (s.phase === "idle" || s.phase === "selected");
    };
    const zoomTo = (z: "full" | "close") => {
      useVending.getState().setZoom(z);
      zoomIntent = 0;
      pinchIntent = 0;
      quietUntil = performance.now() + 550;
    };
    /** `dy` in pixels, positive = scrolling down */
    const scroll = (dy: number) => {
      if (!browsingNow() || performance.now() < quietUntil) return;
      const s = useVending.getState();
      if (s.zoom === "full") {
        zoomIntent = dy > 0 ? zoomIntent + dy : 0;
        if (zoomIntent > 40) zoomTo("close");
      } else {
        s.pan(-dy * 0.0011);
      }
    };
    /** `amount` > 0 pinches out (zoom out), < 0 pinches in (zoom in) */
    const pinch = (amount: number) => {
      if (!browsingNow() || performance.now() < quietUntil) return;
      pinchIntent = Math.sign(amount) === Math.sign(pinchIntent) ? pinchIntent + amount : amount;
      const z = useVending.getState().zoom;
      if (pinchIntent > 14 && z === "close") zoomTo("full");
      if (pinchIntent < -14 && z === "full") zoomTo("close");
    };

    // Overlay panels (site menu) scroll normally and never drive the camera
    const inUi = (e: Event) => !!(e.target as Element | null)?.closest?.("[data-ui]");
    const onWheel = (e: WheelEvent) => {
      if (inUi(e)) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      // Trackpad pinch arrives as a ctrl+wheel event
      if (e.ctrlKey || e.metaKey) pinch(e.deltaY * unit);
      else scroll(e.deltaY * unit);
    };
    const onGesture = (e: Event) => e.preventDefault(); // Safari's native pinch-zoom

    let lastY: number | null = null;
    let lastDist: number | null = null;
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches.length === 1 ? e.touches[0].clientY : null;
      lastDist = e.touches.length === 2 ? dist(e.touches) : null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (inUi(e)) return;
      if (e.touches.length === 2 && lastDist) {
        e.preventDefault();
        const d = dist(e.touches);
        pinch((lastDist - d) * 0.6);
        lastDist = d;
      } else if (e.touches.length === 1 && lastY !== null) {
        const y = e.touches[0].clientY;
        // Finger moving up = scrolling down, as on any phone
        scroll((lastY - y) * 1.8);
        lastY = y;
      }
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("gesturestart", onGesture);
    window.addEventListener("gesturechange", onGesture);
    return () => {
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("gesturestart", onGesture);
      window.removeEventListener("gesturechange", onGesture);
    };
  }, []);

  // Keyboard users land on the "take it" button as soon as the carton is presented
  useEffect(() => {
    if (phase === "dropped") takeRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useVending.getState();
      const browsingNow = s.intro !== "playing" && (s.phase === "idle" || s.phase === "selected");
      // Keyboard equivalent of scrolling, for people without a wheel or trackpad
      if (browsingNow && (e.key === "ArrowDown" || e.key === "PageDown")) {
        e.preventDefault();
        if (s.zoom === "full") s.setZoom("close");
        else s.pan(-0.12);
      }
      if (browsingNow && (e.key === "ArrowUp" || e.key === "PageUp") && s.zoom === "close") {
        e.preventDefault();
        s.pan(0.12);
      }
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      if (s.phase === "idle" && s.zoom === "close") s.setZoom("full");
      if (s.phase === "selected") s.cancel();
      if (s.phase === "dropped") s.reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    useVending.getState().setSound(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    } catch {
      // Not persisted; fine
    }
    if (next) sfx.select();
  };

  const chooseWithKeyboard = (id: string) => {
    const s = useVending.getState();
    if (s.phase === "selected" && s.selected === id) {
      sfx.press();
      s.release();
    } else {
      sfx.select();
      s.select(id);
    }
  };

  const hint =
    phase === "selected" && item
      ? "Press BUY button below to open"
      : phase === "vending"
        ? "Dispensing…"
        : phase === "dropped" && item
          ? "Click on the item to open it"
          : "";
  // Idle hints teach the scroll gestures; desktop and phone wording differ
  const idleHint =
    zoom === "full"
      ? { desktop: "Scroll to zoom in", phone: "Swipe up to zoom in" }
      : { desktop: "Scroll to move  ·  Pinch out to zoom out", phone: "Swipe to move  ·  Pinch to zoom out" };
  const introPlaying = intro === "playing";
  // Help labels wait for the camera to finish pulling back
  const showHelp = help && ready && !introPlaying && browsing;
  const toggleTime = () => useVending.getState().setTime(time === "day" ? "night" : "day");
  const toggleZoom = () => useVending.getState().setZoom(zoom === "full" ? "close" : "full");
  const hintKey = phase === "idle" ? `idle-${zoom}` : hint;

  const announcement =
    phase === "selected" && item
      ? `${item.title} selected. Press Enter again to get it.`
      : phase === "vending" && item
        ? `Dispensing ${item.title}.`
        : phase === "dropped" && item
          ? `${item.title} is in the tray. Press Enter to take it.`
          : "";

  return (
    // After the intro, controls wait for the camera's pull-back to finish before fading in:
    // fading frosted-glass controls over the moving 3D scene made the glide stutter
    <div className={styles.stage} ref={stageRef} data-after-intro={intro === "done" || undefined}>
      <h1 className={styles.srOnly}>Khrystyna Arnoldy — UX/Product Designer</h1>

      <div className={styles.canvas} aria-hidden="true">
        {fonts && !failed && (
          <VendingScene fonts={fonts} onContextLost={() => setFailed(true)} onReady={() => setReady(true)} />
        )}
      </div>

      {failed ? (
        <nav aria-label="Portfolio" className={styles.fallback}>
          <ul>
            {allItems.map((i) => (
              <li key={i.id}>
                {i.action.type === "navigate" ? (
                  <a href={i.action.href}>{i.title}</a>
                ) : (
                  <a href={i.action.href} download={i.action.filename}>
                    {i.title} (PDF)
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <>
          {/* Keyboard + screen reader controls mirroring the 3D buttons; focus lifts the carton */}
          <div className={styles.srOnly} role="group" aria-label="Vending machine">
            {allItems.map((i) => (
              <button
                key={i.id}
                type="button"
                disabled={phase !== "idle" && phase !== "selected"}
                aria-pressed={selected === i.id && phase === "selected"}
                onFocus={() => useVending.getState().hover(i.id)}
                onBlur={() => useVending.getState().hover(null)}
                onClick={() => chooseWithKeyboard(i.id)}
              >
                {i.title}
              </button>
            ))}
          </div>

          <SiteMenu hidden={introPlaying || !ready} />

          <div className={styles.hud} data-hidden={introPlaying || !ready}>
            {showHelp ? (
              <div className={styles.helpSheet} role="note">
                <p className={styles.helpTitle}>How it works</p>
                <ol className={styles.helpSteps}>
                  <li>Tap a carton to choose it</li>
                  <li>Tap the glowing BUY button</li>
                  <li>Tap your carton in the tray to open it</li>
                </ol>
                <p className={styles.helpNote}>
                  Swipe up to zoom in, pinch to zoom out. All pages are in the menu (top left); zoom, day/night and
                  sound are in settings (top right).
                </p>
                <button type="button" className={styles.helpDone} onClick={() => setHelp(false)}>
                  Got it
                </button>
              </div>
            ) : null}
            {phase === "idle" && zoom === "full" && <ScrollCue />}
            <p className={styles.hint} key={hintKey} data-help={showHelp || undefined}>
              {phase === "idle" ? (
                <>
                  <span className={styles.desktopText}>{idleHint.desktop}</span>
                  <span className={styles.phoneText}>{idleHint.phone}</span>
                </>
              ) : (
                hint
              )}
            </p>
            {phase === "dropped" && item && (
              <div className={styles.actions}>
                <button
                  ref={takeRef}
                  type="button"
                  className={styles.srOnly}
                  onClick={() => {
                    sfx.collect();
                    useVending.getState().collect();
                  }}
                >
                  Take {item.title}
                </button>
                <button type="button" className={styles.ghost} onClick={() => useVending.getState().reset()}>
                  ← Back to the machine
                </button>
              </div>
            )}
          </div>

          {/* Fallback for mice without pinch: only shown while zoomed in */}
          {browsing && zoom === "close" && (
            <div className={`${styles.zoomWrap} ${styles.desktopOnly}`} data-hidden={introPlaying || !ready}>
              <button
                type="button"
                className={styles.zoom}
                onClick={() => useVending.getState().setZoom("full")}
                aria-label="Zoom out to the whole machine"
              >
                <ZoomIcon zoomIn={false} />
                <span>Full view</span>
              </button>
            </div>
          )}

          <div className={`${styles.soundWrap} ${styles.desktopOnly}`} data-hidden={introPlaying || !ready}>
            <button
              type="button"
              className={styles.sound}

              onClick={toggleTime}
            >
              {/* Names the action and shows where it goes: moon by day, sun by night */}
              <TimeIcon day={time !== "day"} />
              <span>{time === "day" ? "Switch to Night" : "Switch to Day"}</span>
            </button>
            <button
              type="button"
              className={styles.sound}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Sound on" : "Sound off"}
              onClick={toggleSound}
            >
              <SoundIcon on={soundOn} />
              <span>{soundOn ? "Sound on" : "Sound off"}</span>
            </button>
          </div>

          {/* Phones: view and sound controls live in a menu */}
          <div className={`${styles.menu} ${styles.mobileOnly}`} ref={menuRef} data-hidden={!ready}>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={menuOpen}
              aria-controls="vending-menu"
              aria-label="View and sound settings"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MenuIcon open={menuOpen} />
            </button>
            {menuOpen && (
              <div id="vending-menu" className={styles.menuPanel}>
                {browsing && (
                  <button
                    type="button"
                    className={styles.menuItem}
                    onClick={() => {
                      toggleZoom();
                      setMenuOpen(false);
                    }}
                  >
                    <ZoomIcon zoomIn={zoom === "full"} />
                    {zoom === "full" ? "Zoom in" : "Zoom out"}
                  </button>
                )}
                <button type="button" className={styles.menuItem} onClick={toggleTime}>
                  <TimeIcon day={time !== "day"} />
                  {time === "day" ? "Switch to Night" : "Switch to Day"}
                </button>
                <button type="button" className={styles.menuItem} aria-pressed={soundOn} onClick={toggleSound}>
                  <SoundIcon on={soundOn} />
                  {soundOn ? "Sound on" : "Sound off"}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <p className={styles.srOnly} aria-live="polite">
        {announcement}
      </p>

      {/* Opening fade from black; slower when the intro plays */}
      <div className={styles.curtain} data-up={ready} data-slow={introPlaying || undefined} aria-hidden="true" />

      <div className={styles.wash} style={{ background: wash ?? "transparent", opacity: wash ? 1 : 0 }} aria-hidden="true" />
    </div>
  );
}

/** Small trackpad/mouse glyph with a dot drifting down: "scroll" */
function ScrollCue() {
  return (
    <span className={styles.scrollCue} aria-hidden="true">
      <span className={styles.scrollDot} />
    </span>
  );
}

function ZoomIcon({ zoomIn }: { zoomIn: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
      <path d="M8 11h6" />
      {zoomIn && <path d="M11 8v6" />}
    </svg>
  );
}

/** Sun or moon: the time of day the toggle switches to */
function TimeIcon({ day }: { day: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {day ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      ) : (
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      )}
    </svg>
  );
}

/** Settings (sliders) for the phone's view/sound panel; an X while it's open */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h10M18 7h2" />
          <circle cx="16" cy="7" r="2" />
          <path d="M4 17h4M12 17h8" />
          <circle cx="10" cy="17" r="2" />
        </>
      )}
    </svg>
  );
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      {on ? (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      ) : (
        <>
          <path d="m16 9 5 6" />
          <path d="m21 9-5 6" />
        </>
      )}
    </svg>
  );
}
