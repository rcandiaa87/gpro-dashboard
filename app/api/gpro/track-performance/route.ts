export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';
import { apiError } from '@/lib/api-error';
import type { RaceAnalysisRow, RaceJson } from '@/lib/gpro-types';

interface TrackBasic {
  id: number;
  name: string;
  natCode: string;
  power: number;
  handl: number;
  accel: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idm = searchParams.get('idm');
    const trackId = searchParams.get('trackId');
    if (!idm || !trackId) return NextResponse.json({ track: null, races: [] });

    const trackRows = await queryGpro<TrackBasic>(
      'SELECT id, name, natCode, power, handl, accel FROM Tracks WHERE id = ? LIMIT 1',
      [Number(trackId)]
    );
    const track = trackRows[0] ?? null;

    const rows = await queryGpro<RaceAnalysisRow>(
      `SELECT temporada, carrera, jsonstr FROM RaceAnalysis
       WHERE IDM = ? AND CAST(JSON_UNQUOTE(JSON_EXTRACT(jsonstr, '$.trackId')) AS UNSIGNED) = ?
       ORDER BY temporada ASC, carrera ASC`,
      [Number(idm), Number(trackId)]
    );

    const races = rows
      .map((row: RaceAnalysisRow) => {
        try {
          const json = JSON.parse(row.jsonstr ?? '{}') as RaceJson;
          const laps = json?.laps ?? [];
          const lastLap = laps[laps.length - 1];
          return {
            temporada: row.temporada,
            carrera: row.carrera,
            q1Pos: json?.q1Pos ?? null,
            q2Pos: json?.q2Pos ?? null,
            finishPos: lastLap?.pos ?? null,
            carPower: json?.carPower ?? null,
            carHandl: json?.carHandl ?? null,
            carAccel: json?.carAccel ?? null,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({ track, races });
  } catch (e: unknown) {
    return apiError(500, 'Error al cargar rendimiento por circuito', e);
  }
}
