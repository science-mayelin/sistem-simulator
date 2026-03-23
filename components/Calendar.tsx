'use client';

/**
 * Componente de Calendario
 * 
 * Muestra eventos en un calendario mensual.
 * Requiere: npm install react-calendar
 */

import { useState } from 'react';
import Calendar from 'react-calendar';
import type { Value } from 'react-calendar/dist/shared/types.js';
import 'react-calendar/dist/Calendar.css';
import { CalendarEvent } from '@/types/calendar';

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
}

export default function CalendarComponent({ events, onDateClick }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Agrupar eventos por fecha
  const eventsByDate = new Map<string, CalendarEvent[]>();
  events.forEach(event => {
    const dateKey = event.date.toISOString().split('T')[0];
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    eventsByDate.get(dateKey)!.push(event);
  });

  // Función para marcar fechas con eventos
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateKey = date.toISOString().split('T')[0];
      const dayEvents = eventsByDate.get(dateKey);
      
      if (dayEvents && dayEvents.length > 0) {
        return (
          <div className="flex flex-col items-center mt-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mb-0.5"></div>
            {dayEvents.length > 1 && (
              <span className="text-xs text-blue-600 font-semibold">
                {dayEvents.length}
              </span>
            )}
          </div>
        );
      }
    }
    return null;
  };

  // Función para aplicar clases CSS a fechas con eventos
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateKey = date.toISOString().split('T')[0];
      const dayEvents = eventsByDate.get(dateKey);
      
      if (dayEvents && dayEvents.length > 0) {
        return 'has-events';
      }
    }
    return null;
  };

  const handleDateChange = (value: Value) => {
    const next = Array.isArray(value) ? value[0] : value;
    if (!next) return;
    setSelectedDate(next);
    onDateClick?.(next);
  };

  // Obtener eventos del día seleccionado
  const selectedDateKey = selectedDate.toISOString().split('T')[0];
  const selectedDayEvents = eventsByDate.get(selectedDateKey) || [];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-zinc-800/50 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
              Calendario de Eventos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {events.length} evento{events.length !== 1 ? 's' : ''} programado{events.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Eventos</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-2">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileContent={tileContent}
              tileClassName={tileClassName}
              className="w-full border-0"
            />
            
            {/* Estilos personalizados para el calendario */}
            <style jsx global>{`
              .react-calendar {
                width: 100%;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 16px;
                font-family: inherit;
                padding: 1rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              
              .dark .react-calendar {
                background: #18181b;
                border-color: #3f3f46;
                color: #f4f4f5;
              }
              
              .react-calendar__tile {
                padding: 1em 0.5em;
                background: none;
                text-align: center;
                line-height: 1.5;
                font-size: 0.9em;
                border-radius: 8px;
                transition: all 0.2s ease;
                position: relative;
              }
              
              .react-calendar__tile:enabled:hover,
              .react-calendar__tile:enabled:focus {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                transform: scale(1.05);
              }
              
              .dark .react-calendar__tile:enabled:hover,
              .dark .react-calendar__tile:enabled:focus {
                background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
              }
              
              .react-calendar__tile--active {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
                color: white !important;
                font-weight: 700;
                box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);
              }
              
              .react-calendar__tile--now {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                font-weight: 700;
                color: #92400e;
              }
              
              .dark .react-calendar__tile--now {
                background: linear-gradient(135deg, #451a03 0%, #78350f 100%);
                color: #fbbf24;
              }
              
              .react-calendar__tile.has-events {
                font-weight: 600;
              }
              
              .react-calendar__tile.has-events:enabled:hover {
                box-shadow: 0 0 0 2px #3b82f6;
              }
              
              .react-calendar__navigation {
                display: flex;
                height: 50px;
                margin-bottom: 1.5em;
                align-items: center;
                justify-content: space-between;
              }
              
              .react-calendar__navigation button {
                min-width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                border: none;
                border-radius: 12px;
                font-size: 18px;
                font-weight: 600;
                color: #374151;
                transition: all 0.2s ease;
              }
              
              .react-calendar__navigation button:enabled:hover,
              .react-calendar__navigation button:enabled:focus {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                transform: scale(1.05);
                color: #1e40af;
              }
              
              .dark .react-calendar__navigation button {
                background: linear-gradient(135deg, #27272a 0%, #3f3f46 100%);
                color: #f4f4f5;
              }
              
              .dark .react-calendar__navigation button:enabled:hover,
              .dark .react-calendar__navigation button:enabled:focus {
                background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                color: #bfdbfe;
              }
              
              .react-calendar__navigation__label {
                font-size: 1.1em;
                font-weight: 700;
                color: #111827;
              }
              
              .dark .react-calendar__navigation__label {
                color: #f4f4f5;
              }
              
              .react-calendar__month-view__weekdays {
                text-align: center;
                text-transform: uppercase;
                font-weight: 700;
                font-size: 0.75em;
                color: #6b7280;
                margin-bottom: 0.5em;
              }
              
              .dark .react-calendar__month-view__weekdays {
                color: #9ca3af;
              }
              
              .react-calendar__month-view__weekdays__weekday {
                padding: 0.75em 0;
              }
              
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 4px;
              }
              
              .dark .custom-scrollbar::-webkit-scrollbar-track {
                background: #27272a;
              }
              
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 4px;
              }
              
              .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #475569;
              }
              
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
            `}</style>
          </div>

          {/* Lista de eventos del día seleccionado */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-zinc-800 dark:to-blue-950/30 rounded-xl p-6 h-full border border-gray-200/50 dark:border-zinc-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {selectedDate.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      day: 'numeric'
                    })}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedDate.toLocaleDateString('es-ES', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              {selectedDayEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayEvents.map((event, index) => (
                    <div
                      key={index}
                      className="group bg-white dark:bg-zinc-700/80 p-4 rounded-xl shadow-md border border-gray-100 dark:border-zinc-600
                               hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600
                               transition-all duration-200 cursor-pointer"
                    >
                      {event.time && (
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 mb-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {event.time}
                        </div>
                      )}
                      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {event.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-zinc-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    No hay eventos programados
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    para este día
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumen de eventos mejorado */}
        {events.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Todos los Eventos
              </h3>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                {events.length} total
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {events
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((event, index) => (
                  <div
                    key={index}
                    className="group bg-gradient-to-br from-gray-50 to-white dark:from-zinc-800 dark:to-zinc-700 
                             p-4 rounded-xl border border-gray-200 dark:border-zinc-600 text-sm
                             hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600
                             transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                    onClick={() => handleDateChange(event.date)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="font-bold text-gray-800 dark:text-gray-100">
                        {event.date.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                      {event.time && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                          {event.time}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                      {event.description}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
