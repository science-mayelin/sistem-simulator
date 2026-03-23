"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { DoubleSide } from "three";
import * as THREE from "three";
import type { CelestialBody } from "@/data/planets";
import { daysFromJ2000Ms, getOrbitalAngle } from "@/lib/orbitalMechanics";
import {
  createPlanetNoiseTexture,
  REAL_TEXTURES,
  textureOptionsForPlanet,
} from "@/lib/proceduralTextures";

type PlanetProps = {
  planet: CelestialBody;
  dateMsRef: MutableRefObject<number>;
  spinActive: boolean;
  showLabels: boolean;
  onSelect: (planet: CelestialBody) => void;
  children?: ReactNode;
};

function SolidFallback({
  planet,
  meshRef,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  planet: CelestialBody;
  meshRef: React.RefObject<Mesh | null>;
  onPointerOver: (e: { stopPropagation: () => void }) => void;
  onPointerOut: () => void;
  onClick: (e: { stopPropagation: () => void }) => void;
}) {
  return (
    <mesh
      ref={meshRef}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      <sphereGeometry args={[planet.radius, 48, 48]} />
      <meshStandardMaterial
        color={planet.color}
        emissive={planet.color}
        emissiveIntensity={0.08}
        roughness={0.78}
        metalness={0.08}
      />
    </mesh>
  );
}

function EarthBody({
  planet,
  meshRef,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  planet: CelestialBody;
  meshRef: React.RefObject<Mesh | null>;
  onPointerOver: (e: { stopPropagation: () => void }) => void;
  onPointerOut: () => void;
  onClick: (e: { stopPropagation: () => void }) => void;
}) {
  const map = useTexture(REAL_TEXTURES.earth);
  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
  }, [map]);

  return (
    <mesh
      ref={meshRef}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      <sphereGeometry args={[planet.radius, 64, 64]} />
      <meshStandardMaterial
        map={map}
        color="#ffffff"
        roughness={0.65}
        metalness={0.05}
      />
    </mesh>
  );
}

function ProceduralBody({
  planet,
  meshRef,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  planet: CelestialBody;
  meshRef: React.RefObject<Mesh | null>;
  onPointerOver: (e: { stopPropagation: () => void }) => void;
  onPointerOut: () => void;
  onClick: (e: { stopPropagation: () => void }) => void;
}) {
  const map = useMemo(() => {
    const opts = textureOptionsForPlanet(planet.name);
    return createPlanetNoiseTexture(planet.color, planet.name, opts);
  }, [planet.color, planet.name]);

  useEffect(() => () => map.dispose(), [map]);

  return (
    <mesh
      ref={meshRef}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      <sphereGeometry args={[planet.radius, 48, 48]} />
      <meshStandardMaterial
        map={map}
        color="#ffffff"
        roughness={0.82}
        metalness={0.06}
      />
    </mesh>
  );
}

function PlanetSurface({
  planet,
  meshRef,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  planet: CelestialBody;
  meshRef: React.RefObject<Mesh | null>;
  onPointerOver: (e: { stopPropagation: () => void }) => void;
  onPointerOut: () => void;
  onClick: (e: { stopPropagation: () => void }) => void;
}) {
  if (planet.name === "Tierra") {
    return (
      <Suspense
        fallback={
          <SolidFallback
            planet={planet}
            meshRef={meshRef}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
            onClick={onClick}
          />
        }
      >
        <EarthBody
          planet={planet}
          meshRef={meshRef}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onClick={onClick}
        />
      </Suspense>
    );
  }

  return (
    <ProceduralBody
      planet={planet}
      meshRef={meshRef}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    />
  );
}

export function Planet({
  planet,
  dateMsRef,
  spinActive,
  showLabels,
  onSelect,
  children,
}: PlanetProps) {
  const orbitRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    const pivot = orbitRef.current;
    if (pivot) {
      const days = daysFromJ2000Ms(dateMsRef.current);
      pivot.rotation.y = getOrbitalAngle(planet.name, days);
    }
    if (meshRef.current && spinActive) {
      meshRef.current.rotation.y += planet.rotationSpeed * delta;
    }
  });

  const handlers = {
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setHovered(true);
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      setHovered(false);
      document.body.style.cursor = "auto";
    },
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onSelect(planet);
    },
  };

  return (
    <group ref={orbitRef}>
      <group position={[planet.distance, 0, 0]}>
        <group rotation={[planet.tilt, 0, 0]}>
          <PlanetSurface planet={planet} meshRef={meshRef} {...handlers} />
          {planet.hasRing && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry
                args={[planet.radius * 1.45, planet.radius * 2.35, 96]}
              />
              <meshBasicMaterial
                color="#d4c4a8"
                transparent
                opacity={0.55}
                side={DoubleSide}
                depthWrite={false}
              />
            </mesh>
          )}
          {children}
        </group>
        {showLabels && hovered && (
          <Html center distanceFactor={28} style={{ pointerEvents: "none" }}>
            <div className="whitespace-nowrap rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white shadow-lg">
              {planet.name}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
