"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import * as THREE from "three";
import { createSunTexture } from "@/lib/proceduralTextures";

export function Sun() {
  const meshRef = useRef<Mesh>(null);
  const map = useMemo(() => createSunTexture(), []);

  useEffect(() => () => map.dispose(), [map]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 1.2) * 0.025;
    mesh.scale.setScalar(pulse);
  });

  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={180} distance={0} decay={1.8} color="#fff3d4" />
      <mesh ref={meshRef}>
        <sphereGeometry args={[4, 64, 64]} />
        <meshBasicMaterial map={map} color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}
