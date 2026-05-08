export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';
import { apiError } from '@/lib/api-error';
import type { SeasonRow } from '@/lib/gpro-types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idm = searchParams.get('idm');
    if (!idm) return NextResponse.json([]);
    const rows = await queryGpro<SeasonRow>(
      'SELECT DISTINCT temporada FROM RaceAnalysis WHERE IDM = ? ORDER BY temporada DESC',
      [Number(idm)]
    );
    return NextResponse.json(rows ?? []);
  } catch (e: unknown) {
    return apiError(500, 'Error al cargar temporadas', e);
  }
}
