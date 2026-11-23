import { vendingRows } from "@/lib/vendingItems";

// Real-world scale, metres. Origin is the floor under the machine's centre.
export const M = {
  w: 1.02,
  h: 1.83,
  /** Front face of the cabinet; the door assembly sits in front of it */
  bodyFront: 0.24,
  front: 0.36,
  window: { x: 0.44, bottom: 0.86, top: 1.62 },
  bay: { left: -0.4, right: 0.12, bottom: 0.12, top: 0.32 },
  plinth: 0.06,
};

export const doorDepth = M.front - M.bodyFront;
export const doorZ = M.bodyFront + doorDepth / 2;
export const rowHeight = (M.window.top - M.window.bottom) / vendingRows.length;
const columnWidth = (M.window.x * 2) / vendingRows[0].length;

/** Bottom edge (y) of row `i`, counting from the top row */
export const rowBottom = (i: number) => M.window.top - (i + 1) * rowHeight;
export const columnX = (j: number) => -M.window.x + columnWidth * (j + 0.5);
/** Height of the price strip; cartons stand on the shelf just above it */
export const STRIP = 0.056;

/** Centre of the take-out bay opening */
export const bayCenter = {
  x: (M.bay.left + M.bay.right) / 2,
  y: (M.bay.top + M.bay.bottom) / 2,
};

/** Coin unit panel centre; the LED readout sits above the BUY button */
export const coinUnit = { x: 0.3, y: 0.6 };
export const DISPLAY_Y = coinUnit.y + 0.15;
export const BUY_Y = coinUnit.y + 0.045;

/**
 * Zoomed-in view: the cartons and the BUY panel fit in one frame height. It opens anchored at
 * the top (header sign in view) and scrolling moves down toward the take-out bay; it can never
 * scroll above the point where the header panel would leave the frame.
 */
export const CLOSE_FRAME = { top: M.window.top + 0.03, bottom: BUY_Y - 0.065 };
export const CLOSE_HEIGHT = CLOSE_FRAME.top - CLOSE_FRAME.bottom + 0.08;
/** Highest edge the zoomed frame may show: just above the canopy */
export const PAN_TOP_EDGE = M.h + 0.07;
/** Lowest edge: just below the plinth */
export const PAN_BOTTOM_EDGE = -0.02;
/** Camera-centre limits for a frame `height` metres tall */
export const panLimits = (height: number) => {
  const max = PAN_TOP_EDGE - height / 2;
  const min = Math.min(max, PAN_BOTTOM_EDGE + height / 2);
  return { min, max };
};
/** Live limits for the current screen; the camera rig updates these from the real frame height */
export const panRange = panLimits(CLOSE_HEIGHT);
