export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';
import { apiError } from '@/lib/api-error';
import type { StandingsRow } from '@/lib/gpro-types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idm = searchParams.get('idm');
    const season = searchParams.get('season');
    if (!idm || !season) return NextResponse.json([]);

    const rows = await queryGpro<StandingsRow>(
      'SELECT temporada, carrera, jsonstr FROM Standings WHERE IDM = ? AND temporada = ? ORDER BY carrera ASC',
      [Number(idm), Number(season)]
    );

    const data = (rows ?? []).map((row: StandingsRow) => {
      try {
        const json = JSON.parse(row.jsonstr ?? '{}') as Record<string, unknown>;
        return { temporada: row.temporada, carrera: row.carrera, standings: json };
      } catch {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json(data);
  } catch (e: unknown) {
    return apiError(500, 'Error al cargar clasificación', e);
  }
}
