/**
 * API Routes para gestión de tareas académicas
 * 
 * Endpoints:
 * - GET /api/tasks?userId=xxx - Obtiene tareas de un usuario
 * - GET /api/tasks?courseId=xxx - Obtiene tareas de un curso
 * - POST /api/tasks - Crea una nueva tarea
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTasksByUserId, getTasksByCourseId, createTask } from '@/lib/queries/tasks';
import { CreateTaskInput, TaskType, TaskStatus, type AcademicTask } from '@/types';

/**
 * GET /api/tasks
 * 
 * Obtiene tareas académicas.
 * 
 * Query params:
 * - userId: UUID del usuario (obtiene todas las tareas de sus cursos)
 * - courseId: UUID del curso (obtiene tareas de ese curso específico)
 * 
 * Nota: Se debe proporcionar al menos uno de los parámetros
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId && !courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Se debe proporcionar userId o courseId como parámetro de consulta',
        },
        { status: 400 }
      );
    }

    // Validación de formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (userId && !uuidRegex.test(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'El userId debe ser un UUID válido',
        },
        { status: 400 }
      );
    }

    if (courseId && !uuidRegex.test(courseId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'El courseId debe ser un UUID válido',
        },
        { status: 400 }
      );
    }

    let tasks: AcademicTask[];

    if (courseId) {
      // Prioridad: si hay courseId, obtener tareas de ese curso
      tasks = await getTasksByCourseId(courseId);
    } else if (userId) {
      // Si no hay courseId pero hay userId, obtener todas las tareas del usuario
      tasks = await getTasksByUserId(userId);
    } else {
      // Esto no debería ocurrir por la validación anterior, pero TypeScript lo requiere
      tasks = [];
    }

    return NextResponse.json(
      {
        success: true,
        data: tasks,
        total: tasks.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET /api/tasks:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener tareas',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * 
 * Crea una nueva tarea académica.
 * 
 * Body (JSON):
 * {
 *   "course_id": "uuid",
 *   "type": "FORO" | "TRABAJO" | "LECTURA" | "EXAMEN",
 *   "title": "Título de la tarea",
 *   "due_date": "2024-12-15" (formato ISO date: YYYY-MM-DD),
 *   "status": "PENDING" | "IN_PROGRESS" | "DONE" (opcional, por defecto PENDING)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskInput = await request.json();

    // Validación de campos requeridos
    if (!body.course_id || !body.type || !body.title || !body.due_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Los campos course_id, type, title y due_date son requeridos',
        },
        { status: 400 }
      );
    }

    // Validación de formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.course_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'El course_id debe ser un UUID válido',
        },
        { status: 400 }
      );
    }

    // Validación de tipo de tarea
    const validTypes: TaskType[] = ['FORO', 'TRABAJO', 'LECTURA', 'EXAMEN'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `El tipo debe ser uno de: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validación de estado (si se proporciona)
    if (body.status) {
      const validStatuses: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `El status debe ser uno de: ${validStatuses.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Validación de formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.due_date)) {
      return NextResponse.json(
        {
          success: false,
          error: 'La fecha debe estar en formato YYYY-MM-DD',
        },
        { status: 400 }
      );
    }

    // Validación de longitud
    if (body.title.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: 'El título no puede exceder 500 caracteres',
        },
        { status: 400 }
      );
    }

    const newTask = await createTask(body);

    return NextResponse.json(
      {
        success: true,
        data: newTask,
        message: 'Tarea creada exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/tasks:', error);
    
    // Manejo de errores específicos de PostgreSQL
    if (error instanceof Error) {
      // Error de foreign key (curso no existe)
      if (error.message.includes('foreign key') || error.message.includes('violates foreign key')) {
        return NextResponse.json(
          {
            success: false,
            error: 'El curso especificado no existe',
          },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear la tarea',
      },
      { status: 500 }
    );
  }
}
