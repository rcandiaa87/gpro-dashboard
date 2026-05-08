export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';
import { apiError } from '@/lib/api-error';
import type { TrackRow } from '@/lib/gpro-types';

export async function GET() {
  try {
    const rows = await queryGpro<TrackRow>(
      'SELECT t.id, t.name, t.natCode, t.kms, t.laps, t.lapDistance, t.power, t.handl, t.accel, t.category, t.gpsHeld, tp.avgSpeed, tp.nbTurns, tp.timeInOutPits, tp.downforce, tp.overtaking, tp.suspRigidity, tp.fuelConsumption, tp.tyreWear, tp.gripLevel FROM Tracks t LEFT JOIN tracks_profiles tp ON t.id = tp.trackId ORDER BY t.name'
    );
    return NextResponse.json(rows ?? []);
  } catch (e: unknown) {
    return apiError(500, 'Error al cargar circuitos', e);
  }
}
