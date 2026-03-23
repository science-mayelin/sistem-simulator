import * as THREE from "three";
import type { CelestialBody } from "@/data/planets";
import { findCelestialBody } from "@/data/planets";
import { getMoonOrbitAngle, getOrbitalAngle } from "@/lib/orbitalMechanics";

const MOON_ORBIT_SCENE = 2.4;

export function getCelestialWorldPosition(
  body: CelestialBody,
  daysFromEpoch: number
): THREE.Vector3 {
  const v = new THREE.Vector3();

  if (body.category === "planet" && body.distance > 0) {
    const angle = getOrbitalAngle(body.name, daysFromEpoch);
    return v.set(
      body.distance * Math.cos(angle),
      0,
      body.distance * Math.sin(angle)
    );
  }

  if (body.parentName) {
    const parent = findCelestialBody(body.parentName);
    if (!parent) return v.set(0, 0, 0);
    const parentPos = getCelestialWorldPosition(parent, daysFromEpoch);

    if (body.name === "Luna") {
      const moonA = getMoonOrbitAngle(daysFromEpoch);
      const r = MOON_ORBIT_SCENE + body.radius;
      return parentPos.clone().add(
        new THREE.Vector3(
          r * Math.cos(moonA),
          0,
          r * Math.sin(moonA)
        )
      );
    }

    const seed = body.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const localAngle = seed * 0.01 + daysFromEpoch * 0.002;
    const r = parent.radius + 4 + body.radius * 2;
    const offset = new THREE.Vector3(
      r * Math.cos(localAngle),
      body.radius * 0.4 * Math.sin(localAngle * 2),
      r * Math.sin(localAngle)
    );
    return parentPos.clone().add(offset);
  }

  if (body.name === "Plutón") {
    const angle = getOrbitalAngle("Neptuno", daysFromEpoch) * 0.4;
    return v.set(122 * Math.cos(angle), 4 * Math.sin(angle * 2), 122 * Math.sin(angle));
  }

  if (body.name === "Nube de Oort") {
    return v.set(0, 0, 210);
  }

  return v.set(22, 0, 0);
}
