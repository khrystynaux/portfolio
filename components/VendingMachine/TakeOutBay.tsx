"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { BOX, Carton } from "./DrinkBox";
import { M, bayCenter } from "./layout";
import { itemById, useVending } from "./store";
import { sfx } from "./sound";
import type { Fonts } from "./textures";

const { bay, front } = M;
const flapHeight = bay.top - bay.bottom - 0.012;

/** Shared between the product and the flap so a landing can kick the flap */
const flapKick = { value: 0 };

/**
 * Lying on its back with the label up and its top pointing into the machine, so the
 * label reads the right way up from where the visitor stands.
 */
const REST_Y = bay.bottom + BOX.d / 2 + 0.002;
/** While falling, the carton sits deep enough in the bay to clear the closed flap */
const FALL_Z = front - BOX.h / 2 - 0.014;
/** Once the flap swings open the carton slides out toward the visitor */
const PRESENT_Z = front + 0.05;
const SPAWN_Y = bay.top + 0.22;
/** Motor wind-up before the carton drops */
const DROP_DELAY = 0.45;

// ─── Spring-hinged smoked flap ────────────────────────────────────────────

function Flap() {
  const hinge = useRef<THREE.Group>(null);
  const sim = useRef({ angle: 0.1, velocity: 0, opened: false });

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30);
    const { phase } = useVending.getState();
    const s = sim.current;
    const open = phase === "dropped" || phase === "collecting";
    if (open && !s.opened) sfx.flap();
    s.opened = open;

    // Positive pushes the bottom edge into the machine, tucking the flap up out of view
    const target = open ? 1.35 : 0.1;
    s.velocity += flapKick.value;
    flapKick.value = 0;
    // Under-damped spring so the flap overshoots and settles like sprung plastic
    s.velocity += ((target - s.angle) * 140 - s.velocity * 11) * delta;
    s.angle += s.velocity * delta;
    if (hinge.current) hinge.current.rotation.x = s.angle;
  });

  return (
    <group ref={hinge} position={[bayCenter.x, bay.top - 0.006, front - 0.012]} rotation-x={0.1}>
      <mesh position={[0, -flapHeight / 2, 0]} castShadow>
        <boxGeometry args={[bay.right - bay.left - 0.012, flapHeight, 0.004]} />
        <meshPhysicalMaterial
          color="#1c1a19"
          roughness={0.12}
          transparent
          opacity={0.82}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
    </group>
  );
}

// ─── Lamp inside the bay ──────────────────────────────────────────────────

function BayLamp() {
  const strip = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    const { phase } = useVending.getState();
    const on = phase === "dropped" || phase === "collecting" ? 1 : phase === "vending" ? 0.25 : 0;
    if (strip.current) {
      const v = THREE.MathUtils.damp(strip.current.color.r, 0.05 + on * 3, 6, delta);
      strip.current.color.setRGB(v, v * 0.92, v * 0.78);
    }
  });

  // No point light: at a few centimetres it burns a hotspot into the white label.
  // The emissive strip plus bloom reads as the bay lamp on its own.
  return (
    <>
      {/* Strip along the top lip, out of direct view */}
      <mesh position={[bayCenter.x, bay.top - 0.004, M.bodyFront + 0.025]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[bay.right - bay.left - 0.03, 0.008]} />
        <meshBasicMaterial ref={strip} color={[0.05, 0.05, 0.05]} toneMapped={false} />
      </mesh>
    </>
  );
}

// ─── The purchased carton ─────────────────────────────────────────────────

function Product({ fonts, itemId }: { fonts: Fonts; itemId: string }) {
  const item = itemById(itemId)!;

  const outer = useRef<THREE.Group>(null);
  const label = useRef<THREE.MeshPhysicalMaterial>(null);
  const hovered = useRef(false);
  const sim = useRef({ spawned: false, y: SPAWN_Y, vy: 0, bounces: 0, settledAt: 0, spin: 0 });
  const tmp = useRef({ target: new THREE.Vector3(), dir: new THREE.Vector3(), quat: new THREE.Quaternion() });
  const collectFrom = useRef<{ pos: THREE.Vector3; quat: THREE.Quaternion } | null>(null);

  useFrame((state, rawDelta) => {
    const g = outer.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 1 / 30);
    const { phase, phaseStart, land } = useVending.getState();
    const t = (performance.now() - phaseStart) / 1000;
    const s = sim.current;

    if (phase === "vending") {
      g.visible = t > DROP_DELAY;
      if (t <= DROP_DELAY) return;
      if (!s.spawned) {
        Object.assign(s, { spawned: true, y: SPAWN_Y, vy: 0, bounces: 0, settledAt: 0, spin: 2.4 });
      }
      // Gravity, a couple of soft cardboard bounces, then rest
      s.vy -= 9.8 * delta;
      s.y += s.vy * delta;
      if (s.y <= REST_Y) {
        s.y = REST_Y;
        const impact = Math.abs(s.vy);
        if (impact > 0.35 && s.bounces < 3) {
          sfx.thunk(Math.min(1, impact / 2.2));
          flapKick.value += impact * 1.6;
          s.vy = impact * 0.26;
          s.spin *= -0.5;
          s.bounces++;
        } else {
          s.vy = 0;
          s.settledAt ||= t;
        }
      }
      s.spin = THREE.MathUtils.damp(s.spin, 0, s.y <= REST_Y + 0.001 ? 12 : 1.5, delta);
      g.position.set(bayCenter.x, s.y, FALL_Z);
      g.rotation.set(-Math.PI / 2 + s.spin * 0.08, s.spin * 0.05, s.spin * 0.06);
      if (s.settledAt && t - s.settledAt > 0.25) land();
      return;
    }

    if (phase === "dropped") {
      g.visible = true;
      // Slide out through the open flap, tipping the label toward the visitor
      g.position.x = THREE.MathUtils.damp(g.position.x, bayCenter.x, 6, delta);
      g.position.z = THREE.MathUtils.damp(g.position.z, t > 0.25 ? PRESENT_Z : FALL_Z, 5, delta);
      const lift = hovered.current ? 0.012 : 0;
      g.position.y = THREE.MathUtils.damp(g.position.y, REST_Y + lift + (t > 0.25 ? 0.01 : 0), 8, delta);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -Math.PI / 2 + (t > 0.25 ? 0.12 : 0), 5, delta);
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0, 6, delta);
      g.rotation.z = THREE.MathUtils.damp(g.rotation.z, 0, 6, delta);
      if (label.current) {
        // Gentle breathing glow invites the click
        const pulse = 0.03 + 0.06 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 3));
        label.current.emissiveIntensity = THREE.MathUtils.damp(label.current.emissiveIntensity, hovered.current ? 0.16 : pulse, 8, delta);
      }
      collectFrom.current = null;
      return;
    }

    if (phase === "collecting") {
      // Lift the carton up to the camera, standing upright so the label fills the frame
      if (!collectFrom.current) collectFrom.current = { pos: g.position.clone(), quat: g.quaternion.clone() };
      const { target, dir, quat } = tmp.current;
      const cam = state.camera;
      cam.getWorldDirection(dir);
      target.copy(cam.position).addScaledVector(dir, 0.42);
      const k = THREE.MathUtils.smootherstep(Math.min(t / 0.9, 1), 0, 1);
      g.position.lerpVectors(collectFrom.current.pos, target, k);
      quat.copy(cam.quaternion);
      g.quaternion.slerpQuaternions(collectFrom.current.quat, quat, k);
      if (label.current) label.current.emissiveIntensity = THREE.MathUtils.lerp(0.16, 0.3, k);
      return;
    }

    g.visible = false;
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    if (useVending.getState().phase !== "dropped") return;
    e.stopPropagation();
    hovered.current = true;
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    hovered.current = false;
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (useVending.getState().phase !== "dropped") return;
    e.stopPropagation();
    hovered.current = false;
    document.body.style.cursor = "";
    sfx.collect();
    useVending.getState().collect();
  };

  return (
    <group ref={outer} visible={false} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
      <Carton item={item} fonts={fonts} labelRef={label} />
    </group>
  );
}

export function TakeOutBay({ fonts }: { fonts: Fonts }) {
  const selected = useVending((s) => s.selected);
  const phase = useVending((s) => s.phase);
  const live = phase === "vending" || phase === "dropped" || phase === "collecting";

  return (
    <>
      <Flap />
      <BayLamp />
      {/* Keyed so every purchase starts a fresh drop */}
      {live && selected && <Product key={selected} fonts={fonts} itemId={selected} />}
    </>
  );
}
