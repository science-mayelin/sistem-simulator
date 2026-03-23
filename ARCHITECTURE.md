# Arquitectura de StuIAapp

## Decisiones Clave de Diseño

### 1. Conexión a PostgreSQL con `pg` (sin ORM)

**Decisión**: Usar `pg` directamente en lugar de Prisma u otro ORM.

**Razones**:
- Control total sobre las queries SQL
- Mejor rendimiento (sin capa de abstracción adicional)
- Facilidad para optimizar queries complejas
- Preparado para migrar a Prisma más adelante si es necesario

**Implementación**:
- Pool de conexiones singleton (`lib/db.ts`)
- Reutilización de conexiones entre requests
- Manejo automático de errores y timeouts

### 2. Separación de Queries SQL

**Decisión**: Queries SQL en módulos separados (`lib/queries/`), no en los handlers de API.

**Razones**:
- **Separación de responsabilidades**: Los handlers solo manejan HTTP
- **Reutilización**: Las queries pueden usarse en API Routes, Server Actions, o scripts
- **Testabilidad**: Fácil de testear las queries independientemente
- **Mantenibilidad**: Cambios en SQL no afectan la lógica HTTP

**Estructura**:
```
lib/queries/
  ├── courses.ts    # Todas las queries relacionadas con cursos
  └── tasks.ts      # Todas las queries relacionadas con tareas
```

### 3. Tipos TypeScript Alineados con BD

**Decisión**: Tipos TypeScript que reflejan exactamente el esquema de PostgreSQL.

**Razones**:
- Type safety en toda la aplicación
- Documentación implícita del modelo de datos
- Detección temprana de errores en desarrollo
- Fácil refactorización

**Ubicación**: `types/index.ts`

### 4. Validación en los Endpoints

**Decisión**: Validación básica en los handlers de API (formato UUID, campos requeridos, etc.).

**Razones**:
- Primera línea de defensa contra datos inválidos
- Mensajes de error claros para el cliente
- Evita queries innecesarias a la BD

**Nota**: En el futuro, considerar usar Zod o similar para validación más robusta.

### 5. Manejo de Errores Explícito

**Decisión**: Try-catch en todos los endpoints con mensajes de error descriptivos.

**Razones**:
- Debugging más fácil
- Experiencia de usuario mejor (errores claros)
- Logging centralizado para monitoreo

**Patrón**:
```typescript
try {
  // lógica
  return NextResponse.json({ success: true, data });
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
```

### 6. Estructura de Carpetas Escalable

**Decisión**: Organización por dominio/funcionalidad, no por tipo de archivo.

**Estructura actual**:
```
app/
  api/          # API Routes organizadas por recurso
lib/
  queries/      # Queries SQL por dominio
types/          # Tipos compartidos
env/            # Scripts SQL y configuración
```

**Ventajas**:
- Fácil encontrar código relacionado
- Escalable para agregar nuevas funcionalidades
- Preparado para Server Actions (Next.js 14+)

### 7. Pool de Conexiones Singleton

**Decisión**: Una única instancia del pool de conexiones reutilizada en toda la app.

**Implementación**:
- Función `getPool()` que crea el pool solo una vez
- Reutilización automática en todas las requests
- Configuración optimizada para producción (max 20 conexiones)

**Ventajas**:
- Eficiencia: no crear conexiones nuevas en cada request
- Control de recursos: límite de conexiones simultáneas
- Preparado para entornos serverless (Vercel, etc.)

### 8. Preparación para Autenticación

**Decisión**: Estructura preparada para agregar autenticación sin refactorizar.

**Preparaciones**:
- Tabla `users` ya creada
- Endpoints reciben `userId` como parámetro (futuro: desde sesión)
- Comentarios en código indicando dónde integrar NextAuth
- Variables de entorno documentadas para NextAuth

**Próximos pasos**:
- Integrar NextAuth.js
- Middleware para validar sesión
- Obtener `userId` desde `session` en lugar de query params

### 9. Índices en Base de Datos

**Decisión**: Índices estratégicos en columnas frecuentemente consultadas.

**Índices creados**:
- `users.email` (búsquedas por email)
- `courses.user_id` (cursos por usuario)
- `academic_tasks.course_id` (tareas por curso)
- `academic_tasks.status` (filtros por estado)
- `academic_tasks.due_date` (ordenamiento por fecha)
- Índice compuesto `(course_id, status)` para consultas comunes

**Razones**:
- Mejor rendimiento en consultas frecuentes
- Escalabilidad: la BD seguirá siendo rápida con muchos datos

### 10. Código Comentado con Intención

**Decisión**: Comentarios explicativos sobre el "por qué", no solo el "qué".

**Ejemplo**:
```typescript
/**
 * Pool de conexiones singleton para reutilizar conexiones
 * en todas las peticiones de la aplicación.
 */
```

**Razones**:
- Facilita onboarding de nuevos desarrolladores
- Documenta decisiones arquitectónicas
- Ayuda en mantenimiento futuro

## Flujo de Datos

```
Cliente (HTTP Request)
    ↓
API Route Handler (app/api/*/route.ts)
    ↓
Validación de entrada
    ↓
Query Function (lib/queries/*.ts)
    ↓
Database Module (lib/db.ts)
    ↓
PostgreSQL Pool
    ↓
PostgreSQL Database
```

## Consideraciones para el Futuro

1. **Autenticación**: Integrar NextAuth.js
2. **Validación**: Considerar Zod para schemas
3. **Caching**: Redis para queries frecuentes
4. **Logging**: Sistema de logging estructurado
5. **Testing**: Tests unitarios y de integración
6. **Migrations**: Sistema de migraciones de BD
7. **Rate Limiting**: Protección contra abuso
8. **API Versioning**: Preparar para v2, v3, etc.

## Escalabilidad

La arquitectura actual está diseñada para:
- ✅ Manejar múltiples usuarios simultáneos
- ✅ Agregar nuevas funcionalidades sin refactorizar
- ✅ Migrar a Prisma más adelante si es necesario
- ✅ Desplegar en entornos serverless (Vercel, etc.)
- ✅ Escalar horizontalmente (múltiples instancias)
