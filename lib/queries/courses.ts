/**
 * Queries SQL para la gestión de cursos
 * 
 * Separación de responsabilidades:
 * - Las queries SQL están aquí, no en los handlers de API
 * - Fácil de testear y mantener
 * - Reutilizables en diferentes contextos (API, Server Actions, etc.)
 */

import { query } from '../db';
import { Course, CreateCourseInput } from '@/types';

/**
 * Obtiene todos los cursos de un usuario
 */
export async function getCoursesByUserId(userId: string): Promise<Course[]> {
  const result = await query<Course>(
    `SELECT id, user_id, name, semester, created_at
     FROM courses
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * Obtiene un curso por su ID
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
  const result = await query<Course>(
    `SELECT id, user_id, name, semester, created_at
     FROM courses
     WHERE id = $1`,
    [courseId]
  );
  return result.rows[0] || null;
}

/**
 * Crea un nuevo curso
 */
export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const result = await query<Course>(
    `INSERT INTO courses (id, user_id, name, semester)
     VALUES (gen_random_uuid(), $1, $2, $3)
     RETURNING id, user_id, name, semester, created_at`,
    [input.user_id, input.name, input.semester]
  );
  return result.rows[0];
}

/**
 * Actualiza un curso existente
 */
export async function updateCourse(
  courseId: string,
  updates: Partial<Pick<Course, 'name' | 'semester'>>
): Promise<Course | null> {
  const updatesList: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    updatesList.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.semester !== undefined) {
    updatesList.push(`semester = $${paramIndex++}`);
    values.push(updates.semester);
  }

  if (updatesList.length === 0) {
    return getCourseById(courseId);
  }

  values.push(courseId);
  const result = await query<Course>(
    `UPDATE courses
     SET ${updatesList.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, user_id, name, semester, created_at`,
    values
  );
  return result.rows[0] || null;
}

/**
 * Elimina un curso
 */
export async function deleteCourse(courseId: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM courses WHERE id = $1`,
    [courseId]
  );
  return result.rowCount > 0;
}
