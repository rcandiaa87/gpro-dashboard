export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idm = searchParams.get('idm');
    const season = searchParams.get('season');
    if (!idm || !season) return NextResponse.json([]);

    const rows = await queryGpro(
      'SELECT temporada, carrera, jsonstr FROM Standings WHERE IDM = ? AND temporada = ? ORDER BY carrera ASC',
      [Number(idm), Number(season)]
    );

    const data = (rows ?? [])?.map?.((row: any) => {
      try {
        const json = JSON.parse(row?.jsonstr ?? '{}');
        return { temporada: row?.temporada, carrera: row?.carrera, standings: json };
      } catch {
        return null;
      }
    })?.filter?.(Boolean) ?? [];

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('Standings error:', e?.message);
    return NextResponse.json([], { status: 500 });
  }
}
