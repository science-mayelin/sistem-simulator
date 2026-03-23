"use client";

import * as satellite from "satellite.js";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { TleTriple } from "@/hooks/useTLE";
import { buildOrbitPath, getSatPosition } from "@/utils/orbital";

const COL = {
  L8: 0x5dcaa5,
  L9: 0x85b7eb,
} as const;

const TRAIL_MAX = 120;
const EARTH_TEX = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

function makeSatelliteMesh(hex: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(0.018, 8, 8);
  const mat = new THREE.MeshPhongMaterial({
    color: hex,
    emissive: hex,
    emissiveIntensity: 0.6,
  });
  return new THREE.Mesh(geo, mat);
}

function makeOrbitLine(satrec: satellite.SatRec, color: number): THREE.Line {
  const pts = buildOrbitPath(satrec);
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 });
  return new THREE.Line(geo, mat);
}

function makeFootprintRing(color: number): THREE.LineLoop {
  const pts: THREE.Vector3[] = [];
  const r = 0.04;
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.LineLoop(
    geo,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 }),
  );
}

function updateFootprint(ring: THREE.LineLoop, position: THREE.Vector3) {
  const up = position.clone().normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
  ring.position.copy(position);
  ring.setRotationFromQuaternion(quat);
}

function updateTrailLine(trail: THREE.Vector3[], line: THREE.Line) {
  if (trail.length < 2) {
    line.visible = false;
    return;
  }
  line.visible = true;
  (line.geometry as THREE.BufferGeometry).setFromPoints(trail);
}

function fmt(n: number, digits: number) {
  return n.toFixed(digits);
}

export interface SatelliteGlobeProps {
  tleL8: TleTriple | null;
  tleL9: TleTriple | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function SatelliteGlobe({ tleL8, tleL9, loading, error, onRetry }: SatelliteGlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [showOrbits, setShowOrbits] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showFootprints, setShowFootprints] = useState(true);
  const [speedMult, setSpeedMult] = useState(100);

  const showOrbitsRef = useRef(showOrbits);
  const showTrailsRef = useRef(showTrails);
  const showFootprintsRef = useRef(showFootprints);
  const speedRef = useRef(speedMult);
  showOrbitsRef.current = showOrbits;
  showTrailsRef.current = showTrails;
  showFootprintsRef.current = showFootprints;
  speedRef.current = speedMult;

  const hudL8Lat = useRef<HTMLSpanElement>(null);
  const hudL8Lon = useRef<HTMLSpanElement>(null);
  const hudL8Alt = useRef<HTMLSpanElement>(null);
  const hudL8Vel = useRef<HTMLSpanElement>(null);
  const hudL9Lat = useRef<HTMLSpanElement>(null);
  const hudL9Lon = useRef<HTMLSpanElement>(null);
  const hudL9Alt = useRef<HTMLSpanElement>(null);
  const hudL9Vel = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!tleL8 || !tleL9 || !canvasRef.current || !wrapRef.current) return;

    const canvas = canvasRef.current;
    const satrec8 = satellite.twoline2satrec(tleL8[1], tleL8[2]);
    const satrec9 = satellite.twoline2satrec(tleL9[1], tleL9[2]);

    const getSize = () => {
      const el = wrapRef.current;
      const w = el?.clientWidth ?? 800;
      const h = el && el.clientHeight > 10 ? el.clientHeight : Math.max(320, w * 0.56);
      return { width: w, height: h };
    };

    let { width, height } = getSize();

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.2);

    scene.add(new THREE.AmbientLight(0x334466, 1.2));
    const sun = new THREE.DirectionalLight(0xffeedd, 2.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    let earthMesh: THREE.Mesh;
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMatSolid = new THREE.MeshPhongMaterial({ color: 0x1a6fa8, shininess: 40 });
    earthMesh = new THREE.Mesh(earthGeo, earthMatSolid);

    loader.load(
      EARTH_TEX,
      (tex) => {
        const prev = earthMesh.material as THREE.Material;
        prev.dispose();
        earthMesh.material = new THREE.MeshPhongMaterial({ map: tex, shininess: 40 });
      },
      undefined,
      () => {
        /* keep solid */
      },
    );
    earthGroup.add(earthMesh);

    const atmMat = new THREE.MeshPhongMaterial({
      color: 0x4488cc,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.04, 32, 32), atmMat));

    const cloudMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
    });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.015, 32, 32), cloudMat);
    earthGroup.add(clouds);

    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(3000);
    for (let i = 0; i < 3000; i++) {
      starPos[i] = (Math.random() - 0.5) * 200;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const satL8 = makeSatelliteMesh(COL.L8);
    const satL9 = makeSatelliteMesh(COL.L9);
    scene.add(satL8, satL9);

    const orbitLineL8 = makeOrbitLine(satrec8, COL.L8);
    const orbitLineL9 = makeOrbitLine(satrec9, COL.L9);
    scene.add(orbitLineL8, orbitLineL9);

    const trailL8: THREE.Vector3[] = [];
    const trailL9: THREE.Vector3[] = [];
    const trailGeoL8 = new THREE.BufferGeometry();
    const trailGeoL9 = new THREE.BufferGeometry();
    const trailLineL8 = new THREE.Line(
      trailGeoL8,
      new THREE.LineBasicMaterial({ color: COL.L8, transparent: true, opacity: 0.55 }),
    );
    const trailLineL9 = new THREE.Line(
      trailGeoL9,
      new THREE.LineBasicMaterial({ color: COL.L9, transparent: true, opacity: 0.55 }),
    );
    scene.add(trailLineL8, trailLineL9);

    const footL8 = makeFootprintRing(COL.L8);
    const footL9 = makeFootprintRing(COL.L9);
    scene.add(footL8, footL9);

    let simTime = new Date();
    let lastReal = Date.now();
    let userRotX = 0.3;
    let userRotY = 0;
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      userRotY += (e.clientX - prevMouse.x) * 0.005;
      userRotX += (e.clientY - prevMouse.y) * 0.005;
      userRotX = Math.max(-1.4, Math.min(1.4, userRotX));
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(1.8, Math.min(6, camera.position.z + e.deltaY * 0.003));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      isDragging = true;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      userRotY += (e.touches[0].clientX - prevMouse.x) * 0.007;
      userRotX += (e.touches[0].clientY - prevMouse.y) * 0.007;
      userRotX = Math.max(-1.4, Math.min(1.4, userRotX));
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);

    const onResize = () => {
      const s = getSize();
      width = s.width;
      height = s.height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    let animId = 0;
    function animate() {
      animId = requestAnimationFrame(animate);

      const sm = speedRef.current;
      const now = Date.now();
      simTime = new Date(simTime.getTime() + (now - lastReal) * sm);
      lastReal = now;

      earthMesh.rotation.y += 0.00005 * sm * 0.01;
      clouds.rotation.y += 0.000065 * sm * 0.01;

      const p8 = getSatPosition(satrec8, simTime);
      const p9 = getSatPosition(satrec9, simTime);

      if (p8) {
        satL8.position.set(p8.x, p8.y, p8.z);
        if (showFootprintsRef.current) {
          footL8.visible = true;
          updateFootprint(footL8, satL8.position);
        } else {
          footL8.visible = false;
        }
        trailL8.push(satL8.position.clone());
        if (trailL8.length > TRAIL_MAX) trailL8.shift();
        if (showTrailsRef.current) {
          updateTrailLine(trailL8, trailLineL8);
        } else {
          trailLineL8.visible = false;
        }
        if (hudL8Lat.current) hudL8Lat.current.textContent = fmt(p8.lat, 2);
        if (hudL8Lon.current) hudL8Lon.current.textContent = fmt(p8.lon, 2);
        if (hudL8Alt.current) hudL8Alt.current.textContent = fmt(p8.alt, 0);
        if (hudL8Vel.current) hudL8Vel.current.textContent = fmt(p8.vel, 2);
      }

      if (p9) {
        satL9.position.set(p9.x, p9.y, p9.z);
        if (showFootprintsRef.current) {
          footL9.visible = true;
          updateFootprint(footL9, satL9.position);
        } else {
          footL9.visible = false;
        }
        trailL9.push(satL9.position.clone());
        if (trailL9.length > TRAIL_MAX) trailL9.shift();
        if (showTrailsRef.current) {
          updateTrailLine(trailL9, trailLineL9);
        } else {
          trailLineL9.visible = false;
        }
        if (hudL9Lat.current) hudL9Lat.current.textContent = fmt(p9.lat, 2);
        if (hudL9Lon.current) hudL9Lon.current.textContent = fmt(p9.lon, 2);
        if (hudL9Alt.current) hudL9Alt.current.textContent = fmt(p9.alt, 0);
        if (hudL9Vel.current) hudL9Vel.current.textContent = fmt(p9.vel, 2);
      }

      orbitLineL8.visible = showOrbitsRef.current;
      orbitLineL9.visible = showOrbitsRef.current;

      scene.rotation.x = userRotX;
      scene.rotation.y = userRotY;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);

      renderer.dispose();
      earthGeo.dispose();
      (earthMesh.material as THREE.Material).dispose();
      atmMat.dispose();
      cloudMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      satL8.geometry.dispose();
      (satL8.material as THREE.Material).dispose();
      satL9.geometry.dispose();
      (satL9.material as THREE.Material).dispose();
      orbitLineL8.geometry.dispose();
      (orbitLineL8.material as THREE.Material).dispose();
      orbitLineL9.geometry.dispose();
      (orbitLineL9.material as THREE.Material).dispose();
      trailGeoL8.dispose();
      trailGeoL9.dispose();
      (trailLineL8.material as THREE.Material).dispose();
      (trailLineL9.material as THREE.Material).dispose();
      footL8.geometry.dispose();
      (footL8.material as THREE.Material).dispose();
      footL9.geometry.dispose();
      (footL9.material as THREE.Material).dispose();
    };
  }, [tleL8, tleL9]);

  const showSpinner = loading && (!tleL8 || !tleL9);
  const hasGlobe = Boolean(tleL8 && tleL9);

  const hudCardClass =
    "w-[min(200px,calc(50vw-1.5rem))] rounded-xl border border-white/15 bg-black/55 p-3 shadow-lg backdrop-blur-md sm:w-[min(220px,24vw)]";

  return (
    <div className="relative h-full min-h-0 w-full">
      <div ref={wrapRef} className="absolute inset-0 overflow-hidden bg-zinc-950">
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full touch-none" />

        {showSpinner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5DCAA5] border-t-transparent" />
            <p className="text-sm text-zinc-300">Obteniendo datos orbitales…</p>
          </div>
        )}

        {!hasGlobe && !showSpinner && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-4 text-center">
            <p className="text-sm text-zinc-300">
              No se pudo obtener datos orbitales. Verifica tu conexión.
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-zinc-100 hover:bg-white/15"
              >
                Reintentar
              </button>
            )}
          </div>
        )}

        {hasGlobe && (
          <p className="pointer-events-none absolute bottom-[calc(7rem+env(safe-area-inset-bottom))] left-0 right-0 text-center text-[11px] text-zinc-500 md:bottom-[5.5rem]">
            Arrastra para rotar · Scroll para zoom
          </p>
        )}
      </div>

      {error && hasGlobe && (
        <div className="absolute left-4 right-4 top-28 z-30 rounded-lg border border-amber-400/30 bg-amber-950/80 px-3 py-2 text-sm text-amber-100 backdrop-blur-md sm:left-auto sm:right-4 sm:top-32 sm:max-w-md">
          No se pudo actualizar desde la red: {error}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="ml-2 text-xs underline hover:no-underline"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* HUD: Landsat 8 izquierda, Landsat 9 derecha (desde sm); apiladas en pantallas muy estrechas */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-28 bottom-32 z-20 flex flex-col items-center justify-center gap-2 px-2 sm:flex-row sm:items-center sm:justify-between sm:px-4"
        aria-hidden={!hasGlobe}
      >
        <div
          className={`${hudCardClass} pointer-events-auto sm:ml-0`}
          style={{ borderColor: "rgba(93, 202, 165, 0.45)" }}
        >
          <h3 className="mb-2 text-sm font-medium text-[#5DCAA5]">Landsat 8</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-[11px] text-zinc-200 sm:text-xs">
            <dt className="text-zinc-500">Latitud</dt>
            <dd ref={hudL8Lat} className="font-variant-numeric tabular-nums">
              —
            </dd>
            <dt className="text-zinc-500">Longitud</dt>
            <dd ref={hudL8Lon} className="font-variant-numeric tabular-nums">
              —
            </dd>
            <dt className="text-zinc-500">Altitud</dt>
            <dd>
              <span ref={hudL8Alt} className="font-variant-numeric tabular-nums">
                —
              </span>{" "}
              km
            </dd>
            <dt className="text-zinc-500">Velocidad</dt>
            <dd>
              <span ref={hudL8Vel} className="font-variant-numeric tabular-nums">
                —
              </span>{" "}
              km/s
            </dd>
          </dl>
        </div>
        <div
          className={`${hudCardClass} pointer-events-auto sm:mr-0`}
          style={{ borderColor: "rgba(133, 183, 235, 0.45)" }}
        >
          <h3 className="mb-2 text-sm font-medium text-[#85B7EB]">Landsat 9</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-[11px] text-zinc-200 sm:text-xs">
            <dt className="text-zinc-500">Latitud</dt>
            <dd ref={hudL9Lat} className="font-variant-numeric tabular-nums">
              —
            </dd>
            <dt className="text-zinc-500">Longitud</dt>
            <dd ref={hudL9Lon} className="font-variant-numeric tabular-nums">
              —
            </dd>
            <dt className="text-zinc-500">Altitud</dt>
            <dd>
              <span ref={hudL9Alt} className="font-variant-numeric tabular-nums">
                —
              </span>{" "}
              km
            </dd>
            <dt className="text-zinc-500">Velocidad</dt>
            <dd>
              <span ref={hudL9Vel} className="font-variant-numeric tabular-nums">
                —
              </span>{" "}
              km/s
            </dd>
          </dl>
        </div>
      </div>

      <div className="absolute bottom-[max(5.5rem,env(safe-area-inset-bottom))] left-1/2 z-[25] flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/15 bg-black/50 px-3 py-2 backdrop-blur-md">
        <span className="mr-1 text-[11px] uppercase tracking-wide text-zinc-500">Vista</span>
        <button
          type="button"
          onClick={() => setShowOrbits((v) => !v)}
          className={`rounded-full border px-3 py-1 text-xs ${
            showOrbits
              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
              : "border-white/15 bg-white/5 text-zinc-400"
          }`}
        >
          Órbitas
        </button>
        <button
          type="button"
          onClick={() => setShowTrails((v) => !v)}
          className={`rounded-full border px-3 py-1 text-xs ${
            showTrails
              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
              : "border-white/15 bg-white/5 text-zinc-400"
          }`}
        >
          Estelas
        </button>
        <button
          type="button"
          onClick={() => setShowFootprints((v) => !v)}
          className={`rounded-full border px-3 py-1 text-xs ${
            showFootprints
              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
              : "border-white/15 bg-white/5 text-zinc-400"
          }`}
        >
          Footprints
        </button>
        <span className="mx-2 hidden h-4 w-px bg-white/15 sm:inline" />
        <span className="w-full text-[11px] uppercase tracking-wide text-zinc-500 sm:w-auto">
          Velocidad
        </span>
        {([1, 100, 500] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSpeedMult(s)}
            className={`rounded-full border px-3 py-1 text-xs ${
              speedMult === s
                ? "border-amber-400/40 bg-amber-500/20 text-amber-100"
                : "border-white/15 bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
