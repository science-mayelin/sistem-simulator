export type PlanetFacts = {
  diameter: string;
  dayLength: string;
  yearLength: string;
  moons: number;
  temperature: string;
};

export type CelestialCategory =
  | "planet"
  | "dwarf-planet"
  | "moon"
  | "asteroid";

/** Detalle de satélites (nombre pedido en spec: moons como array de datos) */
export type MoonDetail = {
  name: string;
  radius: number;
  distance: number;
  orbitalPeriod: string;
};

export type CelestialBody = {
  name: string;
  radius: number;
  distance: number;
  orbitalSpeed: number;
  rotationSpeed: number;
  color: string;
  tilt: number;
  facts: PlanetFacts;
  hasRing?: boolean;
  aliases: string[];
  /** Satélites principales (el conteo resumido sigue en facts.moons) */
  moons: MoonDetail[];
  category: CelestialCategory;
  /** Orbita alrededor de este cuerpo (para lunas / planetas enanos) */
  parentName?: string;
};

/** Compatibilidad con código que solo usa los 8 planetas clásicos */
export type PlanetData = CelestialBody;

const moonDetail = (
  name: string,
  radius: number,
  distance: number,
  orbitalPeriod: string
): MoonDetail => ({ name, radius, distance, orbitalPeriod });

export const CELESTIAL_BODIES: CelestialBody[] = [
  {
    name: "Mercurio",
    radius: 0.38,
    distance: 12,
    orbitalSpeed: 0.48,
    rotationSpeed: 0.3,
    color: "#B7B8B9",
    tilt: 0.034,
    aliases: ["mercury", "mercurio"],
    moons: [],
    category: "planet",
    facts: {
      diameter: "4.879 km",
      dayLength: "58,6 días terrestres",
      yearLength: "88 días terrestres",
      moons: 0,
      temperature: "-173 °C a 427 °C",
    },
  },
  {
    name: "Venus",
    radius: 0.95,
    distance: 16,
    orbitalSpeed: 0.35,
    rotationSpeed: -0.05,
    color: "#E6C288",
    tilt: 0.177,
    aliases: ["venus", "venus"],
    moons: [],
    category: "planet",
    facts: {
      diameter: "12.104 km",
      dayLength: "243 días terrestres",
      yearLength: "225 días terrestres",
      moons: 0,
      temperature: "462 °C (media)",
    },
  },
  {
    name: "Tierra",
    radius: 1,
    distance: 22,
    orbitalSpeed: 0.3,
    rotationSpeed: 1.2,
    color: "#4B6CB7",
    tilt: 0.409,
    aliases: ["earth", "tierra", "blue marble", "mundo"],
    moons: [
      moonDetail("Luna", 0.27, 2.6, "27,3 días"),
    ],
    category: "planet",
    facts: {
      diameter: "12.742 km",
      dayLength: "24 h",
      yearLength: "365,25 días",
      moons: 1,
      temperature: "15 °C (media)",
    },
  },
  {
    name: "Marte",
    radius: 0.53,
    distance: 28,
    orbitalSpeed: 0.24,
    rotationSpeed: 1.1,
    color: "#C1440E",
    tilt: 0.439,
    aliases: ["mars", "marte", "the red planet"],
    moons: [
      moonDetail("Fobos", 0.015, 0.6, "0,3 días"),
      moonDetail("Deimos", 0.008, 0.8, "1,3 días"),
    ],
    category: "planet",
    facts: {
      diameter: "6.779 km",
      dayLength: "24 h 37 min",
      yearLength: "687 días terrestres",
      moons: 2,
      temperature: "-65 °C (media)",
    },
  },
  {
    name: "Júpiter",
    radius: 2.8,
    distance: 45,
    orbitalSpeed: 0.13,
    rotationSpeed: 2.4,
    color: "#D9A066",
    tilt: 0.054,
    aliases: ["jupiter", "júpiter"],
    moons: [
      moonDetail("Ganímedes", 0.41, 5.2, "7,2 días"),
      moonDetail("Calisto", 0.38, 9.0, "16,7 días"),
      moonDetail("Io", 0.28, 3.5, "1,8 días"),
      moonDetail("Europa", 0.24, 4.6, "3,5 días"),
    ],
    category: "planet",
    facts: {
      diameter: "139.820 km",
      dayLength: "9 h 56 min",
      yearLength: "11,86 años terrestres",
      moons: 95,
      temperature: "-110 °C (nivel nubes)",
    },
  },
  {
    name: "Saturno",
    radius: 2.4,
    distance: 65,
    orbitalSpeed: 0.1,
    rotationSpeed: 2.2,
    color: "#F4D59E",
    tilt: 0.466,
    hasRing: true,
    aliases: ["saturn", "saturno"],
    moons: [
      moonDetail("Titán", 0.4, 6.5, "16 días"),
      moonDetail("Encélado", 0.12, 4.2, "1,4 días"),
      moonDetail("Mimas", 0.08, 3.5, "0,9 días"),
    ],
    category: "planet",
    facts: {
      diameter: "116.460 km",
      dayLength: "10 h 34 min",
      yearLength: "29,5 años terrestres",
      moons: 146,
      temperature: "-140 °C (nivel nubes)",
    },
  },
  {
    name: "Urano",
    radius: 1.7,
    distance: 90,
    orbitalSpeed: 0.07,
    rotationSpeed: 1.4,
    color: "#9FD0E8",
    tilt: 1.71,
    aliases: ["uranus", "urano"],
    moons: [
      moonDetail("Titania", 0.09, 0.9, "8,7 días"),
      moonDetail("Oberón", 0.09, 1.0, "13,5 días"),
    ],
    category: "planet",
    facts: {
      diameter: "50.724 km",
      dayLength: "17 h 14 min",
      yearLength: "84 años terrestres",
      moons: 28,
      temperature: "-195 °C",
    },
  },
  {
    name: "Neptuno",
    radius: 1.65,
    distance: 115,
    orbitalSpeed: 0.055,
    rotationSpeed: 1.5,
    color: "#4169E1",
    tilt: 0.495,
    aliases: ["neptune", "neptuno"],
    moons: [
      moonDetail("Tritón", 0.21, 1.0, "5,9 días"),
    ],
    category: "planet",
    facts: {
      diameter: "49.244 km",
      dayLength: "16 h 6 min",
      yearLength: "165 años terrestres",
      moons: 16,
      temperature: "-200 °C",
    },
  },
  {
    name: "Luna",
    radius: 0.27,
    distance: 0,
    orbitalSpeed: 0,
    rotationSpeed: 0.05,
    color: "#c8c8c8",
    tilt: 0.026,
    aliases: ["moon", "luna", "selene"],
    parentName: "Tierra",
    moons: [],
    category: "moon",
    facts: {
      diameter: "3.474 km",
      dayLength: "27,3 días (sincronizada)",
      yearLength: "27,3 días",
      moons: 0,
      temperature: "-20 °C a 120 °C",
    },
  },
  {
    name: "Plutón",
    radius: 0.2,
    distance: 0,
    orbitalSpeed: 0,
    rotationSpeed: 0.05,
    color: "#c9b8a4",
    tilt: 2.99,
    aliases: ["pluto", "plutón", "134340 pluto"],
    moons: [
      moonDetail("Caronte", 0.12, 4.2, "6,4 días"),
    ],
    category: "dwarf-planet",
    facts: {
      diameter: "2.376 km",
      dayLength: "6,4 días",
      yearLength: "248 años terrestres",
      moons: 5,
      temperature: "-230 °C a -210 °C",
    },
  },
  {
    name: "Caronte",
    radius: 0.12,
    distance: 0,
    orbitalSpeed: 0,
    rotationSpeed: 0.02,
    color: "#9a9a9a",
    tilt: 0,
    aliases: ["charon", "caronte"],
    parentName: "Plutón",
    moons: [],
    category: "moon",
    facts: {
      diameter: "1.212 km",
      dayLength: "6,4 días (sincronizada con Plutón)",
      yearLength: "6,4 días",
      moons: 0,
      temperature: "-220 °C",
    },
  },
  {
    name: "Titán",
    radius: 0.4,
    distance: 0,
    orbitalSpeed: 0,
    rotationSpeed: 0.08,
    color: "#e8c080",
    tilt: 0.03,
    aliases: ["titan", "titán", "saturn vi"],
    parentName: "Saturno",
    moons: [],
    category: "moon",
    facts: {
      diameter: "5.149 km",
      dayLength: "16 días",
      yearLength: "16 días",
      moons: 0,
      temperature: "-179 °C",
    },
  },
  {
    name: "Europa",
    radius: 0.24,
    distance: 0,
    orbitalSpeed: 0,
    rotationSpeed: 0.1,
    color: "#b8c0d0",
    tilt: 0.016,
    aliases: ["europa", "jupiter ii"],
    parentName: "Júpiter",
    moons: [],
    category: "moon",
    facts: {
      diameter: "3.121 km",
      dayLength: "3,5 días",
      yearLength: "3,5 días",
      moons: 0,
      temperature: "-160 °C",
    },
  },
  {
    name: "Ganímedes",
    radius: 0.41,
    distance: 0,
    orbitalSpeed: 0,
    rotationSpeed: 0.05,
    color: "#a89880",
    tilt: 0.036,
    aliases: ["ganymede", "ganímedes", "jupiter iii"],
    parentName: "Júpiter",
    moons: [],
    category: "moon",
    facts: {
      diameter: "5.268 km",
      dayLength: "7,2 días",
      yearLength: "7,2 días",
      moons: 0,
      temperature: "-160 °C",
    },
  },
  {
    name: "Nube de Oort",
    radius: 1.2,
    distance: 0,
    orbitalSpeed: 0,
    rotationSpeed: 0,
    color: "#a7d7ff",
    tilt: 0,
    aliases: ["oort", "nube de oort", "oort cloud", "cometas"],
    moons: [],
    category: "asteroid",
    facts: {
      diameter: "~2.000 a 100.000 UA (estimado)",
      dayLength: "No aplica",
      yearLength: "Órbitas de miles de años",
      moons: 0,
      temperature: "Muy baja (entorno interestelar)",
    },
  },
];

export const planets: CelestialBody[] = CELESTIAL_BODIES.filter(
  (b) =>
    b.category === "planet" &&
    [
      "Mercurio",
      "Venus",
      "Tierra",
      "Marte",
      "Júpiter",
      "Saturno",
      "Urano",
      "Neptuno",
    ].includes(b.name)
);

export function findCelestialBody(name: string): CelestialBody | undefined {
  return CELESTIAL_BODIES.find((b) => b.name === name);
}
