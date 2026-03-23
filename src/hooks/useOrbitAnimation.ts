"use client";

import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { RefObject } from "react";

export function useOrbitAnimation(
  pivotRef: RefObject<Group | null>,
  orbitalSpeed: number,
  speedMultiplier: number
) {
  useFrame((_, delta) => {
    const pivot = pivotRef.current;
    if (!pivot) return;
    pivot.rotation.y += orbitalSpeed * delta * speedMultiplier;
  });
}
