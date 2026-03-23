"use client";

import { useThree } from "@react-three/fiber";
import { useCallback, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { RefObject } from "react";
import type { CelestialBody } from "@/data/planets";

export function useCameraFlight(
  controlsRef: RefObject<OrbitControlsImpl | null>
) {
  const { camera } = useThree();
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const flyTo = useCallback(
    (body: CelestialBody, worldPosition: THREE.Vector3) => {
      tweenRef.current?.kill();
      const target = worldPosition.clone();
      const outward = target.clone().normalize();
      const camPos = target.clone().add(outward.multiplyScalar(Math.max(body.radius * 8, 3)));

      tweenRef.current = gsap.to(camera.position, {
        x: camPos.x,
        y: camPos.y,
        z: camPos.z,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          controlsRef.current?.update();
        },
        onComplete: () => {
          const ctrl = controlsRef.current;
          if (ctrl) {
            ctrl.target.copy(target);
            ctrl.update();
          }
        },
      });
    },
    [camera, controlsRef]
  );

  return { flyTo };
}
