/**
 * 1 = full day, 0 = full night. Eased toward the store's time of day by the lighting rig and
 * read every frame by everything that changes with it (sky, sun, lamps, fog, bloom).
 */
export const daylight = { value: 1, target: 1 };

/** Post effects that also follow the time of day; registered by the scene */
export const scenery: { bloom: import("postprocessing").BloomEffect | null } = { bloom: null };

/** Deterministic random so the park is laid out the same on every load */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Night between 7pm and 6am on the visitor's own clock */
export function localTimeOfDay(): "day" | "night" {
  const h = new Date().getHours();
  return h >= 19 || h < 6 ? "night" : "day";
}
