"use client";

import dynamic from "next/dynamic";

const Planetarium = dynamic(() => import("@/components/Planetarium"), {
  ssr: false,
});

export default function PlanetariumDynamic() {
  return <Planetarium />;
}
