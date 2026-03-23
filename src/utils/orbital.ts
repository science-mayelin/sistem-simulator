import * as satellite from "satellite.js";
import * as THREE from "three";

export interface SatPosition {
  lat: number;
  lon: number;
  alt: number;
  vel: number;
  x: number;
  y: number;
  z: number;
}

export function latLonAltToVec3(lat: number, lon: number, alt: number): THREE.Vector3 {
  const R = 1 + alt / 6371;
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -R * Math.sin(phi) * Math.cos(theta),
    R * Math.cos(phi),
    R * Math.sin(phi) * Math.sin(theta),
  );
}

export function getSatPosition(satrec: satellite.SatRec, date: Date): SatPosition | null {
  const pv = satellite.propagate(satrec, date);
  if (!pv || !pv.position || typeof pv.position === "boolean") return null;
  const gmst = satellite.gstime(date);
  const geo = satellite.eciToGeodetic(pv.position as satellite.EciVec3<number>, gmst);
  const vx = pv.velocity.x;
  const vy = pv.velocity.y;
  const vz = pv.velocity.z;
  const lat = satellite.radiansToDegrees(geo.latitude);
  const lon = satellite.radiansToDegrees(geo.longitude);
  const alt = geo.height;
  const vec = latLonAltToVec3(lat, lon, alt);
  return {
    lat,
    lon,
    alt,
    vel: Math.sqrt(vx * vx + vy * vy + vz * vz),
    x: vec.x,
    y: vec.y,
    z: vec.z,
  };
}

export function buildOrbitPath(satrec: satellite.SatRec, steps = 200): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const now = new Date();
  const no = satrec.no;
  if (!no || no <= 0) return pts;
  const period = (2 * Math.PI) / no;
  const periodMs = period * 60000;

  for (let i = 0; i <= steps; i++) {
    const t = new Date(now.getTime() + (i / steps) * periodMs);
    const pv = satellite.propagate(satrec, t);
    if (!pv || !pv.position || typeof pv.position === "boolean") continue;
    const gmst = satellite.gstime(t);
    const geo = satellite.eciToGeodetic(pv.position as satellite.EciVec3<number>, gmst);
    pts.push(
      latLonAltToVec3(
        satellite.radiansToDegrees(geo.latitude),
        satellite.radiansToDegrees(geo.longitude),
        geo.height,
      ),
    );
  }
  return pts;
}
