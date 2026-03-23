/**
 * Extractor de eventos desde texto libre
 * 
 * Extrae fecha, hora y descripción de eventos desde texto natural.
 * Soporta múltiples formatos de fecha y hora en español.
 * 
 * Ejemplos de texto soportado:
 * - "Reunión el 15 de diciembre a las 3pm"
 * - "Examen final el 20/12/2024 a las 14:30"
 * - "Entrega de trabajo mañana a las 10:00"
 * - "Clase el próximo lunes a las 9am"
 */

import { ExtractedEvent } from '@/types/calendar';

/**
 * Extrae eventos desde un texto completo
 * Puede extraer múltiples eventos si el texto los contiene
 */
export function extractEventsFromText(text: string): ExtractedEvent[] {
  const events: ExtractedEvent[] = [];
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  for (const line of lines) {
    const event = extractEventFromLine(line.trim());
    if (event) {
      events.push(event);
    }
  }

  // Si no se encontraron eventos en líneas separadas, intentar en el texto completo
  if (events.length === 0) {
    const event = extractEventFromLine(text);
    if (event) {
      events.push(event);
    }
  }

  return events;
}

/**
 * Extrae un evento desde una línea de texto
 */
function extractEventFromLine(text: string): ExtractedEvent | null {
  if (!text || text.trim().length === 0) {
    return null;
  }

  // Normalizar texto: convertir a minúsculas para matching, pero mantener original
  const normalizedText = text.toLowerCase();
  
  // Extraer fecha
  const date = extractDate(normalizedText, text);
  if (!date) {
    return null; // Si no hay fecha, no es un evento válido
  }

  // Extraer hora
  const time = extractTime(normalizedText);

  // Extraer descripción (todo el texto menos las partes de fecha/hora)
  const description = extractDescription(text, date, time);

  // Calcular confianza basada en qué tan bien se extrajo la información
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (date && time && description.length > 10) {
    confidence = 'high';
  } else if (!date || description.length < 5) {
    confidence = 'low';
  }

  return {
    date,
    time,
    description: description.trim() || 'Evento sin descripción',
    confidence,
  };
}

/**
 * Extrae la fecha del texto
 * Soporta múltiples formatos:
 * - "15 de diciembre"
 * - "15/12/2024"
 * - "15-12-2024"
 * - "2024-12-15"
 * - "mañana", "pasado mañana"
 * - "próximo lunes", "próximo martes", etc.
 */
function extractDate(normalizedText: string, originalText: string): Date | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Fechas relativas comunes
  if (normalizedText.includes('mañana') || normalizedText.includes('manana')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  if (normalizedText.includes('pasado mañana') || normalizedText.includes('pasado manana')) {
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter;
  }

  // Días de la semana próximos
  const daysOfWeek = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo'];
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (normalizedText.includes(daysOfWeek[i]) || normalizedText.includes(dayNames[i])) {
      const targetDay = i === 0 ? 1 : i === 6 ? 0 : i + 1; // Ajuste para que lunes=1, domingo=0
      const currentDay = today.getDay();
      let daysToAdd = targetDay - currentDay;
      
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Próxima semana
      }
      
      if (normalizedText.includes('próximo') || normalizedText.includes('proximo') || normalizedText.includes('next')) {
        // Ya está calculado para la próxima semana
      } else if (normalizedText.includes('próxima semana') || normalizedText.includes('proxima semana')) {
        daysToAdd += 7;
      }
      
      const date = new Date(today);
      date.setDate(date.getDate() + daysToAdd);
      return date;
    }
  }

  // Formato DD/MM/YYYY o DD-MM-YYYY
  const dateSlashRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
  const dateSlashMatch = originalText.match(dateSlashRegex);
  if (dateSlashMatch) {
    const day = parseInt(dateSlashMatch[1]);
    const month = parseInt(dateSlashMatch[2]) - 1; // Meses son 0-indexed
    const year = parseInt(dateSlashMatch[3].length === 2 ? '20' + dateSlashMatch[3] : dateSlashMatch[3]);
    return new Date(year, month, day);
  }

  // Formato YYYY-MM-DD
  const isoDateRegex = /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/;
  const isoDateMatch = originalText.match(isoDateRegex);
  if (isoDateMatch) {
    const year = parseInt(isoDateMatch[1]);
    const month = parseInt(isoDateMatch[2]) - 1;
    const day = parseInt(isoDateMatch[3]);
    return new Date(year, month, day);
  }

  // Formato "15 de diciembre" o "15 de dic"
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const monthAbbr = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  for (let i = 0; i < months.length; i++) {
    const monthPattern = `(\\d{1,2})\\s+de\\s+${months[i]}`;
    const monthAbbrPattern = `(\\d{1,2})\\s+de\\s+${monthAbbr[i]}`;
    
    const monthMatch = normalizedText.match(new RegExp(monthPattern));
    const monthAbbrMatch = normalizedText.match(new RegExp(monthAbbrPattern));
    
    if (monthMatch || monthAbbrMatch) {
      const day = parseInt((monthMatch || monthAbbrMatch)![1]);
      const year = extractYear(normalizedText) || now.getFullYear();
      return new Date(year, i, day);
    }
  }

  // Si no se encontró fecha específica pero hay indicadores de tiempo, usar hoy
  if (normalizedText.includes('hoy') || normalizedText.includes('today')) {
    return new Date(today);
  }

  return null;
}

/**
 * Extrae el año del texto si está presente
 */
function extractYear(text: string): number | null {
  const yearRegex = /\b(20\d{2})\b/;
  const match = text.match(yearRegex);
  return match ? parseInt(match[1]) : null;
}

/**
 * Extrae la hora del texto
 * Soporta formatos:
 * - "14:30", "14.30"
 * - "3pm", "3:30pm", "15:00"
 * - "a las 3", "a las 15:00"
 */
function extractTime(text: string): string | undefined {
  // Formato 24h: HH:mm o HH.mm
  const time24Regex = /\b(\d{1,2})[:\.](\d{2})\b/;
  const time24Match = text.match(time24Regex);
  if (time24Match) {
    let hours = parseInt(time24Match[1]);
    const minutes = time24Match[2];
    
    // Si hay "pm" o "p.m." y las horas son < 12, sumar 12
    if ((text.includes('pm') || text.includes('p.m.') || text.includes('p m')) && hours < 12) {
      hours += 12;
    }
    // Si hay "am" o "a.m." y las horas son 12, convertir a 0
    if ((text.includes('am') || text.includes('a.m.') || text.includes('a m')) && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  // Formato simple con am/pm: "3pm", "3:30pm"
  const timeAmPmRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.|a m|p m)\b/;
  const timeAmPmMatch = text.match(timeAmPmRegex);
  if (timeAmPmMatch) {
    let hours = parseInt(timeAmPmMatch[1]);
    const minutes = timeAmPmMatch[2] || '00';
    const period = timeAmPmMatch[3].toLowerCase();

    if (period.includes('pm') || period.includes('p')) {
      if (hours < 12) hours += 12;
    } else {
      if (hours === 12) hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  // Formato "a las X" donde X es la hora
  const timeSimpleRegex = /a\s+las\s+(\d{1,2})(?::(\d{2}))?/;
  const timeSimpleMatch = text.match(timeSimpleRegex);
  if (timeSimpleMatch) {
    let hours = parseInt(timeSimpleMatch[1]);
    const minutes = timeSimpleMatch[2] || '00';
    
    // Intentar detectar si es PM basado en contexto
    if (hours < 12 && (text.includes('pm') || text.includes('p.m.') || text.includes('tarde') || text.includes('noche'))) {
      hours += 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  return undefined;
}

/**
 * Extrae la descripción del evento
 * Remueve las partes de fecha y hora del texto original
 */
function extractDescription(originalText: string, date: Date, time?: string): string {
  let description = originalText;

  // Remover patrones de fecha
  description = description.replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g, '');
  description = description.replace(/\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/g, '');
  description = description.replace(/\d{1,2}\s+de\s+\w+/gi, '');
  description = description.replace(/\b(mañana|manana|pasado mañana|pasado manana|hoy|today)\b/gi, '');
  description = description.replace(/\b(próximo|proximo|next)\s+\w+/gi, '');
  description = description.replace(/\b(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\b/gi, '');

  // Remover patrones de hora
  if (time) {
    description = description.replace(/\d{1,2}[:\.]\d{2}/g, '');
    description = description.replace(/\d{1,2}\s*(am|pm|a\.m\.|p\.m\.|a m|p m)/gi, '');
    description = description.replace(/a\s+las\s+\d{1,2}(?::\d{2})?/gi, '');
  }

  // Limpiar espacios múltiples y palabras comunes
  description = description.replace(/\s+/g, ' ');
  description = description.replace(/\b(el|la|los|las|de|del|a|en|por|para)\b/gi, '');
  description = description.trim();

  // Si la descripción quedó muy corta, usar el texto original sin las partes de fecha/hora más obvias
  if (description.length < 10) {
    description = originalText
      .replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g, '')
      .replace(/\d{1,2}[:\.]\d{2}/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return description || 'Evento';
}
