export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';

export async function GET() {
  try {
    const rows = await queryGpro(
      'SELECT t.id, t.name, t.natCode, t.kms, t.laps, t.lapDistance, t.power, t.handl, t.accel, t.category, t.gpsHeld, tp.avgSpeed, tp.nbTurns, tp.timeInOutPits, tp.downforce, tp.overtaking, tp.suspRigidity, tp.fuelConsumption, tp.tyreWear, tp.gripLevel FROM Tracks t LEFT JOIN tracks_profiles tp ON t.id = tp.trackId ORDER BY t.name'
    );
    return NextResponse.json(rows ?? []);
  } catch (e: any) {
    console.error('Tracks error:', e?.message);
    return NextResponse.json([], { status: 500 });
  }
}
