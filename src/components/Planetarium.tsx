"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Group, Mesh } from "three";
import * as THREE from "three";
import { Sun } from "@/components/Sun";
import { Planet } from "@/components/Planet";
import { OrbitRing } from "@/components/OrbitRing";
import { StarField } from "@/components/StarField";
import { OortCloud } from "@/components/OortCloud";
import { TimeControls } from "@/components/TimeControls";
import { SearchBar } from "@/components/SearchBar";
import { AppMenu } from "@/components/AppMenu";
import { NASAPanel } from "@/components/NASAPanel";
import { BodyDetailPanel } from "@/components/BodyDetailPanel";
import { planets } from "@/data/planets";
import type { CelestialBody } from "@/data/planets";
import { DEFAULT_SIM_SPEED, useSimulationTime } from "@/hooks/useSimulationTime";
import { useCameraFlight } from "@/hooks/useCameraFlight";
import {
  daysFromJ2000Ms,
  getMoonOrbitAngle,
} from "@/lib/orbitalMechanics";
import { getCelestialWorldPosition } from "@/lib/celestialPositions";
import { REAL_TEXTURES } from "@/lib/proceduralTextures";

function MoonMeshSolid({
  moonMesh,
  orbitRadius,
  moonRadius,
}: {
  moonMesh: RefObject<Mesh | null>;
  orbitRadius: number;
  moonRadius: number;
}) {
  return (
    <mesh ref={moonMesh} position={[orbitRadius, 0, 0]}>
      <sphereGeometry args={[moonRadius, 32, 32]} />
      <meshStandardMaterial
        color="#c8c8c8"
        emissive="#9fa6b0"
        emissiveIntensity={0.05}
        roughness={0.92}
        metalness={0.02}
      />
    </mesh>
  );
}

function MoonMeshTextured({
  moonMesh,
  orbitRadius,
  moonRadius,
}: {
  moonMesh: RefObject<Mesh | null>;
  orbitRadius: number;
  moonRadius: number;
}) {
  const map = useTexture(REAL_TEXTURES.moon);
  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
  }, [map]);

  return (
    <mesh ref={moonMesh} position={[orbitRadius, 0, 0]}>
      <sphereGeometry args={[moonRadius, 32, 32]} />
      <meshStandardMaterial
        map={map}
        color="#ffffff"
        roughness={0.9}
        metalness={0.02}
      />
    </mesh>
  );
}

function MoonMesh({
  orbitRadius,
  moonRadius,
  dateMsRef,
  spinActive,
}: {
  orbitRadius: number;
  moonRadius: number;
  dateMsRef: MutableRefObject<number>;
  spinActive: boolean;
}) {
  const moonPivot = useRef<Group>(null);
  const moonMesh = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const days = daysFromJ2000Ms(dateMsRef.current);
    const orbitAngle = getMoonOrbitAngle(days);
    if (moonPivot.current) moonPivot.current.rotation.y = orbitAngle;
    if (moonMesh.current && spinActive) {
      moonMesh.current.rotation.y += 0.45 * delta;
    }
  });

  return (
    <group ref={moonPivot}>
      <Suspense
        fallback={
          <MoonMeshSolid moonMesh={moonMesh} orbitRadius={orbitRadius} moonRadius={moonRadius} />
        }
      >
        <MoonMeshTextured moonMesh={moonMesh} orbitRadius={orbitRadius} moonRadius={moonRadius} />
      </Suspense>
    </group>
  );
}

function CameraFlightBridge({
  controlsRef,
  onReady,
}: {
  controlsRef: RefObject<OrbitControlsImpl | null>;
  onReady: (
    fn: (body: CelestialBody, pos: THREE.Vector3) => void
  ) => void;
}) {
  const { flyTo } = useCameraFlight(controlsRef);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;
  useEffect(() => {
    readyRef.current(flyTo);
  }, [flyTo]);
  return null;
}

function SceneControls({
  topViewNonce,
  controlsRef,
}: {
  topViewNonce: number;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (topViewNonce === 0) return;
    camera.position.set(0, 200, 0.01);
    const ctrl = controlsRef.current;
    if (ctrl) {
      ctrl.target.set(0, 0, 0);
      ctrl.update();
    }
  }, [topViewNonce, camera, controlsRef]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={30}
      maxDistance={300}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

function Scene({
  dateMsRef,
  showOrbits,
  showLabels,
  onSelectPlanet,
  topViewNonce,
  controlsRef,
  onFlyToReady,
  spinActive,
}: {
  dateMsRef: MutableRefObject<number>;
  showOrbits: boolean;
  showLabels: boolean;
  onSelectPlanet: (p: CelestialBody) => void;
  topViewNonce: number;
  controlsRef: RefObject<OrbitControlsImpl | null>;
  onFlyToReady: (fn: (b: CelestialBody, v: THREE.Vector3) => void) => void;
  spinActive: boolean;
}) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight
        args={["#9cc8ff", "#241a12", 0.22]}
        position={[0, 80, 0]}
      />
      <Sun />
      <StarField />
      <OortCloud />
      {planets.map((p) => (
        <OrbitRing key={`ring-${p.name}`} radius={p.distance} visible={showOrbits} />
      ))}
      {planets.map((p) =>
        p.name === "Tierra" ? (
          <Planet
            key={p.name}
            planet={p}
            dateMsRef={dateMsRef}
            spinActive={spinActive}
            showLabels={showLabels}
            onSelect={onSelectPlanet}
          >
            <MoonMesh
              orbitRadius={p.radius + 2.4}
              moonRadius={0.28}
              dateMsRef={dateMsRef}
              spinActive={spinActive}
            />
          </Planet>
        ) : (
          <Planet
            key={p.name}
            planet={p}
            dateMsRef={dateMsRef}
            spinActive={spinActive}
            showLabels={showLabels}
            onSelect={onSelectPlanet}
          />
        )
      )}
      <SceneControls topViewNonce={topViewNonce} controlsRef={controlsRef} />
      <CameraFlightBridge controlsRef={controlsRef} onReady={onFlyToReady} />
    </>
  );
}

export default function Planetarium() {
  const {
    currentDate,
    setDate: setDateState,
    speedMultiplier,
    setSpeedMultiplier,
    isPlaying,
    setIsPlaying,
  } = useSimulationTime();

  const dateMsRef = useRef(currentDate.getTime());

  const simStateRef = useRef({
    isPlaying: false,
    speedMultiplier: DEFAULT_SIM_SPEED,
  });
  simStateRef.current.isPlaying = isPlaying;
  simStateRef.current.speedMultiplier = speedMultiplier;

  const setDate = useCallback(
    (d: Date) => {
      dateMsRef.current = d.getTime();
      setDateState(d);
    },
    [setDateState]
  );

  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [topViewNonce, setTopViewNonce] = useState(0);
  const [nasaCollapsed, setNasaCollapsed] = useState(false);

  const controlsRef = useRef<OrbitControlsImpl>(null);
  const flyToRef = useRef<((b: CelestialBody, v: THREE.Vector3) => void) | null>(
    null
  );

  const onFlyToReady = useCallback(
    (fn: (b: CelestialBody, v: THREE.Vector3) => void) => {
      flyToRef.current = fn;
    },
    []
  );

  const handleSelectBody = useCallback((body: CelestialBody) => {
    setSelectedBody(body);
    const days = daysFromJ2000Ms(dateMsRef.current);
    const pos = getCelestialWorldPosition(body, days);
    flyToRef.current?.(body, pos);
  }, []);

  const spinActive = isPlaying;

  useEffect(() => {
    let rafId: number;
    let last = performance.now();
    let hudAccum = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.25);
      last = now;

      const { isPlaying: play, speedMultiplier: spd } = simStateRef.current;
      if (play && spd > 0) {
        dateMsRef.current += dt * 1000 * spd;
        hudAccum += dt;
        if (hudAccum >= 0.12) {
          hudAccum = 0;
          setDateState(new Date(dateMsRef.current));
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [dateMsRef, setDateState]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black pb-44">
      <div className="absolute inset-0 h-full w-full">
        <Canvas
          className="h-full w-full"
          style={{ width: "100vw", height: "100vh" }}
          camera={{ position: [0, 64, 128], fov: 50, near: 0.1, far: 2000 }}
          gl={{ antialias: true, alpha: false }}
          frameloop="always"
        >
          <Scene
            dateMsRef={dateMsRef}
            showOrbits={showOrbits}
            showLabels={showLabels}
            onSelectPlanet={handleSelectBody}
            topViewNonce={topViewNonce}
            controlsRef={controlsRef}
            onFlyToReady={onFlyToReady}
            spinActive={spinActive}
          />
        </Canvas>
      </div>

      <AppMenu />
      <SearchBar onSelect={handleSelectBody} />

      <NASAPanel
        selectedBody={selectedBody}
        collapsed={nasaCollapsed}
        onToggleCollapsed={() => setNasaCollapsed((c) => !c)}
      />

      <BodyDetailPanel
        body={selectedBody}
        onClose={() => setSelectedBody(null)}
      />

      <TimeControls
        currentDate={currentDate}
        onDateChange={setDate}
        speedMultiplier={speedMultiplier}
        onSpeedMultiplierChange={setSpeedMultiplier}
        isPlaying={isPlaying}
        onIsPlayingChange={setIsPlaying}
        showOrbits={showOrbits}
        onToggleOrbits={() => setShowOrbits((v) => !v)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((v) => !v)}
        onTopView={() => setTopViewNonce((n) => n + 1)}
      />
    </div>
  );
}
