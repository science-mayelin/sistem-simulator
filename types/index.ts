/**
 * Tipos TypeScript para StuIAapp
 * 
 * Estos tipos están alineados con el esquema de la base de datos PostgreSQL.
 * Mantener sincronizados con el script SQL de creación de tablas.
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

export type UUID = string;

export type Timestamp = string; // ISO 8601 string

// ============================================================================
// USUARIOS
// ============================================================================

export interface User {
  id: UUID;
  email: string;
  name: string;
  created_at: Timestamp;
}

export interface CreateUserInput {
  email: string;
  name: string;
}

// ============================================================================
// CURSOS
// ============================================================================

export interface Course {
  id: UUID;
  user_id: UUID;
  name: string;
  semester: string;
  created_at?: Timestamp;
}

export interface CreateCourseInput {
  user_id: UUID;
  name: string;
  semester: string;
}

// ============================================================================
// TAREAS ACADÉMICAS
// ============================================================================

export type TaskType = 'FORO' | 'TRABAJO' | 'LECTURA' | 'EXAMEN';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface AcademicTask {
  id: UUID;
  course_id: UUID;
  type: TaskType;
  title: string;
  due_date: string; // ISO date string
  status: TaskStatus;
  created_at: Timestamp;
}

export interface CreateTaskInput {
  course_id: UUID;
  type: TaskType;
  title: string;
  due_date: string;
  status?: TaskStatus; // Por defecto 'PENDING'
}

// ============================================================================
// TIPOS PARA RESPUESTAS API
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}
