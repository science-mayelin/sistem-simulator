export type EventType = "flare" | "cme" | "gst" | "earth" | "apod";

export type EventSeverity = "high" | "medium" | "low" | "info" | "apod";

export type EventFeedItem = {
  id: string;
  type: EventType;
  date: string;
  title: string;
  body: string;
  severity: EventSeverity;
  source: string;
  severityLabel?: string;
  imageUrl?: string;
  hdUrl?: string;
  copyright?: string;
  coords?: number[] | null;
  raw: unknown;
};

export type EventFeedResponse = {
  feed: EventFeedItem[];
  range: { start: string; end: string };
  fetchedAt: string;
};
