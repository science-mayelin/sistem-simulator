/**
 * Endpoint de health check
 * 
 * Verifica que la aplicación pueda conectarse correctamente a PostgreSQL.
 * Útil para monitoreo y verificación de estado del sistema.
 * 
 * GET /api/health
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Intenta ejecutar una query simple para verificar la conexión
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    
    return NextResponse.json(
      {
        success: true,
        status: 'healthy',
        database: {
          connected: true,
          current_time: result.rows[0].current_time,
          version: result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1],
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 } // Service Unavailable
    );
  }
}
