"use client";

import { useCallback, useMemo, useState } from "react";
import { daysFromJ2000Ms } from "@/lib/orbitalMechanics";

/** Por defecto coincide con ×10 000: a ×1 el movimiento orbital es casi imperceptible en pantalla. */
export const DEFAULT_SIM_SPEED = 10_000;

export function useSimulationTime() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [speedMultiplier, setSpeedMultiplier] = useState(DEFAULT_SIM_SPEED);
  const [isPlaying, setIsPlaying] = useState(false);

  const daysFromEpoch = useMemo(
    () => daysFromJ2000Ms(currentDate.getTime()),
    [currentDate]
  );

  const setDate = useCallback((date: Date) => {
    setCurrentDate(new Date(date.getTime()));
  }, []);

  return {
    currentDate,
    setCurrentDate,
    speedMultiplier,
    setSpeedMultiplier,
    isPlaying,
    setIsPlaying,
    setDate,
    daysFromEpoch,
  };
}
