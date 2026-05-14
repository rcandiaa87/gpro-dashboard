import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getGproPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.GPRO_DATABASE_URL ?? '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
}

const CONN_RESET_CODES = new Set(['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST']);

function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as NodeJS.ErrnoException).code ?? '';
  return CONN_RESET_CODES.has(code) || CONN_RESET_CODES.has(error.message);
}

export async function queryGpro<T>(sql: string, params?: unknown[], attempt = 0): Promise<T[]> {
  const p = getGproPool();
  try {
    const [rows] = await p.query(sql, params);
    return rows as T[];
  } catch (error: unknown) {
    if (isConnectionError(error) && attempt === 0) {
      // Conexión stale — destruir pool y reintentar una vez con conexión fresca
      if (pool) {
        try { await pool.end(); } catch {}
        pool = null;
      }
      return queryGpro<T>(sql, params, 1);
    }
    console.error('GPRO DB query error:', error instanceof Error ? error.message : error);
    throw error;
  }
}
