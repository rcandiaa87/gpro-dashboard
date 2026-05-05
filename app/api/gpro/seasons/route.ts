export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idm = searchParams.get('idm');
    if (!idm) return NextResponse.json([]);
    const rows = await queryGpro(
      'SELECT DISTINCT temporada FROM RaceAnalysis WHERE IDM = ? ORDER BY temporada DESC',
      [Number(idm)]
    );
    return NextResponse.json(rows ?? []);
  } catch (e: any) {
    console.error('Seasons error:', e?.message);
    return NextResponse.json([], { status: 500 });
  }
}
