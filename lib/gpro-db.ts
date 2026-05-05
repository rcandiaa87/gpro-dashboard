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

export async function queryGpro<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const p = getGproPool();
  try {
    const [rows] = await p.query(sql, params);
    return rows as T[];
  } catch (error: any) {
    console.error('GPRO DB query error:', error?.message);
    throw error;
  }
}
