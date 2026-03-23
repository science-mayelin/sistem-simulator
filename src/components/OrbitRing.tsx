"use client";

import { DoubleSide } from "three";

type OrbitRingProps = {
  radius: number;
  visible: boolean;
};

export function OrbitRing({ radius, visible }: OrbitRingProps) {
  if (!visible) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <ringGeometry args={[radius - 0.12, radius + 0.12, 128]} />
      <meshBasicMaterial
        color="#facc15"
        transparent
        opacity={0.22}
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
