export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';
import { apiError } from '@/lib/api-error';

interface CountRow {
  trackId: number;
  cnt: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idm = searchParams.get('idm');
    if (!idm) return NextResponse.json({});

    const rows = await queryGpro<CountRow>(
      `SELECT CAST(JSON_UNQUOTE(JSON_EXTRACT(jsonstr, '$.trackId')) AS UNSIGNED) AS trackId, COUNT(*) AS cnt
       FROM RaceAnalysis WHERE IDM = ?
       GROUP BY JSON_UNQUOTE(JSON_EXTRACT(jsonstr, '$.trackId'))`,
      [Number(idm)]
    );

    const counts: Record<number, number> = {};
    for (const row of rows) {
      if (row.trackId) counts[row.trackId] = Number(row.cnt);
    }

    return NextResponse.json(counts);
  } catch (e: unknown) {
    return apiError(500, 'Error al cargar conteos por circuito', e);
  }
}
