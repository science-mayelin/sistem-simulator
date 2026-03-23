export type ApodResponse = {
  title: string;
  title_es?: string;
  explanation: string;
  explanation_es?: string;
  url: string;
  /** Alta resolución (cuando existe) */
  hdurl?: string;
  /** Miniatura si el APOD es vídeo */
  thumbnail_url?: string;
  media_type: string;
  date: string;
};

export type NeoApproach = {
  name: string;
  estimated_diameter: { meters: { estimated_diameter_min: number; estimated_diameter_max: number } };
  close_approach_data: Array<{ miss_distance: { kilometers: string } }>;
  is_potentially_hazardous_asteroid: boolean;
};

export type NeoFeedResponse = {
  near_earth_objects: Record<string, NeoApproach[]>;
};

export type PlanetScienceFacts = {
  overview: string;
  composition?: string;
  exploration?: string;
  source: string;
};

const PLANET_SCIENCE: Record<string, PlanetScienceFacts> = {
  Mercurio: {
    overview:
      "Planeta rocoso y el más pequeño del sistema solar; carece de atmósfera densa y presenta cráteres como la Luna.",
    composition: "Núcleo metálico grande (~85% del radio planetario), manto silicatado y corteza delgada.",
    exploration: "Explorado por Mariner 10 y MESSENGER.",
    source: "NASA Science — Mercury",
  },
  Venus: {
    overview:
      "Envuelto en nubes de ácido sulfúrico; efecto invernadero extremo con superficie caliente y presión alta.",
    composition: "Corteza basáltica, manto silicatado; atmósfera densa de CO₂ y nubes de ácido sulfúrico.",
    exploration: "Magellan, Venus Express, Akatsuki.",
    source: "NASA Science — Venus",
  },
  Tierra: {
    overview:
      "Único planeta conocido con océanos líquidos en la superficie y vida; atmósfera rica en N₂ y O₂.",
    composition: "Corteza granítica y basáltica, manto silicatado, núcleo metálico Fe-Ni.",
    exploration: "Innumerables misiones orbitales y programas tripulados (Apollo, ISS).",
    source: "NASA Science — Earth",
  },
  Marte: {
    overview:
      "Planeta desértico con casquetes polares de hielo; evidencia de agua líquida en el pasado.",
    composition: "Corteza basáltica, manto silicatado, núcleo metálico (parcialmente líquido).",
    exploration: "Rovers Perseverance, Curiosity; orbitadores Mars Reconnaissance Orbiter, etc.",
    source: "NASA Science — Mars",
  },
  Júpiter: {
    overview:
      "Gigante gaseoso dominado por hidrógeno y helio; Gran Mancha Roja es una tormenta gigantesca.",
    composition: "H₂ y He en la atmósfera; posible núcleo rocoso; metales en el interior profundo.",
    exploration: "Galileo, Juno (en órbita polar).",
    source: "NASA Science — Jupiter",
  },
  Saturno: {
    overview:
      "Gigante gaseoso famoso por sus anillos de hielo y polvo; densidad menor que el agua.",
    composition: "H₂ y He; núcleo rocoso/hielo; anillos de partículas de hielo.",
    exploration: "Cassini-Huygens (2004–2017).",
    source: "NASA Science — Saturn",
  },
  Urano: {
    overview:
      "Gigante de hielo con eje de rotación muy inclinado; atmósfera de hidrógeno, helio y metano.",
    composition: "Hielos (agua, amoníaco, metano) y roca en el interior; campo magnético inclinado.",
    exploration: "Voyager 2 (1986).",
    source: "NASA Science — Uranus",
  },
  Neptuno: {
    overview:
      "Gigante de hielo más lejano; vientos entre los más rápidos del sistema solar.",
    composition: "Similar a Urano: hielos y roca; atmósfera de H₂, He y CH₄.",
    exploration: "Voyager 2 (1989).",
    source: "NASA Science — Neptune",
  },
  Plutón: {
    overview:
      "Planeta enano en el cinturón de Kuiper; superficie de nitrógeno congelado y montañas de agua helada.",
    composition: "Roca y hielo; atmósfera tenue de N₂, CH₄ y CO.",
    exploration: "New Horizons (2015).",
    source: "NASA Science — Pluto",
  },
  Luna: {
    overview:
      "Satélite natural de la Tierra; formado probablemente por un gran impacto temprano (hipótesis del impacto gigante).",
    composition: "Corteza anortosítica; manto silicatado; pequeño núcleo metálico parcialmente fundido.",
    exploration: "Programa Apollo; orbitadores LRO, Artemis (en desarrollo).",
    source: "NASA Science — Earth's Moon",
  },
  Caronte: {
    overview:
      "Luna más grande de Plutón; sistema binario Plutón-Caronte con hemisferios contrastantes.",
    composition: "Hielo de agua y amoníaco; superficie con grietas y cañones.",
    exploration: "New Horizons.",
    source: "NASA New Horizons",
  },
  Titán: {
    overview:
      "Luna de Saturno con atmósfera densa de nitrógeno y lagos de metano y etano en la superficie.",
    composition: "Hielo de agua y roca en el interior; hidrocarburos en superficie y atmósfera.",
    exploration: "Cassini-Huygens (aterrizaje en Titán).",
    source: "NASA Cassini",
  },
  Europa: {
    overview:
      "Luna helada de Júpiter; océano de agua líquida bajo la corteza de hielo (candidata para astrobiología).",
    composition: "Corteza de hielo de agua; océano subsuperficial salado.",
    exploration: "Galileo; Europa Clipper (programada).",
    source: "NASA Europa Clipper",
  },
  Ganímedes: {
    overview:
      "Luna de Júpiter y el satélite más grande del sistema solar; posee campo magnético propio.",
    composition: "Capas de hielo y roca; posible océano subsuperficial.",
    exploration: "Galileo, Juno (pasos cercanos).",
    source: "NASA Science — Ganymede",
  },
};

export function getPlanetScienceFacts(name: string): PlanetScienceFacts | undefined {
  return PLANET_SCIENCE[name];
}

export async function fetchApodClient(): Promise<ApodResponse> {
  const res = await fetch("/api/nasa/apod", { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err === "object" && err && "error" in err
        ? String((err as { error: string }).error)
        : "Error APOD"
    );
  }
  return res.json();
}

export async function fetchNeoClient(): Promise<NeoApproach[]> {
  const res = await fetch("/api/nasa/neo", { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err === "object" && err && "error" in err
        ? String((err as { error: string }).error)
        : "Error NEO"
    );
  }
  return res.json();
}

export function horizonsUnavailable(): { message: string; note: string } {
  return {
    message: "Horizons API",
    note:
      "La API pública de efemérides (Horizons) no está expuesta como JSON simple en api.nasa.gov; se usan datos científicos estáticos enriquecidos en la aplicación.",
  };
}
