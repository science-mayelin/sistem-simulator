# StuIAapp

Aplicación web para gestionar y automatizar la vida académica universitaria, enfocada inicialmente en universidades virtuales como UNAD.

## 🚀 Tecnologías

- **Framework**: Next.js 14+ con App Router
- **Lenguaje**: TypeScript
- **Backend**: API Routes / Server Actions
- **Base de datos**: PostgreSQL
- **Conexión BD**: `pg` (sin ORM)

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio** (si aplica)

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar base de datos**:
   - Crear una base de datos PostgreSQL:
     ```sql
     CREATE DATABASE studiapp;
     ```
   - Ejecutar el script de creación de tablas:
     ```bash
     psql -U tu_usuario -d studiapp -f env/schema.sql
     ```
     O desde psql:
     ```sql
     \i env/schema.sql
     ```

4. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   Editar `.env` y configurar `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/studiapp
   ```

5. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

6. **Verificar que todo funciona**:
   - Abrir: http://localhost:3000/api/health
   - Deberías ver un JSON con `"status": "healthy"` y la información de PostgreSQL

## 📁 Estructura del Proyecto

```
studiapp/
├── app/
│   ├── api/
│   │   ├── health/          # Health check endpoint
│   │   ├── courses/         # API de cursos
│   │   └── tasks/           # API de tareas académicas
│   ├── dashboard/            # (Futuro) Dashboard de usuario
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── db.ts                # Módulo de conexión PostgreSQL
│   └── queries/             # Queries SQL organizadas
│       ├── courses.ts
│       └── tasks.ts
├── types/
│   └── index.ts             # Tipos TypeScript
├── env/
│   └── schema.sql           # Script de creación de tablas
└── .env.example             # Plantilla de variables de entorno
```

## 🗄️ Modelo de Datos

### Tablas

1. **users**: Usuarios del sistema
   - `id` (UUID)
   - `email` (VARCHAR, UNIQUE)
   - `name` (VARCHAR)
   - `created_at` (TIMESTAMP)

2. **courses**: Cursos/materias de los usuarios
   - `id` (UUID)
   - `user_id` (FK → users)
   - `name` (VARCHAR)
   - `semester` (VARCHAR)
   - `created_at` (TIMESTAMP)

3. **academic_tasks**: Tareas académicas
   - `id` (UUID)
   - `course_id` (FK → courses)
   - `type` (ENUM: FORO, TRABAJO, LECTURA, EXAMEN)
   - `title` (VARCHAR)
   - `due_date` (DATE)
   - `status` (ENUM: PENDING, IN_PROGRESS, DONE)
   - `created_at` (TIMESTAMP)

## 🔌 API Endpoints

### Health Check
- **GET** `/api/health`
  - Verifica conexión a PostgreSQL
  - Retorna estado del sistema

### Cursos
- **GET** `/api/courses?userId=xxx`
  - Obtiene todos los cursos de un usuario
  
- **POST** `/api/courses`
  - Crea un nuevo curso
  - Body: `{ "user_id": "uuid", "name": "string", "semester": "string" }`

### Tareas
- **GET** `/api/tasks?userId=xxx` o `?courseId=xxx`
  - Obtiene tareas de un usuario o de un curso específico
  
- **POST** `/api/tasks`
  - Crea una nueva tarea académica
  - Body: `{ "course_id": "uuid", "type": "FORO|TRABAJO|LECTURA|EXAMEN", "title": "string", "due_date": "YYYY-MM-DD", "status": "PENDING|IN_PROGRESS|DONE" }`

## 🏗️ Arquitectura

### Principios de Diseño

1. **Separación de responsabilidades**:
   - Handlers de API (`app/api/`) solo manejan HTTP
   - Lógica SQL en `lib/queries/`
   - Conexión a BD centralizada en `lib/db.ts`

2. **Pool de conexiones**:
   - Singleton pattern para reutilizar conexiones
   - Configurado para entornos dev/prod
   - Manejo automático de errores

3. **Tipos TypeScript**:
   - Tipos alineados con el esquema de BD
   - Validación en runtime en los endpoints

4. **Escalabilidad**:
   - Preparado para autenticación (NextAuth)
   - Estructura pensada para SaaS multiusuario
   - Fácil de extender con nuevas funcionalidades

## 🧪 Testing de Endpoints

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Crear un usuario (manual, por ahora)
```sql
INSERT INTO users (id, email, name) 
VALUES (gen_random_uuid(), 'test@example.com', 'Usuario Test');
```

### Crear un curso
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid-del-usuario",
    "name": "Matemáticas I",
    "semester": "2024-1"
  }'
```

### Crear una tarea
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "uuid-del-curso",
    "type": "EXAMEN",
    "title": "Examen Final",
    "due_date": "2024-12-15",
    "status": "PENDING"
  }'
```

## 🔐 Seguridad (Futuro)

- Autenticación con NextAuth.js
- Validación de sesión en endpoints
- Rate limiting
- Sanitización de inputs
- HTTPS en producción

## 📝 Próximos Pasos

- [ ] Implementar autenticación (NextAuth)
- [ ] Dashboard de usuario
- [ ] Filtros y búsqueda avanzada
- [ ] Notificaciones de tareas próximas
- [ ] Integración con calendarios
- [ ] Exportación de datos

## 📄 Licencia

MIT
