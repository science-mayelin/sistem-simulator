-- ============================================================================
-- StuIAapp - Script de creación de base de datos
-- ============================================================================
-- 
-- Este script crea las tablas necesarias para la aplicación StuIAapp.
-- Ejecutar en PostgreSQL antes de iniciar la aplicación.
--
-- Uso:
--   psql -U tu_usuario -d tu_base_de_datos -f schema.sql
--   O desde psql: \i schema.sql
--
-- ============================================================================

-- Extensiones necesarias (UUID)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLA: users
-- ============================================================================
-- Almacena información de los usuarios del sistema
-- Preparada para integración futura con NextAuth o similar

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================================================
-- TABLA: courses
-- ============================================================================
-- Almacena los cursos/materias de cada usuario
-- Relación: Un usuario puede tener múltiples cursos

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);

-- ============================================================================
-- TABLA: academic_tasks
-- ============================================================================
-- Almacena las tareas académicas asociadas a cada curso
-- Tipos: FORO, TRABAJO, LECTURA, EXAMEN
-- Estados: PENDING, IN_PROGRESS, DONE

CREATE TABLE IF NOT EXISTS academic_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('FORO', 'TRABAJO', 'LECTURA', 'EXAMEN')),
    title VARCHAR(500) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'DONE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_tasks_course_id ON academic_tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON academic_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON academic_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON academic_tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON academic_tasks(created_at);

-- Índice compuesto para consultas comunes (tareas por curso y estado)
CREATE INDEX IF NOT EXISTS idx_tasks_course_status ON academic_tasks(course_id, status);

-- ============================================================================
-- COMENTARIOS EN TABLAS (Documentación)
-- ============================================================================

COMMENT ON TABLE users IS 'Usuarios del sistema StuIAapp';
COMMENT ON TABLE courses IS 'Cursos/materias de los usuarios';
COMMENT ON TABLE academic_tasks IS 'Tareas académicas asociadas a cursos';

COMMENT ON COLUMN academic_tasks.type IS 'Tipo de tarea: FORO, TRABAJO, LECTURA, EXAMEN';
COMMENT ON COLUMN academic_tasks.status IS 'Estado de la tarea: PENDING, IN_PROGRESS, DONE';
COMMENT ON COLUMN academic_tasks.due_date IS 'Fecha de vencimiento de la tarea';

-- ============================================================================
-- DATOS DE EJEMPLO (Opcional - descomentar para testing)
-- ============================================================================

-- INSERT INTO users (id, email, name) VALUES
--     ('550e8400-e29b-41d4-a716-446655440000', 'usuario@ejemplo.com', 'Usuario de Prueba');

-- INSERT INTO courses (id, user_id, name, semester) VALUES
--     ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Matemáticas I', '2024-1');

-- INSERT INTO academic_tasks (id, course_id, type, title, due_date, status) VALUES
--     ('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'EXAMEN', 'Examen Final', '2024-12-15', 'PENDING');
