"use client";

import { Stars } from "@react-three/drei";

export function StarField() {
  return (
    <Stars
      radius={420}
      depth={90}
      count={5000}
      factor={3.2}
      saturation={0}
      fade
      speed={0.35}
    />
  );
}
