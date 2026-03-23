# Configuración del Calendario

## Dependencias Requeridas

Para que el calendario funcione correctamente, necesitas instalar las siguientes dependencias:

```bash
npm install react-calendar chrono-node @types/react-calendar
```

## Componentes Creados

### 1. `/app/calendar/page.tsx`
Página principal del calendario con:
- Formulario para ingresar texto libre
- Extracción automática de eventos
- Visualización en calendario

### 2. `/components/Calendar.tsx`
Componente de calendario que:
- Muestra eventos en un calendario mensual
- Permite navegar entre meses
- Muestra eventos del día seleccionado
- Lista todos los eventos extraídos

### 3. `/lib/event-extractor.ts`
Motor de extracción que soporta:
- Múltiples formatos de fecha (DD/MM/YYYY, "15 de diciembre", "mañana", etc.)
- Múltiples formatos de hora (14:30, 3pm, "a las 15:00")
- Extracción de descripciones
- Múltiples eventos en un mismo texto

### 4. `/types/calendar.ts`
Tipos TypeScript para eventos de calendario

## Uso

1. Navega a `/calendar` en tu aplicación
2. Ingresa texto con eventos, por ejemplo:
   ```
   Reunión el 15 de diciembre a las 3pm
   Examen final el 20/12/2024 a las 14:30
   Entrega de trabajo mañana a las 10:00
   ```
3. Haz clic en "Extraer Eventos"
4. Los eventos se mostrarán en el calendario

## Formatos Soportados

### Fechas
- `15/12/2024` o `15-12-2024`
- `2024-12-15`
- `15 de diciembre`
- `mañana`, `pasado mañana`
- `próximo lunes`, `próximo martes`, etc.
- `hoy`

### Horas
- `14:30` o `14.30`
- `3pm`, `3:30pm`
- `a las 15:00`
- `a las 3 de la tarde`

## Notas

- El componente usa `react-calendar` para la visualización
- Los estilos están personalizados para modo claro/oscuro
- La extracción es inteligente pero puede requerir texto bien formateado
- Se pueden extraer múltiples eventos si están en líneas separadas
