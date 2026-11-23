"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { Clone, Environment, useGLTF } from "@react-three/drei";
import { GroundedSkybox } from "three/examples/jsm/objects/GroundedSkybox.js";
import { useVending } from "../store";
import { daylight, scenery } from "./daylight";

/**
 * Photographic park: a real 360° photo projected onto the ground and sky around the machine,
 * lit by the matching HDR, with photoscanned props up close. All assets are CC0 from Poly Haven.
 */

const DEG = Math.PI / 180;

export const PARKS = {
  day: {
    photo: "/park/chinese_garden_4k.jpg",
    hdr: "/park/chinese_garden_1k.hdr",
    /** Turns the photo so the pond and pavilion sit behind the machine and paving lies in front */
    rotation: 2.33,
    /** How high the photographer's camera was; sets the scale of the projected ground */
    height: 1.7,
    /** Where the sun is in the photo (equirect u, elevation), so our shadows agree with its shadows */
    sun: { u: 0.6, elevation: 31 * DEG },
  },
  night: {
    photo: "/park/pond_bridge_night_4k.jpg",
    hdr: "/park/pond_bridge_night_1k.hdr",
    rotation: Math.PI / 2,
    height: 1.7,
  },
} as const;

/** Direction toward a point on an equirect photo after the photo is turned by `rotation` */
function photoDirection(u: number, elevation: number, rotation: number) {
  const angle = (u - 0.5) * Math.PI * 2 - rotation;
  return new THREE.Vector3(Math.cos(elevation) * Math.cos(angle), Math.sin(elevation), Math.cos(elevation) * Math.sin(angle));
}

export const SUN_DIRECTION = photoDirection(PARKS.day.sun.u, PARKS.day.sun.elevation, PARKS.day.rotation);

// ─── Backdrops ────────────────────────────────────────────────────────────

function Backdrop({ which }: { which: "day" | "night" }) {
  const park = PARKS[which];
  const loaded = useLoader(THREE.TextureLoader, park.photo);
  const sky = useMemo(() => {
    const texture = loaded.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    const s = new GroundedSkybox(texture, park.height, 60, 96);
    s.position.y = park.height - 0.01;
    s.rotation.y = park.rotation;
    const m = s.material as THREE.MeshBasicMaterial;
    m.transparent = true;
    m.fog = false;
    s.renderOrder = which === "night" ? -2 : -1;
    return s;
  }, [loaded, park, which]);
  useEffect(
    () => () => {
      sky.geometry.dispose();
      const m = sky.material as THREE.MeshBasicMaterial;
      m.map?.dispose();
      m.dispose();
    },
    [sky],
  );
  const ref = useRef<GroundedSkybox>(null);

  useFrame(() => {
    const s = ref.current;
    if (!s) return;
    const k = daylight.value;
    // Night sits underneath and is always opaque; day fades over it
    (s.material as THREE.MeshBasicMaterial).opacity = which === "day" ? k : 1;
    s.visible = which === "night" ? k < 0.999 : k > 0.001;
  });

  return <primitive ref={ref} object={sky} />;
}

// ─── Lighting ─────────────────────────────────────────────────────────────

/**
 * Sun and moon, eased day ↔ night. The HDR photo does the ambient light and reflections; the
 * sun is a real light aimed from where the sun is in the photo, so the machine's shadow
 * falls the same way as the garden's own shadows.
 */
function Lighting() {
  const time = useVending((s) => s.time);
  const sun = useRef<THREE.DirectionalLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  const catcher = useRef<THREE.ShadowMaterial>(null);
  const placed = useRef(false);

  useFrame((state, delta) => {
    const target = useVending.getState().time === "day" ? 1 : 0;
    daylight.target = target;
    if (!placed.current) {
      daylight.value = target;
      placed.current = true;
    } else {
      daylight.value = THREE.MathUtils.damp(daylight.value, target, 1.6, Math.min(delta, 1 / 20));
      if (Math.abs(daylight.value - target) < 0.0015) daylight.value = target;
      else state.invalidate();
    }
    const k = daylight.value;
    const sunUp = THREE.MathUtils.smoothstep(k, 0.25, 0.85);
    if (sun.current) sun.current.intensity = 2.6 * sunUp;
    if (moon.current) moon.current.intensity = 0.12 * (1 - sunUp);
    // Dip through dusk so the swap of lighting photos at the midpoint isn't noticed
    const dusk = 1 - Math.sin(Math.PI * k) * 0.55;
    // Night photo light is very blue; keep it low so the machine's warm-white light leads
    state.scene.environmentIntensity = (k > 0.5 ? 0.62 : 0.4) * dusk;
    if (catcher.current) catcher.current.opacity = 0.18 + 0.32 * sunUp;

    const b = scenery.bloom;
    // Only true light sources bloom (lamp, LED strips, BUY ring) — never printed text
    if (b) b.luminanceMaterial.threshold = THREE.MathUtils.lerp(1.15, 1.6, k);
  });

  const park = PARKS[time];
  return (
    <>
      <Suspense fallback={null}>
        <Environment files={park.hdr} environmentRotation={[0, -park.rotation, 0]} />
      </Suspense>
      <directionalLight
        ref={sun}
        position={SUN_DIRECTION.clone().multiplyScalar(14).toArray()}
        color="#fff1dc"
        intensity={3.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.03}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-3}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      <directionalLight ref={moon} position={[4, 8, -6]} color="#9fb4ff" intensity={0} />
      {/* Catches our objects' shadows on the photographed ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0.6]} receiveShadow renderOrder={0}>
        <planeGeometry args={[12, 10]} />
        <shadowMaterial ref={catcher} transparent opacity={0.45} color="#1b1712" />
      </mesh>
    </>
  );
}

// ─── Photoscanned props ───────────────────────────────────────────────────

const MODELS = {
  lamp: "/park/models/street_lamp_01/street_lamp_01.gltf",
  shrub: "/park/models/shrub_02/shrub_02.gltf",
  grass: "/park/models/grass_medium_01/grass_medium_01.gltf",
  fern: "/park/models/fern_02/fern_02.gltf",
};

function shadowed(object: THREE.Object3D) {
  object.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return object;
}

/** One named variant out of a model file, re-centred at the origin */
function useVariant(url: string, name: string) {
  const { nodes } = useGLTF(url);
  return useMemo(() => {
    const node = nodes[name].clone(true);
    node.position.set(0, 0, 0);
    return shadowed(node);
  }, [nodes, name]);
}

function Plant({
  url,
  name,
  position,
  rotation = 0,
  scale = 1,
}: {
  url: string;
  name: string;
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  const object = useVariant(url, name);
  return <Clone object={object} position={position} rotation-y={rotation} scale={scale} />;
}

export const LAMP = { position: [-1.35, 0, 0.35] as [number, number, number], bulb: 3.26 };

function Lamp() {
  const { scene } = useGLTF(MODELS.lamp);
  const light = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const { lamp, glow } = useMemo(() => {
    const lamp = shadowed(scene.clone(true));
    const glow: THREE.MeshStandardMaterial[] = [];
    lamp.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (!/glass|bulb/.test(m.name)) return;
      // The glass and bulb glow at night, and mustn't block the lamp's own light
      const lit = m.clone();
      lit.emissive = new THREE.Color("#ffc27a");
      lit.emissiveIntensity = 0;
      mesh.material = lit;
      mesh.castShadow = false;
      glow.push(lit);
    });
    return { lamp, glow };
  }, [scene]);

  useEffect(() => {
    if (light.current) light.current.target = target;
  }, [target]);

  useFrame((state) => {
    const dark = THREE.MathUtils.smoothstep(1 - daylight.value, 0.35, 0.7);
    const stutter = dark > 0.02 && dark < 0.98 && Math.sin(state.clock.elapsedTime * 47) > 0.6 ? 0.4 : 1;
    const level = dark * stutter;
    if (light.current) light.current.intensity = 20 * level;
    glow.forEach((m) => (m.emissiveIntensity = 4 * level));
  });

  return (
    <group position={LAMP.position}>
      <primitive object={lamp} />
      <spotLight
        ref={light}
        position={[0, LAMP.bulb - 0.05, 0]}
        angle={0.95}
        penumbra={0.85}
        decay={2}
        distance={14}
        color="#ffd09a"
        intensity={0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
      />
      <primitive object={target} position={[0.9, 0, -0.1]} />
    </group>
  );
}

// ─── Park bench ───────────────────────────────────────────────────────────
// Built as one object (the scanned modular kit never assembled cleanly into a single bench):
// two cast-iron end frames, timber slats resting on the seat rails, a slatted backrest fixed
// to the rear uprights. Every part touches its neighbours.

const BENCH = { length: 1.7, seatY: 0.44, depth: 0.46, frameX: 0.8 };
/** Rear upright: centred at y 0.45 on this z, leaning back by this angle; the backrest hangs off it */
const BACK_Z = -0.23;
const BACK_TILT = 0.1;

/** Weathered timber: warm brown with long grain lines and a few knots */
function woodTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, "#8a5a36");
  g.addColorStop(1, "#6f4527");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 128);
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) {
    const y = rand() * 128;
    ctx.strokeStyle = `rgba(${40 + rand() * 30},${22 + rand() * 18},${10 + rand() * 10},${0.15 + rand() * 0.25})`;
    ctx.lineWidth = 0.6 + rand() * 1.6;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 64) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 2 + (rand() - 0.5) * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const x = 120 + rand() * 780;
    const y = 30 + rand() * 68;
    const r = ctx.createRadialGradient(x, y, 0, x, y, 9);
    r.addColorStop(0, "rgba(50,28,14,0.7)");
    r.addColorStop(1, "rgba(50,28,14,0)");
    ctx.fillStyle = r;
    ctx.fillRect(x - 10, y - 10, 20, 20);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function EndFrame({ x, iron }: { x: number; iron: THREE.Material }) {
  const { seatY, depth } = BENCH;
  const front = depth / 2 - 0.03;
  const rear = BACK_Z;
  const box = (args: [number, number, number], position: [number, number, number], rotX = 0) => (
    <mesh position={position} rotation-x={rotX} material={iron} castShadow receiveShadow>
      <boxGeometry args={args} />
    </mesh>
  );
  return (
    <group position={[x, 0, 0]}>
      {/* Front leg up to the armrest */}
      {box([0.05, 0.66, 0.05], [0, 0.33, front])}
      {/* Rear leg running up and back into the backrest upright */}
      {box([0.05, 0.9, 0.05], [0, 0.45, BACK_Z], -BACK_TILT)}
      {/* Seat rail joining the legs, the slats rest on it */}
      {box([0.045, 0.05, depth + 0.02], [0, seatY - 0.04, 0])}
      {/* Armrest, front leg to rear upright */}
      {box([0.07, 0.035, depth + 0.04], [0, 0.67, -0.005])}
      {/* Feet */}
      {box([0.09, 0.02, 0.09], [0, 0.01, front])}
      {box([0.09, 0.02, 0.09], [0, 0.01, rear - 0.07])}
      {/* Lower stretcher between the legs */}
      {box([0.035, 0.035, depth - 0.06], [0, 0.12, -0.01])}
    </group>
  );
}

function Bench() {
  const wood = useMemo(() => woodTexture(), []);
  useEffect(() => () => wood.dispose(), [wood]);
  const mats = useMemo(
    () => ({
      iron: new THREE.MeshStandardMaterial({ color: "#1d211f", roughness: 0.5, metalness: 0.65 }),
      timber: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.72 }),
    }),
    [wood],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  const { length, seatY, depth, frameX } = BENCH;
  const slatW = 0.075;
  const seatSlats = 5;
  const gap = (depth - seatSlats * slatW) / (seatSlats - 1);

  return (
    <group position={[1.85, 0, 0.15]} rotation-y={-0.32}>
      <EndFrame x={-frameX} iron={mats.iron} />
      <EndFrame x={frameX} iron={mats.iron} />

      {/* Seat slats on the rails */}
      {Array.from({ length: seatSlats }, (_, i) => (
        <mesh
          key={`s${i}`}
          position={[0, seatY - 0.0025, -depth / 2 + slatW / 2 + i * (slatW + gap)]}
          material={mats.timber}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[length, 0.03, slatW]} />
        </mesh>
      ))}

      {/* Backrest slats screwed to the front face of the rear uprights, leaning back with them */}
      <group position={[0, 0.45, BACK_Z]} rotation-x={-BACK_TILT}>
        {[0.56, 0.68, 0.8].map((y) => (
          <mesh key={y} position={[0, y - 0.45, 0.025 + 0.0125]} material={mats.timber} castShadow receiveShadow>
            <boxGeometry args={[length, 0.085, 0.025]} />
          </mesh>
        ))}
      </group>

      {/* Iron crossbar tying the two frames together under the seat */}
      <mesh position={[0, 0.12, -0.01]} rotation-z={Math.PI / 2} material={mats.iron} castShadow>
        <cylinderGeometry args={[0.016, 0.016, frameX * 2, 12]} />
      </mesh>
    </group>
  );
}

/** Recycling bin — almost every Japanese vending machine has one beside it */
function RecyclingBin() {
  return (
    <group position={[-0.8, 0, -0.08]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.84, 0.36]} />
        <meshStandardMaterial color="#3d6f95" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.86, 0]} castShadow>
        <boxGeometry args={[0.44, 0.05, 0.38]} />
        <meshStandardMaterial color="#e9e6dc" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.889, 0.02]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.065, 32]} />
        <meshBasicMaterial color="#0b0b0b" />
      </mesh>
    </group>
  );
}

/** Planting tucked around the machine so it sits in the garden rather than on top of it */
function Planting() {
  const g = MODELS.grass;
  const f = MODELS.fern;
  const s = MODELS.shrub;
  return (
    <group>
      <Plant url={s} name="shrub_02_b" position={[-1.05, 0, -0.75]} rotation={0.4} scale={0.65} />
      <Plant url={s} name="shrub_02_c" position={[1.0, 0, -0.85]} rotation={2.1} scale={0.7} />
      <Plant url={s} name="shrub_02_a" position={[2.4, 0, -0.6]} rotation={1.2} scale={0.8} />
      <Plant url={f} name="fern_02_a" position={[-0.68, 0, 0.32]} rotation={0.6} scale={0.9} />
      <Plant url={f} name="fern_02_c" position={[0.68, 0, -0.18]} rotation={2.4} scale={0.8} />
      <Plant url={f} name="fern_02_b" position={[-1.7, 0, -0.3]} rotation={1.1} />
      <Plant url={g} name="grass_medium_01_large_a_LOD0" position={[-1.15, 0, 0.55]} rotation={0.3} scale={1.8} />
      <Plant url={g} name="grass_medium_01_mid_a_LOD0" position={[0.62, 0, 0.42]} rotation={1.4} scale={1.8} />
      <Plant url={g} name="grass_medium_01_tall_b_LOD0" position={[-0.55, 0, -0.42]} rotation={2.2} scale={1.8} />
      <Plant url={g} name="grass_medium_01_small_a_LOD0" position={[0.95, 0, 0.35]} rotation={0.8} scale={1.8} />
      <Plant url={g} name="grass_medium_01_mid_c_LOD0" position={[2.05, 0, 0.25]} rotation={2.9} scale={1.8} />
      <Plant url={g} name="grass_medium_01_large_c_LOD0" position={[-2.05, 0, 0.45]} rotation={1.9} scale={1.8} />
      <Plant url={g} name="grass_medium_01_tiny_c_LOD0" position={[0.25, 0, 0.5]} rotation={0.2} scale={1.8} />
    </group>
  );
}

export function PhotoPark() {
  const nightUsed = useVending((s) => s.nightUsed);
  return (
    <>
      <Suspense fallback={null}>
        <Backdrop which="day" />
      </Suspense>
      {/* The night photo and lighting only download once someone asks for night */}
      {nightUsed && (
        <Suspense fallback={null}>
          <Backdrop which="night" />
        </Suspense>
      )}
      <Lighting />
      <Suspense fallback={null}>
        <Lamp />
        <Bench />
        <Planting />
      </Suspense>
      <RecyclingBin />
    </>
  );
}

useGLTF.preload(MODELS.lamp);
useGLTF.preload(MODELS.shrub);
useGLTF.preload(MODELS.grass);
useGLTF.preload(MODELS.fern);
