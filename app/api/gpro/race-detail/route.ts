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
    const race = searchParams.get('race');
    if (!idm || !season || !race) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const rows = await queryGpro(
      'SELECT jsonstr FROM RaceAnalysis WHERE IDM = ? AND temporada = ? AND carrera = ? LIMIT 1',
      [Number(idm), Number(season), Number(race)]
    );

    if (!rows?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const json = JSON.parse(rows[0]?.jsonstr ?? '{}');

    const result = {
      trackName: decodeHtml(json?.trackName ?? ''),
      trackId: json?.trackId,
      trackNatCode: json?.trackNatCode ?? '',
      trackCountry: decodeHtml(json?.trackCountry ?? ''),
      group: json?.group ?? '',
      q1Time: json?.q1Time ?? '',
      q1Pos: json?.q1Pos,
      q2Time: json?.q2Time ?? '',
      q2Pos: json?.q2Pos,
      q1Risk: json?.q1Risk,
      q2Risk: json?.q2Risk,
      startRisk: json?.startRisk,
      overtakeRisk: json?.overtakeRisk,
      defendRisk: json?.defendRisk,
      driver: json?.driver ?? {},
      driverChanges: json?.driverChanges ?? {},
      setupsUsed: json?.setupsUsed ?? [],
      weather: json?.weather ?? {},
      laps: (json?.laps ?? [])?.map?.((l: any) => ({
        idx: l?.idx,
        lapTime: l?.lapTime ?? '',
        pos: l?.pos,
        tyres: decodeHtml(l?.tyres ?? ''),
        weather: l?.weather ?? '',
        temp: l?.temp,
        hum: l?.hum,
        boostLap: l?.boostLap,
        events: l?.events ?? [],
      })) ?? [],
      pits: (json?.pits ?? [])?.map?.((p: any) => ({
        idx: p?.idx,
        lap: p?.lap,
        reason: decodeHtml(p?.reason ?? ''),
        tyreCond: p?.tyreCond,
        fuelLeft: p?.fuelLeft,
        refilledTo: p?.refilledTo,
        pitTime: p?.pitTime,
      })) ?? [],
      carParts: {
        chassis: json?.chassis ?? {},
        engine: json?.engine ?? {},
        fWing: json?.FWing ?? {},
        rWing: json?.RWing ?? {},
        underbody: json?.underbody ?? {},
        sidepods: json?.sidepods ?? {},
        cooling: json?.cooling ?? {},
        gear: json?.gear ?? {},
        brakes: json?.brakes ?? {},
        susp: json?.susp ?? {},
        electronics: json?.electronics ?? {},
      },
      transactions: (json?.transactions ?? [])?.map?.((t: any) => ({
        desc: decodeHtml(t?.desc ?? ''),
        amount: t?.amount ?? 0,
      })) ?? [],
      startFuel: json?.startFuel,
      finishTyres: json?.finishTyres,
      finishFuel: json?.finishFuel,
      otAttempts: json?.otAttempts,
      overtakes: json?.overtakes,
      otAttemptsOnYou: json?.otAttemptsOnYou,
      overtakesOnYou: json?.overtakesOnYou,
      currentBalance: json?.currentBalance,
      carPower: json?.carPower,
      carHandl: json?.carHandl,
      carAccel: json?.carAccel,
      q1Energy: json?.q1Energy,
      q2Energy: json?.q2Energy,
      raceEnergy: json?.raceEnergy,
      problems: json?.problems ?? [],
    };

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('Race detail error:', e?.message);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
