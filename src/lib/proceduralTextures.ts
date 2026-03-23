import * as THREE from "three";

const BASE = "https://threejs.org/examples/textures/planets";

/** Texturas reales disponibles en el repo oficial de three.js */
export const REAL_TEXTURES = {
  earth: `${BASE}/earth_atmos_2048.jpg`,
  moon: `${BASE}/moon_1024.jpg`,
} as const;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function hashSeed(s: string): number {
  return s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

/**
 * Textura procedural tipo mapa esférico (suficiente para esferas pequeñas en escena).
 */
export function createPlanetNoiseTexture(
  colorHex: string,
  seedStr: string,
  options?: { bands?: boolean; spotty?: boolean }
): THREE.CanvasTexture {
  const w = 512;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2d context");
  }
  const { r, g, b } = hexToRgb(colorHex);
  const seed = hashSeed(seedStr);

  const img = ctx.createImageData(w, h);
  const data = img.data;
  for (let y = 0; y < h; y += 1) {
    const lat = (y / h) * Math.PI;
    const band = options?.bands ? Math.sin(lat * 6 + seed * 0.1) * 0.15 : 0;
    for (let x = 0; x < w; x += 1) {
      const lon = (x / w) * Math.PI * 2;
      const n1 =
        Math.sin(lon * 8 + seed) * Math.cos(lat * 5 + seed * 0.5) * 0.12;
      const n2 =
        Math.sin(lon * 20 + lat * 12 + seed * 0.3) * 0.08;
      const n3 = options?.spotty
        ? Math.sin(lon * 35 + seed) * Math.cos(lat * 40) * 0.06
        : 0;
      const v = 0.75 + n1 + n2 + n3 + band;
      const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255)));
      const i = (y * w + x) * 4;
      data[i] = clamp((r / 255) * v);
      data[i + 1] = clamp((g / 255) * v);
      data[i + 2] = clamp((b / 255) * v);
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 4;
  return tex;
}

export function createSunTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context");

  const grd = ctx.createRadialGradient(
    w * 0.45,
    h * 0.5,
    8,
    w * 0.5,
    h * 0.5,
    w * 0.55
  );
  grd.addColorStop(0, "#fff9e6");
  grd.addColorStop(0.25, "#ffdd66");
  grd.addColorStop(0.55, "#ffaa22");
  grd.addColorStop(1, "#cc6600");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let py = 0; py < h; py += 1) {
    for (let px = 0; px < w; px += 1) {
      const i = (py * w + px) * 4;
      const n =
        Math.sin(px * 0.08 + py * 0.06) * 12 +
        Math.sin(px * 0.15 - py * 0.12) * 8;
      d[i] = Math.min(255, Math.max(0, d[i] + n));
      d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n * 0.65));
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n * 0.35));
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function textureOptionsForPlanet(name: string): {
  bands?: boolean;
  spotty?: boolean;
} {
  if (name === "Júpiter" || name === "Saturno" || name === "Urano" || name === "Neptuno") {
    return { bands: true };
  }
  if (name === "Mercurio" || name === "Marte" || name === "Luna") {
    return { spotty: true };
  }
  return {};
}
