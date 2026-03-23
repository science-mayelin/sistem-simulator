/**
 * Queries SQL para la gestión de tareas académicas
 */

import { query } from '../db';
import { AcademicTask, CreateTaskInput, TaskStatus } from '@/types';

/**
 * Obtiene todas las tareas de un curso
 */
export async function getTasksByCourseId(courseId: string): Promise<AcademicTask[]> {
  const result = await query<AcademicTask>(
    `SELECT id, course_id, type, title, due_date, status, created_at
     FROM academic_tasks
     WHERE course_id = $1
     ORDER BY due_date ASC, created_at DESC`,
    [courseId]
  );
  return result.rows;
}

/**
 * Obtiene todas las tareas de un usuario (a través de sus cursos)
 */
export async function getTasksByUserId(userId: string): Promise<AcademicTask[]> {
  const result = await query<AcademicTask>(
    `SELECT t.id, t.course_id, t.type, t.title, t.due_date, t.status, t.created_at
     FROM academic_tasks t
     INNER JOIN courses c ON t.course_id = c.id
     WHERE c.user_id = $1
     ORDER BY t.due_date ASC, t.created_at DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * Obtiene una tarea por su ID
 */
export async function getTaskById(taskId: string): Promise<AcademicTask | null> {
  const result = await query<AcademicTask>(
    `SELECT id, course_id, type, title, due_date, status, created_at
     FROM academic_tasks
     WHERE id = $1`,
    [taskId]
  );
  return result.rows[0] || null;
}

/**
 * Crea una nueva tarea académica
 */
export async function createTask(input: CreateTaskInput): Promise<AcademicTask> {
  const status: TaskStatus = input.status || 'PENDING';
  
  const result = await query<AcademicTask>(
    `INSERT INTO academic_tasks (id, course_id, type, title, due_date, status)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
     RETURNING id, course_id, type, title, due_date, status, created_at`,
    [input.course_id, input.type, input.title, input.due_date, status]
  );
  return result.rows[0];
}

/**
 * Actualiza una tarea existente
 */
export async function updateTask(
  taskId: string,
  updates: Partial<Pick<AcademicTask, 'title' | 'due_date' | 'status' | 'type'>>
): Promise<AcademicTask | null> {
  const updatesList: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    updatesList.push(`title = $${paramIndex++}`);
    values.push(updates.title);
  }
  if (updates.due_date !== undefined) {
    updatesList.push(`due_date = $${paramIndex++}`);
    values.push(updates.due_date);
  }
  if (updates.status !== undefined) {
    updatesList.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.type !== undefined) {
    updatesList.push(`type = $${paramIndex++}`);
    values.push(updates.type);
  }

  if (updatesList.length === 0) {
    return getTaskById(taskId);
  }

  values.push(taskId);
  const result = await query<AcademicTask>(
    `UPDATE academic_tasks
     SET ${updatesList.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, course_id, type, title, due_date, status, created_at`,
    values
  );
  return result.rows[0] || null;
}

/**
 * Elimina una tarea
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM academic_tasks WHERE id = $1`,
    [taskId]
  );
  return result.rowCount > 0;
}

/**
 * Obtiene tareas filtradas por estado
 */
export async function getTasksByStatus(
  userId: string,
  status: TaskStatus
): Promise<AcademicTask[]> {
  const result = await query<AcademicTask>(
    `SELECT t.id, t.course_id, t.type, t.title, t.due_date, t.status, t.created_at
     FROM academic_tasks t
     INNER JOIN courses c ON t.course_id = c.id
     WHERE c.user_id = $1 AND t.status = $2
     ORDER BY t.due_date ASC`,
    [userId, status]
  );
  return result.rows;
}
