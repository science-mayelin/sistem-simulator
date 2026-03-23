'use client';

/**
 * Página de Calendario
 * 
 * Permite ingresar texto libre y extrae automáticamente
 * fechas, horas y descripciones de eventos para mostrarlos en un calendario.
 */

import { useState } from 'react';
// Opción 1: Calendario con react-calendar (más completo, requiere: npm install react-calendar)
import CalendarComponent from '@/components/Calendar';

// Opción 2: Calendario simple sin dependencias externas (descomentar para usar)
// import CalendarComponent from '@/components/SimpleCalendar';
import { extractEventsFromText } from '@/lib/event-extractor';
import { CalendarEvent } from '@/types/calendar';

export default function CalendarPage() {
  const [inputText, setInputText] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtractEvents = () => {
    if (!inputText.trim()) {
      setError('Por favor, ingresa algún texto');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Extraer eventos del texto
      const extractedEvents = extractEventsFromText(inputText);

      if (extractedEvents.length === 0) {
        setError('No se pudieron extraer eventos del texto. Asegúrate de incluir fechas y descripciones.');
        setIsProcessing(false);
        return;
      }

      // Convertir a CalendarEvent con IDs únicos
      const calendarEvents: CalendarEvent[] = extractedEvents.map((event, index) => ({
        id: `event-${Date.now()}-${index}`,
        date: event.date,
        time: event.time,
        description: event.description,
        fullText: inputText,
      }));

      setEvents(calendarEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el texto');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setEvents([]);
    setError(null);
  };

  // Ejemplos de texto para ayudar al usuario
  const examples = [
    'Reunión el 15 de diciembre a las 3pm',
    'Examen final el 20/12/2024 a las 14:30',
    'Entrega de trabajo mañana a las 10:00',
    'Clase el próximo lunes a las 9am',
  ];

  const handleExampleClick = (example: string) => {
    setInputText(example);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header mejorado */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-gray-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-3">
            Calendario Inteligente
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Extrae automáticamente fechas, horas y descripciones de eventos desde texto natural
          </p>
        </div>

        {/* Formulario de entrada mejorado */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-zinc-800/50 p-8 mb-8 transition-all duration-300 hover:shadow-2xl">
          <div className="mb-6">
            <label
              htmlFor="event-text"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
            >
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Ingresa tus eventos (uno por línea)
            </label>
            <textarea
              id="event-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ejemplo:&#10;Reunión el 15 de diciembre a las 3pm&#10;Examen final el 20/12/2024 a las 14:30&#10;Entrega de trabajo mañana a las 10:00"
              className="w-full h-40 px-5 py-4 border-2 border-gray-200 dark:border-zinc-700 rounded-xl 
                       bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100
                       focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400
                       resize-none transition-all duration-200
                       placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Puedes escribir múltiples eventos, separados por líneas
            </p>
          </div>

          {/* Ejemplos mejorados */}
          <div className="mb-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Ejemplos rápidos:
            </p>
            <div className="flex flex-wrap gap-2.5">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="group px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-700 
                           text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium
                           hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30
                           hover:text-blue-700 dark:hover:text-blue-300
                           border border-gray-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600
                           transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Botones de acción mejorados */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExtractEvents}
              disabled={isProcessing || !inputText.trim()}
              className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold
                       hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                       transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl
                       disabled:shadow-none transform hover:scale-105 disabled:transform-none"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Extraer Eventos
                </>
              )}
            </button>
            
            {events.length > 0 && (
              <button
                onClick={handleClear}
                className="px-6 py-3 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 
                         rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-zinc-700
                         transition-all duration-200 border-2 border-gray-200 dark:border-zinc-700
                         hover:border-gray-300 dark:hover:border-zinc-600 shadow-sm hover:shadow-md
                         flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar
              </button>
            )}
          </div>

          {/* Mensaje de error mejorado */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 
                          rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Error</p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Información sobre eventos extraídos mejorada */}
          {events.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400 
                          rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">¡Éxito!</p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Se extrajeron <span className="font-bold">{events.length}</span> evento{events.length !== 1 ? 's' : ''} del texto
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Calendario con animación */}
        {events.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CalendarComponent events={events} />
          </div>
        )}

        {/* Instrucciones mejoradas */}
        {events.length === 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 
                        border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                  Cómo usar el Calendario Inteligente
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">1</span>
                      <p className="text-sm text-blue-800 dark:text-blue-200">Escribe eventos en texto natural, incluyendo fecha y hora</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">2</span>
                      <p className="text-sm text-blue-800 dark:text-blue-200">Puedes escribir múltiples eventos, uno por línea</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">3</span>
                      <p className="text-sm text-blue-800 dark:text-blue-200">Formatos de fecha: "15 de diciembre", "15/12/2024", "mañana", "próximo lunes"</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">4</span>
                      <p className="text-sm text-indigo-800 dark:text-indigo-200">Formatos de hora: "14:30", "3pm", "a las 15:00"</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">5</span>
                      <p className="text-sm text-indigo-800 dark:text-indigo-200">El sistema extraerá automáticamente la información</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">6</span>
                      <p className="text-sm text-indigo-800 dark:text-indigo-200">Los eventos se mostrarán organizados en el calendario</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
