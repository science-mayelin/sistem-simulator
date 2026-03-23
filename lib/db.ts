/**
 * Módulo de conexión a PostgreSQL usando pg Pool
 * 
 * Implementa un patrón singleton para reutilizar la conexión
 * en todas las peticiones de la aplicación.
 * 
 * Arquitectura:
 * - Pool de conexiones para mejor rendimiento
 * - Manejo automático de conexiones en dev/prod
 * - Preparado para escalar en entornos serverless
 */

import { Pool, PoolClient } from 'pg';

// Tipos para el pool
let pool: Pool | null = null;

/**
 * Obtiene o crea el pool de conexiones PostgreSQL
 * 
 * Patrón singleton: solo crea una instancia del pool
 * y la reutiliza en todas las peticiones.
 * 
 * @returns Pool de conexiones PostgreSQL
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL no está definida en las variables de entorno. ' +
        'Por favor, configura DATABASE_URL en tu archivo .env'
      );
    }

    pool = new Pool({
      connectionString,
      // Configuración del pool para producción
      max: 20, // máximo de conexiones en el pool
      idleTimeoutMillis: 30000, // cierra conexiones inactivas después de 30s
      connectionTimeoutMillis: 2000, // timeout al obtener conexión del pool
    });

    // Manejo de errores del pool
    pool.on('error', (err) => {
      console.error('Error inesperado en el pool de PostgreSQL:', err);
    });
  }

  return pool;
}

/**
 * Ejecuta una query usando una conexión del pool
 * 
 * @param query - Query SQL a ejecutar
 * @param params - Parámetros para la query (prevención de SQL injection)
 * @returns Resultado de la query
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log en desarrollo (opcional, remover en producción)
    if (process.env.NODE_ENV === 'development') {
      console.log('Query ejecutada:', { text, duration, rows: result.rowCount });
    }
    
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error('Error ejecutando query:', { text, error });
    throw error;
  }
}

/**
 * Obtiene una conexión del pool para transacciones
 * 
 * Útil cuando necesitas ejecutar múltiples queries en una transacción.
 * IMPORTANTE: Siempre libera la conexión con release() al finalizar.
 * 
 * @example
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   await client.query('INSERT INTO ...');
 *   await client.query('COMMIT');
 * } catch (err) {
 *   await client.query('ROLLBACK');
 *   throw err;
 * } finally {
 *   client.release();
 * }
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Cierra todas las conexiones del pool
 * 
 * Útil para cleanup en tests o shutdown graceful
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
