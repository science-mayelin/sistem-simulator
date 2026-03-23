/**
 * Tipos para el sistema de calendario
 */

export interface CalendarEvent {
  id: string;
  date: Date;
  time?: string; // Formato HH:mm
  description: string;
  fullText?: string; // Texto original del que se extrajo
}

export interface ExtractedEvent {
  date: Date;
  time?: string;
  description: string;
  confidence: 'high' | 'medium' | 'low'; // Confianza en la extracción
}
