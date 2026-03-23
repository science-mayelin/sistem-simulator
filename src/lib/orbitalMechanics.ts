/** Época J2000 (mediodía UTC) — alineado con useSimulationTime */
export const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

export function daysFromJ2000Ms(ms: number): number {
  return (ms - J2000_MS) / 86400000;
}

const ORBITAL_PERIODS_DAYS: Record<string, number> = {
  Mercurio: 87.97,
  Venus: 224.7,
  Tierra: 365.25,
  Marte: 686.97,
  Júpiter: 4332.59,
  Saturno: 10759.22,
  Urano: 30688.5,
  Neptuno: 60195,
};

const ORBITAL_DIRECTIONS: Record<string, 1 | -1> = {
  Mercurio: -1,
};

const MOON_LUNAR_ORBIT_DAYS = 27.32;

export function getOrbitalAngle(planetName: string, daysFromEpoch: number): number {
  const period = ORBITAL_PERIODS_DAYS[planetName];
  if (!period || period <= 0) return 0;
  const direction = ORBITAL_DIRECTIONS[planetName] ?? 1;
  return direction * ((2 * Math.PI) / period) * daysFromEpoch;
}

export function getMoonOrbitAngle(daysFromEpoch: number): number {
  return ((2 * Math.PI) / MOON_LUNAR_ORBIT_DAYS) * daysFromEpoch;
}

export function getOrbitalPeriodDays(planetName: string): number | undefined {
  return ORBITAL_PERIODS_DAYS[planetName];
}
