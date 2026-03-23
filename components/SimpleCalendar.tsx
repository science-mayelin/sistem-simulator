'use client';

/**
 * Componente de Calendario Simple (sin dependencias externas)
 * 
 * Versión alternativa que no requiere react-calendar.
 * Usa HTML/CSS puro para mostrar el calendario.
 */

import { useState } from 'react';
import { CalendarEvent } from '@/types/calendar';

interface SimpleCalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
}

export default function SimpleCalendar({ events, onDateClick }: SimpleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Agrupar eventos por fecha
  const eventsByDate = new Map<string, CalendarEvent[]>();
  events.forEach(event => {
    const dateKey = event.date.toISOString().split('T')[0];
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    eventsByDate.get(dateKey)!.push(event);
  });

  // Funciones de navegación
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Obtener días del mes
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    if (onDateClick) {
      onDateClick(clickedDate);
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const hasEvents = (day: number) => {
    const date = new Date(year, month, day);
    const dateKey = date.toISOString().split('T')[0];
    return eventsByDate.has(dateKey);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  // Obtener eventos del día seleccionado
  const selectedDateKey = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
  const selectedDayEvents = selectedDateKey ? eventsByDate.get(selectedDateKey) || [] : [];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Calendario de Eventos
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-2">
            {/* Navegación */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                ←
              </button>
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {monthNames[month]} {year}
                </h3>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  Hoy
                </button>
              </div>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                →
              </button>
            </div>

            {/* Calendario Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Días de la semana */}
              {weekDays.map(day => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}

              {/* Espacios vacíos al inicio */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="p-2"></div>
              ))}

              {/* Días del mes */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dateKey = new Date(year, month, day).toISOString().split('T')[0];
                const dayEvents = eventsByDate.get(dateKey) || [];

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      p-2 rounded-lg text-sm transition-colors relative
                      ${isToday(day)
                        ? 'bg-yellow-100 dark:bg-yellow-900 font-bold'
                        : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                      }
                      ${isSelected(day)
                        ? 'bg-blue-500 text-white font-bold'
                        : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {day}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                    {dayEvents.length > 1 && (
                      <div className="absolute top-0 right-0 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {dayEvents.length}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de eventos del día seleccionado */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {selectedDate
                  ? selectedDate.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Selecciona un día'}
              </h3>

              {selectedDate && selectedDayEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayEvents.map((event, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-zinc-700 p-3 rounded-lg shadow-sm border-l-4 border-blue-500"
                    >
                      {event.time && (
                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                          🕐 {event.time}
                        </div>
                      )}
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {event.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No hay eventos programados para este día
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Haz clic en un día para ver sus eventos
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Resumen de eventos */}
        {events.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Todos los Eventos ({events.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {events
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((event, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                    onClick={() => {
                      setCurrentDate(new Date(event.date.getFullYear(), event.date.getMonth(), 1));
                      setSelectedDate(event.date);
                      if (onDateClick) {
                        onDateClick(event.date);
                      }
                    }}
                  >
                    <div className="font-semibold text-gray-800 dark:text-gray-100">
                      {event.date.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                      {event.time && ` a las ${event.time}`}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">
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
