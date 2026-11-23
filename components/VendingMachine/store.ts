import { create } from "zustand";
import { vendingRows, type VendingItem } from "@/lib/vendingItems";
import { panRange } from "./layout";

/**
 * idle      → browsing; hover lifts cartons
 * selected  → a carton is chosen, its PUSH lamp is lit
 * vending   → button pressed; the product is dropping inside the machine
 * dropped   → product sits in the take-out bay, camera has moved in on it
 * collecting→ visitor clicked the product; it flies to camera, then we leave the page
 */
export type Phase = "idle" | "selected" | "vending" | "dropped" | "collecting";

/** The two browsing views: the whole machine, or a close-up of the display window */
export type Zoom = "full" | "close";

/** Time of day for the park: lighting, sky, lamps */
export type TimeOfDay = "day" | "night";

/** First-load power-on sequence (desktop, once per session) */
export type Intro = "off" | "playing" | "done";

export const allItems = vendingRows.flat();
export const itemById = (id: string | null) => allItems.find((i) => i.id === id) ?? null;

interface VendingState {
  phase: Phase;
  hovered: string | null;
  selected: string | null;
  soundOn: boolean;
  /** performance.now() when BUY was pressed with nothing chosen — the readout says PICK ONE */
  nudgeAt: number;
  zoom: Zoom;
  time: TimeOfDay;
  /** Night assets download lazily, on first use */
  nightUsed: boolean;
  /** Camera height while zoomed in, moved by scrolling */
  panY: number;
  intro: Intro;
  /** Every asset loaded and every shader compiled — the intro may start */
  sceneReady: boolean;
  /** First-visit help labels (desktop) / help sheet (phones) */
  help: boolean;
  /** performance.now() when the intro finished — the camera eases out slower right after */
  introEndedAt: number;
  /** performance.now() when the current phase began — drives scripted animations */
  phaseStart: number;

  hover: (id: string | null) => void;
  select: (id: string) => void;
  cancel: () => void;
  release: () => void;
  land: () => void;
  collect: () => void;
  reset: () => void;
  setSound: (on: boolean) => void;
  nudge: () => void;
  setZoom: (zoom: Zoom) => void;
  setTime: (time: TimeOfDay) => void;
  /** Scroll while zoomed in: move the view by `dy` metres, clamped to the machine */
  pan: (dy: number) => void;
  setIntro: (intro: Intro) => void;
  setSceneReady: (ready: boolean) => void;
  setHelp: (help: boolean) => void;
}

const now = () => performance.now();

export const useVending = create<VendingState>((set, get) => ({
  phase: "idle",
  hovered: null,
  selected: null,
  soundOn: true,
  nudgeAt: 0,
  zoom: "full",
  time: "day",
  nightUsed: false,
  panY: panRange.max,
  intro: "off",
  sceneReady: false,
  help: false,
  introEndedAt: 0,
  phaseStart: 0,

  hover: (id) => {
    const { phase, intro } = get();
    if (intro === "playing") return;
    if (phase === "idle" || phase === "selected") set({ hovered: id });
  },
  select: (id) => {
    const { phase, selected, intro } = get();
    if (intro === "playing") return;
    if (phase !== "idle" && phase !== "selected") return;
    // Choosing the lit carton again is the same as pressing its button
    if (phase === "selected" && selected === id) return get().release();
    set({ phase: "selected", selected: id, phaseStart: now() });
  },
  cancel: () => {
    if (get().phase === "selected") set({ phase: "idle", selected: null, phaseStart: now() });
  },
  release: () => {
    if (get().phase === "selected") set({ phase: "vending", hovered: null, phaseStart: now() });
  },
  land: () => {
    if (get().phase === "vending") set({ phase: "dropped", phaseStart: now() });
  },
  collect: () => {
    if (get().phase === "dropped") set({ phase: "collecting", phaseStart: now() });
  },
  reset: () => set({ phase: "idle", hovered: null, selected: null, phaseStart: now() }),
  setSound: (on) => set({ soundOn: on }),
  nudge: () => set({ nudgeAt: now() }),
  // Every zoom-in starts anchored at the top, header sign in view
  setZoom: (zoom) => set(zoom === get().zoom ? {} : { zoom, panY: panRange.max }),
  setTime: (time) => set({ time, nightUsed: get().nightUsed || time === "night" }),
  pan: (dy) => {
    if (get().zoom !== "close") return;
    const panY = Math.min(panRange.max, Math.max(panRange.min, get().panY + dy));
    if (panY !== get().panY) set({ panY });
  },
  setHelp: (help) => set({ help }),
  setSceneReady: (sceneReady) => set({ sceneReady }),
  setIntro: (intro) => set(intro === "done" ? { intro, introEndedAt: now() } : { intro }),
}));

export type { VendingItem };
