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
    if (!idm) return NextResponse.json({ error: 'No IDM' }, { status: 400 });

    // Get current pilot state
    const pilotRows = await queryGpro('SELECT * FROM EstadoPiloto WHERE ep_idm = ?', [Number(idm)]);
    const pilot = pilotRows?.[0] ?? null;

    // Get current car state
    const carRows = await queryGpro('SELECT * FROM EstadoAuto WHERE ea_idm = ?', [Number(idm)]);
    const car = carRows?.[0] ?? null;

    // Get user info
    const userRows = await queryGpro('SELECT usr_nick, usr_nombre, usr_apellido, usr_suporter FROM usuario WHERE usr_idm = ?', [Number(idm)]);
    const user = userRows?.[0] ?? null;

    // Get latest season info
    const seasonRows = await queryGpro('SELECT DISTINCT temporada FROM RaceAnalysis WHERE IDM = ? ORDER BY temporada DESC LIMIT 1', [Number(idm)]);
    const latestSeason = seasonRows?.[0]?.temporada ?? 0;

    // Get latest race info
    const latestRaceRows = await queryGpro(
      'SELECT carrera, jsonstr FROM RaceAnalysis WHERE IDM = ? AND temporada = ? ORDER BY carrera DESC LIMIT 1',
      [Number(idm), latestSeason]
    );
    let latestRace: any = null;
    if (latestRaceRows?.[0]) {
      try {
        const json = JSON.parse(latestRaceRows[0]?.jsonstr ?? '{}');
        const laps = json?.laps ?? [];
        latestRace = {
          carrera: latestRaceRows[0]?.carrera,
          trackName: decodeHtml(json?.trackName ?? ''),
          group: json?.group ?? '',
          finishPos: laps?.[laps?.length - 1]?.pos ?? null,
          q1Pos: json?.q1Pos,
          balance: json?.currentBalance,
        };
      } catch {}
    }

    // Total races count
    const countRows = await queryGpro('SELECT COUNT(*) as total FROM RaceAnalysis WHERE IDM = ?', [Number(idm)]);
    const totalRaces = countRows?.[0]?.total ?? 0;

    // Staff state
    const staffRows = await queryGpro('SELECT * FROM EstadoStaff WHERE es_idm = ?', [Number(idm)]);
    const staff = staffRows?.[0] ?? null;

    return NextResponse.json({
      pilot: pilot ? {
        oa: pilot?.ep_oa, aggressiveness: pilot?.ep_agre, charisma: pilot?.ep_carisma,
        concentration: pilot?.ep_concentracion, experience: pilot?.ep_experiencia,
        motivation: pilot?.ep_motivacion, reputation: pilot?.ep_reputacion,
        stamina: pilot?.ep_resistencia, talent: pilot?.ep_talento,
        techInsight: pilot?.ep_con_tecnico, weight: pilot?.ep_peso,
      } : null,
      car: car ? {
        chassis: { lvl: car?.ea_chasis_lvl, wear: car?.ea_chasis_desg },
        engine: { lvl: car?.ea_motor_lvl, wear: car?.ea_motor_desg },
        fWing: { lvl: car?.ea_ad_lvl, wear: car?.ea_ad_desg },
        rWing: { lvl: car?.ea_at_lvl, wear: car?.ea_at_desg },
        underbody: { lvl: car?.ea_fp_lvl, wear: car?.ea_fp_desg },
        sidepods: { lvl: car?.ea_pont_lvl, wear: car?.ea_pont_desg },
        cooling: { lvl: car?.ea_refri_lvl, wear: car?.ea_refri_desg },
        gear: { lvl: car?.ea_caja_lvl, wear: car?.ea_caja_desg },
        brakes: { lvl: car?.ea_freno_lvl, wear: car?.ea_freno_desg },
        susp: { lvl: car?.ea_susp_lvl, wear: car?.ea_susp_desg },
        electronics: { lvl: car?.ea_elec_lvl, wear: car?.ea_elec_desg },
      } : null,
      user: user ? {
        nick: user?.usr_nick,
        name: `${user?.usr_nombre ?? ''} ${user?.usr_apellido ?? ''}`.trim(),
        supporter: user?.usr_suporter,
      } : null,
      latestSeason,
      latestRace,
      totalRaces,
      staff: staff ? {
        stress: staff?.es_estress,
        concentration: staff?.es_concentracion,
      } : null,
    });
  } catch (e: any) {
    console.error('Dashboard summary error:', e?.message);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
