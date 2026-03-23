/**
 * API Routes para gestión de cursos
 * 
 * Endpoints:
 * - GET /api/courses?userId=xxx - Obtiene cursos de un usuario
 * - POST /api/courses - Crea un nuevo curso
 * 
 * Arquitectura:
 * - Handlers separados de la lógica SQL (queries en lib/queries/)
 * - Manejo explícito de errores
 * - Validación básica de entrada
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCoursesByUserId, createCourse } from '@/lib/queries/courses';
import { CreateCourseInput } from '@/types';

/**
 * GET /api/courses
 * 
 * Obtiene los cursos de un usuario específico.
 * 
 * Query params:
 * - userId (requerido): UUID del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'El parámetro userId es requerido',
        },
        { status: 400 }
      );
    }

    // Validación básica de formato UUID (simple)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'El userId debe ser un UUID válido',
        },
        { status: 400 }
      );
    }

    const courses = await getCoursesByUserId(userId);

    return NextResponse.json(
      {
        success: true,
        data: courses,
        total: courses.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET /api/courses:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener cursos',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * 
 * Crea un nuevo curso.
 * 
 * Body (JSON):
 * {
 *   "user_id": "uuid",
 *   "name": "Nombre del curso",
 *   "semester": "2024-1"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateCourseInput = await request.json();

    // Validación de campos requeridos
    if (!body.user_id || !body.name || !body.semester) {
      return NextResponse.json(
        {
          success: false,
          error: 'Los campos user_id, name y semester son requeridos',
        },
        { status: 400 }
      );
    }

    // Validación de formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.user_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'El user_id debe ser un UUID válido',
        },
        { status: 400 }
      );
    }

    // Validación de longitud
    if (body.name.length > 255) {
      return NextResponse.json(
        {
          success: false,
          error: 'El nombre del curso no puede exceder 255 caracteres',
        },
        { status: 400 }
      );
    }

    if (body.semester.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'El semestre no puede exceder 50 caracteres',
        },
        { status: 400 }
      );
    }

    const newCourse = await createCourse(body);

    return NextResponse.json(
      {
        success: true,
        data: newCourse,
        message: 'Curso creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/courses:', error);
    
    // Manejo de errores específicos de PostgreSQL
    if (error instanceof Error) {
      // Error de foreign key (usuario no existe)
      if (error.message.includes('foreign key') || error.message.includes('violates foreign key')) {
        return NextResponse.json(
          {
            success: false,
            error: 'El usuario especificado no existe',
          },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear el curso',
      },
      { status: 500 }
    );
  }
}
