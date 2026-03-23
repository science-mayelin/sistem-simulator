"use client";

import { useMemo } from "react";
import { PointMaterial, Points } from "@react-three/drei";

const PARTICLE_COUNT = 2600;
const INNER_RADIUS = 165;
const OUTER_RADIUS = 260;

function randomPointInSphericalShell(innerRadius: number, outerRadius: number) {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(
    Math.random() * (outerRadius ** 3 - innerRadius ** 3) + innerRadius ** 3
  );

  const sinPhi = Math.sin(phi);
  return [r * sinPhi * Math.cos(theta), r * Math.cos(phi), r * sinPhi * Math.sin(theta)];
}

export function OortCloud() {
  const positions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const [x, y, z] = randomPointInSphericalShell(INNER_RADIUS, OUTER_RADIUS);
      const idx = i * 3;
      pos[idx] = x;
      pos[idx + 1] = y;
      pos[idx + 2] = z;
    }
    return pos;
  }, []);

  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#a7d7ff"
        opacity={0.16}
        size={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}
