export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idm = searchParams.get('idm');
    const season = searchParams.get('season');
    if (!idm) return NextResponse.json([]);

    let sql = 'SELECT temporada, carrera, jsonstr FROM DriProfile WHERE IDM = ?';
    const params: any[] = [Number(idm)];
    if (season) {
      sql += ' AND temporada = ?';
      params.push(Number(season));
    }
    sql += ' ORDER BY temporada ASC, carrera ASC';

    const rows = await queryGpro(sql, params);

    const data = (rows ?? [])?.map?.((row: any) => {
      try {
        const json = JSON.parse(row?.jsonstr ?? '{}');
        return {
          temporada: row?.temporada,
          carrera: row?.carrera,
          label: `S${row?.temporada}R${row?.carrera}`,
          overall: Number(json?.overall ?? 0),
          concentration: Number(json?.concentration ?? 0),
          talent: Number(json?.talent ?? 0),
          aggressiveness: Number(json?.aggressiveness ?? 0),
          experience: Number(json?.experience ?? 0),
          techInsight: Number(json?.techInsight ?? 0),
          stamina: Number(json?.stamina ?? 0),
          charisma: Number(json?.charisma ?? 0),
          motivation: Number(json?.motivation ?? 0),
          reputation: Number(json?.reputation ?? 0),
          weight: Number(json?.weight ?? 0),
          age: Number(json?.age ?? 0),
          name: json?.driName ?? '',
        };
      } catch {
        return null;
      }
    })?.filter?.(Boolean) ?? [];

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('Pilot evolution error:', e?.message);
    return NextResponse.json([], { status: 500 });
  }
}
