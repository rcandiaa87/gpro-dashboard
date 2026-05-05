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
    if (!idm) return NextResponse.json([]);

    let sql = 'SELECT temporada, carrera, jsonstr FROM RaceAnalysis WHERE IDM = ?';
    const params: any[] = [Number(idm)];
    if (season) {
      sql += ' AND temporada = ?';
      params.push(Number(season));
    }
    sql += ' ORDER BY temporada ASC, carrera ASC';

    const rows = await queryGpro(sql, params);

    const partNames = ['chassis', 'engine', 'FWing', 'RWing', 'underbody', 'sidepods', 'cooling', 'gear', 'brakes', 'susp', 'electronics'];
    const partLabels: Record<string, string> = {
      chassis: 'Chasis',
      engine: 'Motor',
      FWing: 'Alerón Del.',
      RWing: 'Alerón Tras.',
      underbody: 'Fondo Plano',
      sidepods: 'Pontones',
      cooling: 'Refrigeración',
      gear: 'Caja Cambios',
      brakes: 'Frenos',
      susp: 'Suspensión',
      electronics: 'Electrónica',
    };

    const data = (rows ?? [])?.map?.((row: any) => {
      try {
        const json = JSON.parse(row?.jsonstr ?? '{}');
        const parts: Record<string, any> = {};
        partNames?.forEach?.((name: string) => {
          const part = json?.[name] ?? {};
          parts[name] = {
            label: partLabels?.[name] ?? name,
            lvl: Number(part?.lvl ?? 0),
            startWear: Number(part?.startWear ?? 0),
            finishWear: Number(part?.finishWear ?? 0),
          };
        });
        return {
          temporada: row?.temporada,
          carrera: row?.carrera,
          label: `S${row?.temporada}R${row?.carrera}`,
          trackName: decodeHtml(json?.trackName ?? ''),
          parts,
        };
      } catch {
        return null;
      }
    })?.filter?.(Boolean) ?? [];

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('Vehicle error:', e?.message);
    return NextResponse.json([], { status: 500 });
  }
}
