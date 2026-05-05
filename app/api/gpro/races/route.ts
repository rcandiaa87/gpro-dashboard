export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';

function decodeHtml(str: string): string {
  if (!str) return str ?? '';
  return str?.replace?.(/&#(\d+);/g, (_: any, num: any) => String.fromCharCode(Number(num))) ?? str;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idm = searchParams.get('idm');
    const season = searchParams.get('season');
    if (!idm || !season) return NextResponse.json([]);

    const rows = await queryGpro(
      'SELECT IDM, temporada, carrera, jsonstr FROM RaceAnalysis WHERE IDM = ? AND temporada = ? ORDER BY carrera ASC',
      [Number(idm), Number(season)]
    );

    const races = (rows ?? [])?.map?.((row: any) => {
      try {
        const json = JSON.parse(row?.jsonstr ?? '{}');
        const laps = json?.laps ?? [];
        const lastLap = laps?.[laps?.length - 1];
        return {
          temporada: row?.temporada,
          carrera: row?.carrera,
          trackName: decodeHtml(json?.trackName ?? ''),
          trackId: json?.trackId,
          trackNatCode: json?.trackNatCode ?? '',
          group: json?.group ?? '',
          q1Time: json?.q1Time ?? '',
          q1Pos: json?.q1Pos,
          q2Time: json?.q2Time ?? '',
          q2Pos: json?.q2Pos,
          finishPos: lastLap?.pos ?? null,
          totalLaps: laps?.length ?? 0,
          pits: json?.pits?.length ?? 0,
          weather: json?.weather?.q1WeatherTransl ?? '',
          startFuel: json?.startFuel,
          tyreSupplier: json?.tyreSupplier ?? '',
        };
      } catch {
        return { temporada: row?.temporada, carrera: row?.carrera, trackName: 'Error', group: '' };
      }
    }) ?? [];

    return NextResponse.json(races);
  } catch (e: any) {
    console.error('Races error:', e?.message);
    return NextResponse.json([], { status: 500 });
  }
}
