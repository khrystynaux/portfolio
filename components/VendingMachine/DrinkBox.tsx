"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { VendingItem } from "@/lib/vendingItems";
import { drawLabel, sharpenPrint, type Fonts } from "./textures";
import { useVending } from "./store";
import { sfx } from "./sound";
import { daylight } from "./park/daylight";

export const BOX = { w: 0.19, h: 0.28, d: 0.09 };

interface CartonProps {
  item: VendingItem;
  fonts: Fonts;
  /** Receives the printed panel's material so callers can make the label glow */
  labelRef?: React.Ref<THREE.MeshPhysicalMaterial>;
}

/** A laminated juice carton centred on its own origin */
export function Carton({ item, fonts, labelRef }: CartonProps) {
  const label = useMemo(() => drawLabel(item, fonts), [item, fonts]);
  useEffect(() => () => label.dispose(), [label]);

  const { w, h, d } = BOX;

  return (
    <group>
      <RoundedBox args={[w, h, d]} radius={0.004} smoothness={3} castShadow receiveShadow>
        <meshPhysicalMaterial color={item.color} roughness={0.42} clearcoat={0.45} clearcoatRoughness={0.3} />
      </RoundedBox>

      {/* Printed front panel */}
      <mesh position={[0, 0, d / 2 + 0.0004]} receiveShadow>
        <planeGeometry args={[w - 0.006, h - 0.006]} />
        <meshPhysicalMaterial
          ref={labelRef}
          onBeforeCompile={sharpenPrint}
          map={label}
          emissiveMap={label}
          emissive="#ffffff"
          emissiveIntensity={0}
          roughness={0.34}
          clearcoat={0.6}
          clearcoatRoughness={0.22}
        />
      </mesh>

      {/* Top sealing seam */}
      <mesh position={[0, h / 2 + 0.002, -d * 0.1]} castShadow>
        <boxGeometry args={[w - 0.008, 0.004, 0.012]} />
        <meshPhysicalMaterial color={item.color} roughness={0.45} clearcoat={0.4} />
      </mesh>

      {/* Foil straw hole */}
      <mesh position={[w * 0.26, h / 2 + 0.0005, d * 0.18]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.009, 32]} />
        <meshStandardMaterial color="#d8d6d0" metalness={1} roughness={0.28} />
      </mesh>
    </group>
  );
}

interface DisplayCartonProps {
  item: VendingItem;
  fonts: Fonts;
  /** Bottom-centre of the carton, standing on its shelf */
  position: [number, number, number];
  /** Tiny yaw so a row of dummies doesn't look machine-perfect */
  yaw?: number;
}

/** The dummy carton on display behind the glass: hover lifts it, click selects it */
export function DisplayCarton({ item, fonts, position, yaw = 0 }: DisplayCartonProps) {
  const group = useRef<THREE.Group>(null);
  const label = useRef<THREE.MeshPhysicalMaterial>(null);
  const hover = useVending((s) => s.hover);
  const select = useVending((s) => s.select);

  useFrame((_, delta) => {
    const { hovered, selected, phase } = useVending.getState();
    const isSelected = selected === item.id && phase !== "idle";
    const isHovered = hovered === item.id;
    const lift = isSelected ? 1 : isHovered ? 0.6 : 0;
    const g = group.current;
    if (g) {
      // Nudge toward the glass and up a hair, as if picked up for a look
      g.position.z = THREE.MathUtils.damp(g.position.z, position[2] + lift * 0.01, 9, delta);
      g.position.y = THREE.MathUtils.damp(g.position.y, position[1] + BOX.h / 2 + lift * 0.006, 9, delta);
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, yaw * (1 - lift), 9, delta);
    }
    if (label.current) {
      // Display dummies are backlit: they glow a little after dark, like a real machine
      const night = 0.16 * (1 - daylight.value);
      const glow = night + (isSelected ? 0.22 : isHovered ? 0.08 : 0);
      label.current.emissiveIntensity = THREE.MathUtils.damp(label.current.emissiveIntensity, glow, 8, delta);
    }
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const { phase, hovered } = useVending.getState();
    if (phase !== "idle" && phase !== "selected") return;
    if (hovered !== item.id) sfx.hover();
    hover(item.id);
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    if (useVending.getState().hovered === item.id) hover(null);
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const { phase, selected } = useVending.getState();
    if (phase !== "idle" && phase !== "selected") return;
    if (phase === "selected" && selected === item.id) sfx.press();
    else sfx.select();
    select(item.id);
  };

  return (
    <group
      ref={group}
      position={[position[0], position[1] + BOX.h / 2, position[2]]}
      rotation-y={yaw}
      onPointerOver={onOver}
      onPointerOut={onOut}
      onClick={onClick}
    >
      <Carton item={item} fonts={fonts} labelRef={label} />
    </group>
  );
}
