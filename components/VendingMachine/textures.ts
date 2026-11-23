import * as THREE from "three";
import type { VendingItem } from "@/lib/vendingItems";

export interface Fonts {
  display: string;
  heading: string;
  body: string;
  jp: string;
}

const JP = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", sans-serif';

/** next/font exposes its generated family names through the CSS variables set on <html> */
export function readFonts(): Fonts {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    display: read("--font-arvo", "Georgia, serif"),
    heading: read("--font-nunito", "system-ui, sans-serif"),
    body: read("--font-libre-franklin", "system-ui, sans-serif"),
    jp: JP,
  };
}

export async function loadFonts(fonts: Fonts) {
  await Promise.all([
    document.fonts.load(`700 64px ${fonts.display}`),
    document.fonts.load(`800 64px ${fonts.heading}`),
    document.fonts.load(`600 64px ${fonts.body}`),
  ]).catch(() => undefined);
}

// ─── Crisp printed text ─────────────────────────────────────────────────────

/**
 * Small printed type goes soft when the GPU samples a lower-resolution mip level. Bias every
 * text surface's lookups toward the sharper level (a negative LOD bias), as print-heavy games do.
 * Use as a material's onBeforeCompile.
 */
export function sharpenPrint(shader: { fragmentShader: string }) {
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <map_fragment>",
      THREE.ShaderChunk.map_fragment.replace("texture2D( map, vMapUv )", "texture2D( map, vMapUv, -0.75 )"),
    )
    .replace(
      "#include <emissivemap_fragment>",
      THREE.ShaderChunk.emissivemap_fragment.replace(
        "texture2D( emissiveMap, vEmissiveMapUv )",
        "texture2D( emissiveMap, vEmissiveMapUv, -0.75 )",
      ),
    );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Draws in logical units; `scale` multiplies the backing resolution so text stays crisp in
 * close-ups (the carton label fills most of the screen when collected).
 */
function canvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  scale = 1,
) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // three clamps this to the GPU maximum; keeps text sharp on surfaces seen at an angle
  texture.anisotropy = 16;
  return texture;
}

function luminance(hex: string) {
  const c = new THREE.Color(hex);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

export function inkFor(hex: string) {
  return luminance(hex) > 0.45 ? "#2f2a26" : "#f6f5e3";
}

function shade(hex: string, amount: number) {
  const c = new THREE.Color(hex);
  const target = amount > 0 ? new THREE.Color("#ffffff") : new THREE.Color("#000000");
  return `#${c.lerp(target, Math.abs(amount)).getHexString()}`;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  // canvas letterSpacing is not in every browser yet; draw glyph by glyph
  const total = [...text].reduce((w, ch) => w + ctx.measureText(ch).width + spacing, -spacing);
  let cursor = ctx.textAlign === "center" ? x - total / 2 : ctx.textAlign === "right" ? x - total : x;
  const align = ctx.textAlign;
  ctx.textAlign = "left";
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + spacing;
  }
  ctx.textAlign = align;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// ─── Carton label ───────────────────────────────────────────────────────────

export const LABEL_SIZE = { w: 600, h: 884 };

export function drawLabel(item: VendingItem, fonts: Fonts) {
  const { w, h } = LABEL_SIZE;
  return canvasTexture(
    w,
    h,
    (ctx) => {
      const ink = inkFor(item.color);

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, shade(item.color, 0.06));
      bg.addColorStop(1, shade(item.color, -0.05));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = ink;
      ctx.strokeStyle = ink;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      // Title in the site's display face (Arvo), tracked tight like the case study titles,
      // as large as fits in three lines
      const maxWidth = w - 64;
      let size = 132;
      let lines: string[] = [];
      for (; size > 48; size -= 4) {
        ctx.font = `700 ${size}px ${fonts.display}`;
        ctx.letterSpacing = `${-0.03 * size}px`;
        lines = wrap(ctx, item.title, maxWidth);
        if (lines.length <= 3 && lines.every((l) => ctx.measureText(l).width <= maxWidth)) break;
      }
      const lineHeight = size * 1.06;
      const blockTop = 330 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, i) => ctx.fillText(line, w / 2, blockTop + i * lineHeight));

      // Brief description in the site's body face (Libre Franklin), large enough to read
      ctx.letterSpacing = "0px";
      ctx.font = `700 50px ${fonts.body}`;
      const brief = wrap(ctx, item.tagline, maxWidth);
      const briefTop = blockTop + (lines.length - 1) * lineHeight + 92;
      brief.forEach((line, i) => ctx.fillText(line, w / 2, briefTop + i * 60));

      // KA seal
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(w / 2, 740, 56, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `700 46px ${fonts.display}`;
      ctx.textBaseline = "middle";
      ctx.fillText("KA", w / 2, 744);
      // No paper grain here: it softened the small type
    },
    2,
  );
}

// ─── Price tag ──────────────────────────────────────────────────────────────

export function drawPriceTag(item: VendingItem, fonts: Fonts) {
  const w = 512;
  const h = 112;
  return canvasTexture(
    w,
    h,
    (ctx) => {
      ctx.fillStyle = "#f7f5ee";
      ctx.fillRect(0, 0, w, h);

      // The blue badge every Japanese machine has
      ctx.fillStyle = "#2c6cb0";
      roundRect(ctx, 14, 18, 150, 76, 14);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 36px ${fonts.heading}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      spaced(ctx, "COLD", 89, 58, 4);

      // Item name where the price would be
      ctx.fillStyle = "#2f2a26";
      ctx.textAlign = "right";
      let size = 44;
      do {
        ctx.font = `800 ${size}px ${fonts.heading}`;
        size -= 2;
      } while (ctx.measureText(item.short).width > w - 200 && size > 24);
      ctx.fillText(item.short, w - 22, 60);
    },
    2,
  );
}

// ─── Selection button lamp ──────────────────────────────────────────────────

export function drawButtonFace(fonts: Fonts) {
  const w = 256;
  const h = 96;
  return canvasTexture(w, h, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#fffdf4");
    g.addColorStop(1, "#e9e2cf");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#5e574c";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 58px ${fonts.body}`;
    spaced(ctx, "PUSH", w / 2, h / 2 + 3, 6);
  });
}

// ─── BUY button face ───────────────────────────────────────────────────────

export function drawBuyButton(fonts: Fonts) {
  const w = 512;
  const h = 160;
  return canvasTexture(
    w,
    h,
    (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#fffaf0");
      g.addColorStop(1, "#efe4cc");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f2a26";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `800 96px ${fonts.heading}`;
      spaced(ctx, "BUY", w / 2, h / 2 + 4, 14);
    },
    2,
  );
}

// ─── Header sign ────────────────────────────────────────────────────────────

export function drawHeaderSign(fonts: Fonts) {
  const w = 2048;
  const h = 330;
  return canvasTexture(w, h, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#fbf8ea");
    g.addColorStop(1, "#efe8cf");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Seal
    ctx.fillStyle = "#6c9362";
    ctx.beginPath();
    ctx.arc(190, h / 2, 112, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f6f5e3";
    ctx.font = `700 96px ${fonts.display}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("KA", 190, h / 2 + 6);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#4c4641";
    ctx.font = `700 104px ${fonts.display}`;
    ctx.fillText("Khrystyna Arnoldy", 360, 168);
    ctx.fillStyle = "#6b6059";
    ctx.font = `700 44px ${fonts.body}`;
    spaced(ctx, "UX · PRODUCT DESIGN · FRESHLY MADE", 364, 248, 7);

    ctx.fillStyle = "#4f6b47";
    ctx.textAlign = "right";
    ctx.font = `800 58px ${fonts.jp}`;
    ctx.fillText("おいしいデザイン", w - 90, 150);
    ctx.font = `700 34px ${fonts.jp}`;
    ctx.fillStyle = "#6b6059";
    ctx.fillText("いつでも、つめたい。", w - 92, 238);
  }, 2);
}

// ─── Coin unit display ──────────────────────────────────────────────────────

export function drawDisplay(text: string) {
  const w = 512;
  const h = 144;
  return canvasTexture(w, h, (ctx) => {
    ctx.fillStyle = "#0b0d0a";
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Shrink longer readouts (item name + price) to fit the panel
    let size = 76;
    do {
      ctx.font = `700 ${size}px "SFMono-Regular", Menlo, monospace`;
      size -= 2;
    } while (ctx.measureText(text).width > w - 44 && size > 24);
    // Unlit segment ghosts make it read as a real LED panel
    ctx.fillStyle = "rgba(120, 255, 170, 0.07)";
    // Ghosts only behind characters, so word gaps stay dark
    ctx.fillText(text.replace(/\S/g, "8"), w / 2, h / 2 + 4);
    ctx.fillStyle = "#8dffb5";
    ctx.shadowColor = "#8dffb5";
    ctx.shadowBlur = 18;
    ctx.fillText(text, w / 2, h / 2 + 4);
  }, 2);
}

// ─── Printed panel graphics ─────────────────────────────────────────────────

export function drawInstructionPanel(fonts: Fonts) {
  const w = 1024;
  const h = 720;
  return canvasTexture(w, h, (ctx) => {
    ctx.fillStyle = "#f1ead3";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#6c9362";
    ctx.fillRect(0, 0, w, 120);
    ctx.fillStyle = "#f6f5e3";
    ctx.font = `700 44px ${fonts.body}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    spaced(ctx, "FRESHLY DESIGNED", 56, 62, 8);

    ctx.fillStyle = "#4c4641";
    ctx.textBaseline = "alphabetic";
    ctx.font = `700 120px ${fonts.display}`;
    ctx.fillText("Pick one.", 56, 290);

    ctx.fillStyle = "#6b6059";
    ctx.font = `600 44px ${fonts.body}`;
    ["1  Choose a carton", "2  Press BUY", "3  Collect it below"].forEach((line, i) =>
      ctx.fillText(line, 60, 400 + i * 74),
    );

    ctx.fillStyle = "#2c6cb0";
    roundRect(ctx, 56, 620, 300, 64, 12);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 34px ${fonts.heading}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    spaced(ctx, "ICE COLD", 206, 653, 5);

  }, 2);
}

export function drawTakeOutLabel(fonts: Fonts) {
  const w = 1024;
  const h = 96;
  return canvasTexture(w, h, (ctx) => {
    ctx.fillStyle = "#2b2724";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f6f5e3";
    ctx.textBaseline = "middle";
    ctx.font = `700 36px ${fonts.body}`;
    ctx.textAlign = "center";
    spaced(ctx, "TAKE OUT  ·  PUSH", w / 2, h / 2 + 2, 8);
  }, 2);
}
