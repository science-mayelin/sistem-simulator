import type { NewsCategory, NewsSource } from "@/types/news";

export const CATEGORY_LABELS: Record<NewsCategory | "all", string> = {
  all: "Todas",
  space: "Espacio",
  cs_ai: "IA e informática",
  physics: "Física",
  biology: "Biología",
  medicine: "Medicina",
  technology: "Tecnología",
  climate: "Clima",
  general: "General",
};

export const NEWS_SOURCE_BADGES: Record<
  "spaceflight" | "hackernews" | "nasa" | "jpl",
  { label: string; color: string; bg: string }
> = {
  spaceflight: { label: "Noticias espaciales", color: "#085041", bg: "#E1F5EE" },
  hackernews: { label: "Hacker News", color: "#633806", bg: "#FAEEDA" },
  nasa: { label: "NASA", color: "#0C447C", bg: "#E6F1FB" },
  jpl: { label: "JPL", color: "#3C3489", bg: "#EEEDFE" },
};

export const PAPER_SOURCE_BADGES: Record<
  "arxiv" | "semantic" | "pubmed" | "openalex",
  { label: string; color: string; bg: string }
> = {
  arxiv: { label: "arXiv", color: "#712B13", bg: "#FAECE7" },
  semantic: {
    label: "Semantic Scholar (académico)",
    color: "#0C447C",
    bg: "#E6F1FB",
  },
  pubmed: { label: "PubMed", color: "#085041", bg: "#E1F5EE" },
  openalex: { label: "OpenAlex", color: "#3C3489", bg: "#EEEDFE" },
};

/** All sources for filters (label shown in UI). */
export const ALL_SOURCE_OPTIONS: { id: NewsSource; label: string }[] = [
  { id: "spaceflight", label: NEWS_SOURCE_BADGES.spaceflight.label },
  { id: "hackernews", label: NEWS_SOURCE_BADGES.hackernews.label },
  { id: "nasa", label: NEWS_SOURCE_BADGES.nasa.label },
  { id: "jpl", label: NEWS_SOURCE_BADGES.jpl.label },
  { id: "arxiv", label: PAPER_SOURCE_BADGES.arxiv.label },
  { id: "semantic", label: PAPER_SOURCE_BADGES.semantic.label },
  { id: "pubmed", label: PAPER_SOURCE_BADGES.pubmed.label },
  { id: "openalex", label: PAPER_SOURCE_BADGES.openalex.label },
];

const CATEGORY_ACCENT: Record<NewsCategory, string> = {
  space: "from-indigo-950 to-violet-950",
  physics: "from-slate-900 to-zinc-900",
  cs_ai: "from-amber-950/80 to-orange-950/80",
  biology: "from-emerald-950 to-teal-950",
  medicine: "from-rose-950/80 to-red-950/80",
  technology: "from-cyan-950 to-sky-950",
  climate: "from-teal-950 to-cyan-950",
  general: "from-zinc-900 to-neutral-900",
};

export function categoryPlaceholderClass(cat: NewsCategory): string {
  return `bg-gradient-to-br ${CATEGORY_ACCENT[cat]}`;
}

export function categoryShortLabel(cat: NewsCategory): string {
  return CATEGORY_LABELS[cat];
}
