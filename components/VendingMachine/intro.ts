/**
 * First-load "power on" sequence: the camera starts tight on the dark header sign, the sign
 * flickers on like a fluorescent tube, the display lights follow, then the camera pulls back.
 *
 * `power` is read every frame by the lit materials and lights (0 = off, 1 = normal).
 */
export const power = { sign: 1, interior: 1 };

/** When the camera starts pulling back: the lit sign holds for ~2.5s after it settles */
export const INTRO_SECONDS = 3.9;

const smoothstep = (t: number, a: number, b: number) => {
  const x = Math.min(Math.max((t - a) / (b - a), 0), 1);
  return x * x * (3 - 2 * x);
};

/** Two stutters, a weak catch, then the tube settles on */
const FLICKER: [at: number, level: number][] = [
  [0, 0.04],
  [0.75, 1],
  [0.82, 0.08],
  [0.95, 0.9],
  [1.0, 0.05],
  [1.24, 0.55],
  [1.3, 0.15],
  [1.36, 1],
];

export function signPowerAt(t: number) {
  let level = FLICKER[0][1];
  for (const [at, value] of FLICKER) if (t >= at) level = value;
  return level;
}

/** Display lighting warms up just after the sign catches */
export function interiorPowerAt(t: number) {
  return 0.06 + 0.94 * smoothstep(t, 1.35, 1.85);
}
