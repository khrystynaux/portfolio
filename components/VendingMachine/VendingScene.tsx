"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  PerformanceMonitor,
  useProgress,
} from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode, type BloomEffect } from "postprocessing";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { Machine } from "./Machine";
import { CLOSE_HEIGHT, M, bayCenter, panLimits, panRange } from "./layout";
import { useVending } from "./store";
import { INTRO_SECONDS, interiorPowerAt, power, signPowerAt } from "./intro";
import type { Fonts } from "./textures";
import { PhotoPark } from "./park/PhotoPark";
import { daylight, scenery } from "./park/daylight";

RectAreaLightUniformsLib.init();


const BAY_APPROACH = new THREE.Vector3(bayCenter.x + 0.2, 0.75, M.front + 2.4);
const introBusy = () => {
  const { intro, introEndedAt } = useVending.getState();
  return intro === "playing" || (introEndedAt > 0 && performance.now() - introEndedAt < (PULL_BACK_SECONDS + 1) * 1000);
};

/**
 * Warm-up: a few real frames rendered from the full-machine view while the curtain is still
 * black, so every shader variant, texture and shadow the pull-back will need is ready before
 * it starts. Then the camera snaps back to the opening shot.
 */
const warmup = { frames: 0, snap: false };

/** Length of the intro's pull-back from the sign to the whole machine */
const PULL_BACK_SECONDS = 3.4;

/** Header sign centre — the intro's opening shot */
const SIGN_Y = (M.window.top + M.h - 0.03) / 2;

/**
 * Fixed framings — no pointer drift — eased between:
 *  - full:  the whole machine
 *  - close: the display window and its buttons (the Zoom in view)
 *  - bay:   the take-out bay after the drop
 * The scene renders on demand, so the rig keeps requesting frames only while it is moving.
 */
function CameraRig() {
  const size = useThree((s) => s.size);
  const look = useRef(new THREE.Vector3(0, 0.98, 0));
  const v = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3() });
  const placed = useRef(false);
  /** Intro pull-back: a fixed-length eased glide, so a slow frame can't make it jump */
  const glide = useRef<{ endedAt: number; fromPos: THREE.Vector3; fromLook: THREE.Vector3 } | null>(null);

  useFrame((state, delta) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const { phase, zoom, intro, introEndedAt, panY } = useVending.getState();
    const aspect = size.width / size.height;
    const fit = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const { pos, look: lookTarget } = v.current;

    if (warmup.frames > 0) {
      // Behind the curtain: frame the whole machine so everything renders once
      pos.set(0.38, 1.1, Math.max(2.7 / fit, 1.75 / aspect / fit));
      lookTarget.set(0, 0.98, 0);
      camera.position.copy(pos);
      look.current.copy(lookTarget);
      camera.lookAt(look.current);
      warmup.frames--;
      warmup.snap = true;
      state.invalidate();
      return;
    }

    if (intro === "playing") {
      // Opening shot: tight on the header sign, slightly below and off-axis
      const d = Math.max(0.5 / fit, 1.2 / aspect / fit);
      pos.set(0.08, SIGN_Y - 0.04, M.front + d);
      lookTarget.set(0, SIGN_Y, M.front);
    } else if (phase === "dropped" || phase === "collecting") {
      // Looking down into the bay at the carton poking out of it
      const d = Math.max(1.05, 0.8 / aspect / fit);
      pos.set(bayCenter.x + 0.1, 0.72, M.front + d);
      lookTarget.set(bayCenter.x, 0.2, M.front + 0.06);
    } else if (phase === "vending") {
      // Start drifting down toward the bay while the motor runs: anticipation
      const full = Math.max(2.7 / fit, 1.75 / aspect / fit);
      pos.set(0.38, 1.0, full).lerp(BAY_APPROACH, 0.45);
      lookTarget.set(bayCenter.x * 0.5, 0.6, 0);
    } else if (zoom === "close") {
      // Zoomed in; scrolling moves panY between the header sign and the take-out bay.
      // Clamp against the frame height actually on screen (taller on narrow screens).
      const d = Math.max(CLOSE_HEIGHT / fit, 0.96 / aspect / fit);
      const { min, max } = panLimits(d * fit);
      panRange.min = min;
      panRange.max = max;
      const y = THREE.MathUtils.clamp(panY, min, max);
      pos.set(0.14, y, M.front + d);
      lookTarget.set(0.03, y, M.front);
    } else {
      // Whole machine plus breathing room, for any aspect ratio
      pos.set(0.38, 1.1, Math.max(2.7 / fit, 1.75 / aspect / fit));
      lookTarget.set(0, 0.98, 0);
    }

    // Start the glide on the first frame after the intro hands over
    if (introEndedAt && intro === "done" && glide.current?.endedAt !== introEndedAt) {
      glide.current = { endedAt: introEndedAt, fromPos: camera.position.clone(), fromLook: look.current.clone() };
    }
    const glideT = glide.current ? (performance.now() - glide.current.endedAt) / 1000 / PULL_BACK_SECONDS : 1;
    const gliding = glide.current && glideT < 1 && phase === "idle" && zoom === "full";

    if (!placed.current || warmup.snap) {
      camera.position.copy(pos);
      look.current.copy(lookTarget);
      placed.current = true;
      warmup.snap = false;
    } else if (gliding && glide.current) {
      // Ease in, travel, ease out — evaluated from elapsed time, not frame deltas
      const k = glideT < 0.5 ? 4 * glideT ** 3 : 1 - (-2 * glideT + 2) ** 3 / 2;
      camera.position.lerpVectors(glide.current.fromPos, pos, k);
      look.current.lerpVectors(glide.current.fromLook, lookTarget, k);
      state.invalidate();
    } else {
      const lambda = phase === "idle" || phase === "selected" ? 3.2 : 2.4;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, pos.x, lambda, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, pos.y, lambda, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, pos.z, lambda, delta);
      look.current.x = THREE.MathUtils.damp(look.current.x, lookTarget.x, lambda, delta);
      look.current.y = THREE.MathUtils.damp(look.current.y, lookTarget.y, lambda, delta);
      look.current.z = THREE.MathUtils.damp(look.current.z, lookTarget.z, lambda, delta);
    }
    camera.lookAt(look.current);

    if (camera.position.distanceToSquared(pos) > 1e-8 || look.current.distanceToSquared(lookTarget) > 1e-8) {
      state.invalidate();
    }
  });

  return null;
}

/**
 * The canvas only draws when something changes. Any store change (hover, select, zoom…)
 * wakes it for long enough to let the eased animations settle; scripted phases keep it awake.
 */
function RenderOnDemand() {
  const invalidate = useThree((s) => s.invalidate);
  const awakeUntil = useRef(0);

  useEffect(
    () =>
      useVending.subscribe(() => {
        awakeUntil.current = performance.now() + 1200;
        invalidate();
      }),
    [invalidate],
  );

  useFrame((state) => {
    const { phase, intro } = useVending.getState();
    // The selected lamp pulses and the presented carton breathes, so those phases stay live
    if (phase !== "idle" || intro === "playing" || performance.now() < awakeUntil.current) state.invalidate();
  });

  return null;
}

/**
 * Lift the curtain (and let the intro start) only once every asset has loaded and every shader
 * is compiled; otherwise loading and compiling land in the middle of the intro as hitches.
 */
function SceneReady({ onReady }: { onReady?: () => void }) {
  const { active, loaded, total } = useProgress();
  const frames = useRef(0);
  const done = useRef(false);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useFrame((state) => {
    frames.current++;
    if (done.current) return;
    state.invalidate();
    // A couple of frames in, so Suspense has started every load. Also wait for the HDR
    // lighting: it's processed after loading and changes every material's shader, so
    // compiling before it lands would leave the old variants and recompile mid-intro.
    if (frames.current < 3 || active || loaded < total || !scene.environment) return;
    done.current = true;
    // Compile against an off-screen target like the effect composer's input: the shader
    // variant for the canvas (sRGB output) differs from the one actually used (linear).
    const target = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType });
    const previous = gl.getRenderTarget();
    gl.setRenderTarget(target);
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .finally(() => {
        gl.setRenderTarget(previous);
        target.dispose();
      })
      .then(() => {
        warmup.frames = 4;
        // Upload every texture now. Otherwise each one uploads the first time its object
        // enters the frame — which during the intro pull-back means visible hitches.
        const seen = new Set<THREE.Texture>();
        scene.traverse((o) => {
          const mats = (o as THREE.Mesh).material;
          if (!mats) return;
          for (const m of Array.isArray(mats) ? mats : [mats]) {
            for (const value of Object.values(m)) {
              if (value instanceof THREE.Texture && !seen.has(value)) {
                seen.add(value);
                gl.initTexture(value);
              }
            }
          }
        });
        // Let the warm-up frames render (and the camera snap back), then reveal
        const waitForWarmup = () => {
          if (warmup.frames > 0 || warmup.snap) {
            state.invalidate();
            requestAnimationFrame(waitForWarmup);
            return;
          }
          useVending.getState().setSceneReady(true);
          requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
        };
        requestAnimationFrame(waitForWarmup);
      });
  });
  return null;
}

/** Runs the power-on flicker, then hands the camera back to the full view */
function IntroDirector() {
  const start = useRef<number | null>(null);

  useFrame(() => {
    const { intro, setIntro, sceneReady } = useVending.getState();
    if (intro === "playing" && !sceneReady) {
      // Hold the sign dark until the curtain lifts
      power.sign = signPowerAt(0);
      power.interior = interiorPowerAt(0);
      return;
    }
    if (intro !== "playing") {
      power.sign = 1;
      power.interior = 1;
      return;
    }
    start.current ??= performance.now();
    const t = (performance.now() - start.current) / 1000;
    power.sign = signPowerAt(t);
    power.interior = interiorPowerAt(t);
    if (t > INTRO_SECONDS) setIntro("done");
  });

  return null;
}

/**
 * Nothing casts a moving shadow while the machine idles, so the shadow map only re-renders
 * for the first few frames and while something is moving (hover lifts, the drop, the flap).
 */
function StaticShadows() {
  const frames = useRef(0);
  useFrame(({ gl }) => {
    gl.shadowMap.autoUpdate = false;
    const { phase, hovered } = useVending.getState();
    // Also while day and night cross over: the sun moves and the lamps switch on
    if (frames.current < 5 || phase !== "idle" || hovered || daylight.value !== daylight.target) {
      frames.current++;
      gl.shadowMap.needsUpdate = true;
    }
  });
  return null;
}

/** The machine's own light: display spill and sign glow (park lighting lives in Atmosphere) */
function Lights() {
  const spill = useRef<THREE.RectAreaLight>(null);
  const signGlow = useRef<THREE.RectAreaLight>(null);
  useFrame(() => {
    const lamps = 0.25 + 0.75 * (1 - daylight.value);
    if (spill.current) spill.current.intensity = 5 * power.interior * lamps;
    if (signGlow.current) signGlow.current.intensity = 2.5 * power.sign * lamps;
  });

  return (
    <>
      {/* Spill from the lit display onto the paving in front */}
      <rectAreaLight
        ref={spill}
        args={["#fff1dc", 5, M.window.x * 2, M.window.top - M.window.bottom]}
        position={[0, (M.window.top + M.window.bottom) / 2, M.front + 0.02]}
        rotation-y={Math.PI}
      />
      {/* Header sign glow */}
      <rectAreaLight ref={signGlow} args={["#fffaf0", 2.5, 0.94, 0.15]} position={[0, 1.71, M.front + 0.02]} rotation-y={Math.PI} />
    </>
  );
}

/**
 * Reflections: an outdoor sky dome over green ground for the glass and lacquer to mirror.
 * Atmosphere scales scene.environmentIntensity down for night.
 */
function Reflections() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#8ea3b6"]} />
      {/* Bright overcast-blue sky overhead, darker green ground below the horizon */}
      <Lightformer form="rect" intensity={1.2} color="#dce8f5" position={[0, 8, 0]} scale={[16, 16, 1]} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={0.25} color="#4d5a3a" position={[0, -3, 0]} scale={[20, 20, 1]} rotation-x={-Math.PI / 2} />
      <Lightformer form="circle" intensity={4} color="#fff2dc" position={[-6, 7, 7]} scale={1.4} target={[0, 1, 0]} />
      {/* Soft panel behind the viewer so the glass catches a long reflection */}
      <Lightformer form="rect" intensity={0.5} color="#f1f4f6" position={[2.2, 1.6, 6]} scale={[2.5, 4, 1]} rotation-y={Math.PI + 0.35} />
    </Environment>
  );
}

export default function VendingScene({
  fonts,
  onContextLost,
  onReady,
}: {
  fonts: Fonts;
  onContextLost?: () => void;
  /** First frame is on screen — the page can lift its curtain */
  onReady?: () => void;
}) {
  // Phones and narrow windows get a lighter tier (lower DPR, fewer shadow samples, cheaper AO)
  const [lite] = useState(
    () => window.matchMedia("(max-width: 700px), (pointer: coarse)").matches,
  );
  // R3F deliberately drops the context on unmount; only report losses while mounted
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  // Full device resolution keeps the printed text crisp; affordable because the scene only
  // renders while something moves. Steps down a little if animations can't hold frame rate.
  const [maxDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 2));
  const [dpr, setDpr] = useState(maxDpr);

  return (
    <Canvas
      shadows
      flat
      frameloop="demand"
      dpr={dpr}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ fov: 30, near: 0.1, far: 120, position: [0.4, 1.0, 5.2] }}
      // Clicking empty space puts a selection back
      onPointerMissed={() => useVending.getState().cancel()}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          if (mounted.current) onContextLost?.();
        });
      }}
    >
      <PerformanceMonitor
        // A resolution change resizes the canvas: never mid-intro or mid pull-back
        onDecline={() => !introBusy() && setDpr((d) => Math.max(Math.min(maxDpr, 1.5), d - 0.25))}
        onIncline={() => !introBusy() && setDpr((d) => Math.min(maxDpr, d + 0.25))}
        flipflops={3}
        onFallback={() => setDpr(Math.min(maxDpr, 1.5))}
      />
      <RenderOnDemand />
      <IntroDirector />
      <SceneReady onReady={onReady} />

      {/* Plain PCF soft shadows: PCSS's random sampling left grain on the machine's text at night */}
      <StaticShadows />
      <Reflections />
      <Lights />
      <CameraRig />

      <Machine fonts={fonts} />
      <ContactShadows position={[0, 0.002, 0]} scale={3} blur={2.2} far={0.6} opacity={0.75} resolution={512} frames={1} />
      <PhotoPark />

      <EffectComposer multisampling={0}>
        {/* Shallow focus on the machine: the garden behind softens like a real lens */}
        <DepthOfField target={[0, 1.05, 0.3]} worldFocusRange={2.2} bokehScale={lite ? 2 : 3.2} />
        <N8AO aoRadius={0.35} distanceFalloff={0.6} intensity={2.2} quality={lite ? "performance" : "medium"} halfRes />
        <Bloom
          ref={(b: BloomEffect | null) => {
            scenery.bloom = b;
          }}
          mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.75} radius={0.72} />
        {/* Neutral keeps the park photo's colours true; AgX greyed them out */}
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        <Vignette offset={0.3} darkness={0.55} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
