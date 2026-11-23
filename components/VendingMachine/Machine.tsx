"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { vendingRows } from "@/lib/vendingItems";
import { BUY_Y, DISPLAY_Y, M, STRIP, coinUnit, columnX, doorDepth, doorZ, rowBottom, rowHeight } from "./layout";
import { DisplayCarton } from "./DrinkBox";
import { TakeOutBay } from "./TakeOutBay";
import { itemById, useVending, type VendingItem } from "./store";
import { sfx } from "./sound";
import { power } from "./intro";
import { daylight } from "./park/daylight";
import {
  drawButtonFace,
  drawBuyButton,
  drawDisplay,
  drawHeaderSign,
  drawInstructionPanel,
  drawPriceTag,
  drawTakeOutLabel,
  sharpenPrint,
  type Fonts,
} from "./textures";

function useDisposable<T extends { dispose(): void }>(resource: T) {
  useEffect(() => () => resource.dispose(), [resource]);
  return resource;
}

function Panel({
  x0,
  x1,
  y0,
  y1,
  material,
  depth = doorDepth,
  z = doorZ,
}: {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  material: THREE.Material;
  depth?: number;
  z?: number;
}) {
  return (
    <RoundedBox
      args={[x1 - x0, y1 - y0, depth]}
      radius={0.004}
      smoothness={2}
      position={[(x0 + x1) / 2, (y0 + y1) / 2, z]}
      material={material}
      castShadow
      receiveShadow
    />
  );
}

export function Machine({ fonts }: { fonts: Fonts }) {
  const mats = useMemo(
    () => ({
      paint: new THREE.MeshPhysicalMaterial({
        color: "#efe7d2",
        roughness: 0.36,
        clearcoat: 0.7,
        clearcoatRoughness: 0.18,
      }),
      sage: new THREE.MeshPhysicalMaterial({
        color: "#6c9362",
        roughness: 0.4,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
      }),
      darkPlastic: new THREE.MeshStandardMaterial({ color: "#2b2724", roughness: 0.55 }),
      plinth: new THREE.MeshStandardMaterial({ color: "#1d1a18", roughness: 0.7, metalness: 0.2 }),
      chrome: new THREE.MeshStandardMaterial({ color: "#d9d6cf", roughness: 0.18, metalness: 1 }),
      shelf: new THREE.MeshStandardMaterial({ color: "#f3f0e6", roughness: 0.5 }),
      strip: new THREE.MeshStandardMaterial({ color: "#ece7da", roughness: 0.45 }),
      backdrop: new THREE.MeshStandardMaterial({ color: "#f4f1e8", roughness: 0.85 }),
      cavity: new THREE.MeshStandardMaterial({ color: "#0f0d0c", roughness: 0.9, side: THREE.BackSide }),
    }),
    [],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  const sign = useDisposable(useMemo(() => drawHeaderSign(fonts), [fonts]));
  const panel = useDisposable(useMemo(() => drawInstructionPanel(fonts), [fonts]));
  const takeOut = useDisposable(useMemo(() => drawTakeOutLabel(fonts), [fonts]));

  const { w, h, front, window: win, bay, plinth } = M;
  const half = w / 2;

  // Lit parts follow the intro's power levels (both stay at 1 outside the intro)
  const signMat = useRef<THREE.MeshStandardMaterial>(null);
  const rowLights = useRef<(THREE.RectAreaLight | null)[]>([]);
  const rowLeds = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  useFrame(() => {
    // In sunlight the machine's own lamps barely register; at night they carry the scene
    const lamps = 0.35 + 0.65 * (1 - daylight.value);
    const sign = power.sign * lamps;
    const interior = power.interior * lamps;
    // Kept under the bloom threshold so the lettering stays crisp; the sign's glow comes from
    // its rect light and the spill, not a halo over the text
    if (signMat.current) signMat.current.emissiveIntensity = 0.62 * sign;
    rowLights.current.forEach((l) => l && (l.intensity = 11 * interior));
    rowLeds.current.forEach((m) => m?.color.setRGB(4 * interior, 3.9 * interior, 3.6 * interior));
  });

  return (
    <group>
      {/* ── Cabinet ───────────────────────────────────────────── */}
      <RoundedBox
        args={[w, h - plinth, M.bodyFront + 0.36]}
        radius={0.02}
        smoothness={4}
        position={[0, plinth + (h - plinth) / 2, (M.bodyFront - 0.36) / 2]}
        material={mats.paint}
        castShadow
        receiveShadow
      />
      <RoundedBox
        args={[w - 0.04, plinth, 0.6]}
        radius={0.006}
        position={[0, plinth / 2, -0.05]}
        material={mats.plinth}
        castShadow
        receiveShadow
      />
      {/* Canopy and the sage band that wraps the sides */}
      <RoundedBox
        args={[w + 0.05, 0.045, 0.8]}
        radius={0.012}
        position={[0, h + 0.022, 0]}
        material={mats.sage}
        castShadow
        receiveShadow
      />
      <mesh position={[0, 1.47, -0.062]} material={mats.sage} castShadow receiveShadow>
        <boxGeometry args={[w + 0.004, 0.07, 0.596]} />
      </mesh>
      <mesh position={[0, 1.415, -0.062]} material={mats.sage}>
        <boxGeometry args={[w + 0.004, 0.012, 0.596]} />
      </mesh>

      {/* ── Door assembly ─────────────────────────────────────── */}
      <Panel x0={-half} x1={half} y0={win.top} y1={h - 0.03} material={mats.paint} />
      <Panel x0={-half} x1={-win.x} y0={win.bottom} y1={win.top} material={mats.paint} />
      <Panel x0={win.x} x1={half} y0={win.bottom} y1={win.top} material={mats.paint} />
      <Panel x0={-half} x1={half} y0={bay.top} y1={win.bottom} material={mats.paint} />
      <Panel x0={-half} x1={half} y0={plinth} y1={bay.bottom} material={mats.paint} />
      <Panel x0={-half} x1={bay.left} y0={bay.bottom} y1={bay.top} material={mats.paint} />
      <Panel x0={bay.right} x1={half} y0={bay.bottom} y1={bay.top} material={mats.paint} />

      {/* Back-lit header sign */}
      <mesh position={[0, (win.top + h - 0.03) / 2, front + 0.0006]}>
        <planeGeometry args={[0.94, 0.94 / (2048 / 330)]} />
        <meshStandardMaterial
          ref={signMat}
          onBeforeCompile={sharpenPrint}
          map={sign}
          emissiveMap={sign}
          emissive="#ffffff"
          emissiveIntensity={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* ── Display window ────────────────────────────────────── */}
      <mesh position={[0, (win.top + win.bottom) / 2, M.bodyFront + 0.0005]} material={mats.backdrop} receiveShadow>
        <planeGeometry args={[win.x * 2, win.top - win.bottom]} />
      </mesh>

      {vendingRows.map((row, i) => {
        const y0 = rowBottom(i);
        const yTop = y0 + rowHeight;
        return (
          <group key={i}>
            {/* Shelf */}
            <mesh position={[0, y0 + STRIP - 0.006, M.bodyFront + 0.055]} material={mats.shelf} castShadow receiveShadow>
              <boxGeometry args={[win.x * 2, 0.012, 0.11]} />
            </mesh>
            {/* Price strip */}
            <mesh position={[0, y0 + STRIP / 2, front - 0.014]} material={mats.strip} receiveShadow>
              <boxGeometry args={[win.x * 2, STRIP, 0.008]} />
            </mesh>

            {/* Hidden LED strip lighting this row from the top front */}
            <mesh position={[0, yTop - 0.004, front - 0.026]} rotation-x={Math.PI / 2}>
              <planeGeometry args={[win.x * 2 - 0.02, 0.01]} />
              <meshBasicMaterial
                ref={(m) => {
                  rowLeds.current[i] = m;
                }}
                color={[4, 3.9, 3.6]}
                toneMapped={false}
              />
            </mesh>
            <rectAreaLight
              ref={(l) => {
                rowLights.current[i] = l;
              }}
              args={["#fff3df", 7, win.x * 2 - 0.02, 0.03]}
              position={[0, yTop - 0.01, front - 0.03]}
              rotation-x={-Math.PI / 3}
            />

            {row.map((item, j) => {
              const index = i * row.length + j + 1;
              return (
                <group key={item.id}>
                  <DisplayCarton
                    item={item}
                    fonts={fonts}
                    position={[columnX(j), y0 + STRIP, M.bodyFront + 0.055]}
                    yaw={((index * 37) % 7 - 3) * 0.006}
                  />
                  <PriceTag item={item} fonts={fonts} x={columnX(j)} y0={y0} />
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Front glass: an additive reflection-only layer. Real transmission re-renders the
          whole scene every frame, and flat clear glass looks the same without it. */}
      <mesh position={[0, (win.top + win.bottom) / 2, front - 0.004]} renderOrder={1} raycast={() => null}>
        <planeGeometry args={[win.x * 2, win.top - win.bottom]} />
        <meshPhysicalMaterial
          color="#000000"
          roughness={0.04}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={2.2}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Lower panel ───────────────────────────────────────── */}
      <mesh position={[-0.17, 0.62, front + 0.0006]} receiveShadow>
        <planeGeometry args={[0.5, 0.5 / (1024 / 720)]} />
        <meshPhysicalMaterial onBeforeCompile={sharpenPrint} map={panel} roughness={0.4} clearcoat={0.5} />
      </mesh>

      <CoinUnit fonts={fonts} mats={mats} />

      {/* Take-out bay */}
      <mesh position={[(bay.left + bay.right) / 2, bay.top + 0.03, front + 0.0006]}>
        <planeGeometry args={[bay.right - bay.left, (bay.right - bay.left) / (1024 / 96)]} />
        <meshStandardMaterial onBeforeCompile={sharpenPrint}
          map={takeOut} roughness={0.5} />
      </mesh>
      <mesh
        position={[(bay.left + bay.right) / 2, (bay.top + bay.bottom) / 2, (M.bodyFront + 0.0005 + front) / 2]}
        material={mats.cavity}
        receiveShadow
      >
        {/* Inset a hair so its walls don't z-fight the surrounding panels */}
        <boxGeometry args={[bay.right - bay.left - 0.002, bay.top - bay.bottom - 0.002, front - M.bodyFront - 0.0005]} />
      </mesh>
      <BayBezel mats={mats} />
      <TakeOutBay fonts={fonts} />
    </group>
  );
}

function PriceTag({ item, fonts, x, y0 }: { item: VendingItem; fonts: Fonts; x: number; y0: number }) {
  const tag = useDisposable(useMemo(() => drawPriceTag(item, fonts), [item, fonts]));
  const face = useDisposable(useMemo(() => drawButtonFace(fonts), [fonts]));
  const lamp = useRef<THREE.MeshStandardMaterial>(null);
  const cap = useRef<THREE.Group>(null);
  const z = M.front - 0.0095;
  const lit = useMemo(() => new THREE.Color("#ffc46b"), []);
  const unlit = useMemo(() => new THREE.Color("#ffffff"), []);

  useFrame((state, delta) => {
    const { phase, selected, phaseStart } = useVending.getState();
    const mine = selected === item.id;
    let intensity = 0.35;
    let pressed = 0;
    if (phase === "selected") {
      // The chosen lamp pulses to say "press me"; the others dim
      intensity = mine ? 1.6 + 0.7 * Math.sin(state.clock.elapsedTime * 5) : 0.12;
    } else if (phase === "vending" || phase === "dropped" || phase === "collecting") {
      intensity = mine ? 2.2 : 0.08;
      pressed = mine && (performance.now() - phaseStart) / 1000 < 0.25 ? 1 : 0;
    }
    if (lamp.current) {
      lamp.current.emissiveIntensity = THREE.MathUtils.damp(lamp.current.emissiveIntensity, intensity, 10, delta);
      lamp.current.emissive.lerp(mine && phase !== "idle" ? lit : unlit, 1 - Math.exp(-10 * delta));
    }
    if (cap.current) cap.current.position.z = THREE.MathUtils.damp(cap.current.position.z, -pressed * 0.003, 30, delta);
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    const { phase } = useVending.getState();
    if (phase !== "idle" && phase !== "selected") return;
    e.stopPropagation();
    useVending.getState().hover(item.id);
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    if (useVending.getState().hovered === item.id) useVending.getState().hover(null);
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    const { phase, selected, select, release } = useVending.getState();
    if (phase !== "idle" && phase !== "selected") return;
    e.stopPropagation();
    if (phase === "selected" && selected === item.id) {
      sfx.press();
      release();
    } else {
      sfx.select();
      select(item.id);
    }
  };

  return (
    <group>
      <mesh position={[x, y0 + 0.038, z]}>
        <planeGeometry args={[0.13, 0.13 / (512 / 112)]} />
        <meshStandardMaterial onBeforeCompile={sharpenPrint}
          map={tag} roughness={0.4} />
      </mesh>
      <group ref={cap}>
        <RoundedBox args={[0.09, 0.016, 0.006]} radius={0.003} position={[x, y0 + 0.011, z + 0.001]} castShadow>
          <meshStandardMaterial color="#bdb6a6" roughness={0.35} />
        </RoundedBox>
        <mesh position={[x, y0 + 0.011, z + 0.0042]}>
          <planeGeometry args={[0.084, 0.012]} />
          <meshStandardMaterial
            ref={lamp}
            onBeforeCompile={sharpenPrint}
          map={face}
            emissiveMap={face}
            emissive="#ffffff"
            emissiveIntensity={0.35}
            roughness={0.2}
          />
        </mesh>
      </group>
      {/* Generous invisible hit area — the real button is tiny */}
      <mesh position={[x, y0 + STRIP / 2, z + 0.006]} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <planeGeometry args={[0.2, STRIP]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Coin unit readout: SELECT → item name → THANK YOU → TAKE OUT, or PICK ONE after an empty BUY */
function LiveDisplay() {
  const phase = useVending((s) => s.phase);
  const selected = useVending((s) => s.selected);
  const item = itemById(selected);
  const text =
    phase === "selected" && item
      ? item.short
      : phase === "vending"
        ? "THANK YOU"
        : phase === "dropped" || phase === "collecting"
          ? "TAKE OUT"
          : "SELECT";
  const display = useDisposable(useMemo(() => drawDisplay(text), [text]));
  const pickOne = useDisposable(useMemo(() => drawDisplay("PICK ONE"), []));
  const mat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const m = mat.current;
    if (!m) return;
    // Blink PICK ONE for a moment after BUY is pressed with nothing chosen
    const nudging = performance.now() - useVending.getState().nudgeAt < 1100;
    const tex = nudging ? pickOne : display;
    if (m.map !== tex) {
      m.map = tex;
      m.emissiveMap = tex;
    }
    m.emissiveIntensity = nudging && Math.sin(state.clock.elapsedTime * 22) < 0 ? 0.3 : 1.0;
  });

  return (
    <mesh position={[0, DISPLAY_Y - coinUnit.y, 0.0195]}>
      <planeGeometry args={[0.18, 0.18 / (512 / 144)]} />
      <meshStandardMaterial ref={mat} onBeforeCompile={sharpenPrint}
          map={display} emissiveMap={display} emissive="#ffffff" emissiveIntensity={1.0} roughness={0.15} />
    </mesh>
  );
}

/**
 * Always on the machine; dark and inert until a carton is chosen, then it lights up amber and
 * pulses. Pressing it while dark makes the readout ask the visitor to pick one.
 */
function BuyButton({ fonts, mats }: { fonts: Fonts; mats: Record<string, THREE.Material> }) {
  const face = useDisposable(useMemo(() => drawBuyButton(fonts), [fonts]));
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const cap = useRef<THREE.Group>(null);
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const lit = useMemo(() => new THREE.Color("#ffa63d"), []);
  const dark = useMemo(() => new THREE.Color("#000000"), []);
  const on = useMemo(() => new THREE.Color("#ffffff"), []);
  const off = useMemo(() => new THREE.Color("#8d877b"), []);
  const y = BUY_Y - coinUnit.y;

  useFrame((state, delta) => {
    const { phase, phaseStart } = useVending.getState();
    const active = phase === "selected";
    const m = mat.current;
    if (m) {
      const k = 1 - Math.exp(-10 * delta);
      m.color.lerp(active || phase === "vending" ? on : off, k);
      m.emissive.lerp(active || phase === "vending" ? lit : dark, k);
      // Face lit but under the bloom threshold so "BUY" stays sharp
      const faceLevel = active || phase === "vending" ? 0.75 : 0;
      m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, faceLevel, 10, delta);
    }
    const r = ring.current;
    if (r) {
      // The ring around the button carries the glow and the pulse
      const glow = active ? 2.4 + 1.2 * Math.sin(state.clock.elapsedTime * 5) : phase === "vending" ? 3 : 0;
      const v = THREE.MathUtils.damp(r.color.r, glow, 10, delta);
      r.color.setRGB(v, v * 0.62, v * 0.2);
    }
    if (cap.current) {
      const pressed = phase === "vending" && (performance.now() - phaseStart) / 1000 < 0.25;
      cap.current.position.z = THREE.MathUtils.damp(cap.current.position.z, pressed ? -0.005 : 0, 30, delta);
    }
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    const { phase, intro } = useVending.getState();
    if (intro === "playing" || (phase !== "idle" && phase !== "selected")) return;
    e.stopPropagation();
    document.body.style.cursor = phase === "selected" ? "pointer" : "not-allowed";
  };
  const onOut = () => {
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    const { phase, intro, release, nudge } = useVending.getState();
    if (intro === "playing") return;
    e.stopPropagation();
    if (phase === "selected") {
      document.body.style.cursor = "";
      sfx.press();
      release();
    } else if (phase === "idle") {
      sfx.denied();
      nudge();
    }
  };

  return (
    <group>
      {/* Bezel */}
      <RoundedBox args={[0.205, 0.082, 0.008]} radius={0.004} position={[0, y, 0.018]} material={mats.darkPlastic} castShadow />
      {/* Light ring between bezel and cap: dark until a carton is chosen, then it glows */}
      <mesh position={[0, y, 0.0225]}>
        <planeGeometry args={[0.192, 0.07]} />
        <meshBasicMaterial ref={ring} color={[0, 0, 0]} toneMapped={false} />
      </mesh>
      <group ref={cap}>
        <RoundedBox args={[0.18, 0.06, 0.012]} radius={0.006} position={[0, y, 0.026]} castShadow>
          <meshStandardMaterial color="#d8d0bf" roughness={0.35} />
        </RoundedBox>
        <mesh position={[0, y, 0.0323]}>
          <planeGeometry args={[0.168, 0.168 / (512 / 160)]} />
          <meshStandardMaterial ref={mat} onBeforeCompile={sharpenPrint}
          map={face} emissiveMap={face} color="#8d877b" emissive="#000000" emissiveIntensity={0} roughness={0.25} />
        </mesh>
      </group>
      <mesh position={[0, y, 0.036]} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <planeGeometry args={[0.21, 0.09]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function BayBezel({ mats }: { mats: Record<string, THREE.Material> }) {
  const { bay, front } = M;
  const t = 0.012;
  const z = front + 0.004;
  const cx = (bay.left + bay.right) / 2;
  const cy = (bay.top + bay.bottom) / 2;
  const bw = bay.right - bay.left;
  const bh = bay.top - bay.bottom;
  const pieces: [number, number, number, number][] = [
    [cx, bay.top + t / 2, bw + t * 2, t],
    [cx, bay.bottom - t / 2, bw + t * 2, t],
    [bay.left - t / 2, cy, t, bh],
    [bay.right + t / 2, cy, t, bh],
  ];
  return (
    <>
      {pieces.map(([x, y, pw, ph], i) => (
        <RoundedBox key={i} args={[pw, ph, 0.012]} radius={0.003} position={[x, y, z]} material={mats.darkPlastic} castShadow receiveShadow />
      ))}
    </>
  );
}

function CoinUnit({ fonts, mats }: { fonts: Fonts; mats: Record<string, THREE.Material> }) {
  const z = M.front;
  return (
    <group position={[coinUnit.x, coinUnit.y, z]}>
      <RoundedBox args={[0.26, 0.44, 0.014]} radius={0.006} position={[0, 0, 0.007]} material={mats.sage} castShadow receiveShadow />

      {/* LED readout */}
      <RoundedBox args={[0.2, 0.065, 0.006]} radius={0.003} position={[0, 0.15, 0.016]} material={mats.darkPlastic} />
      <LiveDisplay />

      <BuyButton fonts={fonts} mats={mats} />

      {/* Bill acceptor */}
      <RoundedBox args={[0.17, 0.05, 0.014]} radius={0.004} position={[0, -0.07, 0.021]} material={mats.darkPlastic} castShadow />
      <mesh position={[0, -0.07, 0.0285]}>
        <planeGeometry args={[0.12, 0.004]} />
        <meshBasicMaterial color={[0.6, 3, 1.2]} toneMapped={false} />
      </mesh>

      {/* Coin return cup */}
      <RoundedBox args={[0.09, 0.06, 0.016]} radius={0.005} position={[0, -0.16, 0.022]} material={mats.darkPlastic} castShadow />
      <mesh position={[0, -0.163, 0.0305]}>
        <planeGeometry args={[0.07, 0.038]} />
        <meshBasicMaterial color="#070606" />
      </mesh>
    </group>
  );
}
