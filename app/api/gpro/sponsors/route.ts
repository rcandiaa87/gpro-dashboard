export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryGpro } from '@/lib/gpro-db';
import { apiError } from '@/lib/api-error';

function decodeHtml(str: string): string {
  if (!str) return str ?? '';
  return str.replace(/&#(\d+);/g, (_: string, num: string) => String.fromCharCode(Number(num)));
}

interface AvailSponsorsRow {
  IDM: number;
  temporada: number;
  carrera: number;
  jsonstr: string;
}

interface NegOverviewRow {
  IDM: number;
  temporada: number;
  carrera: number;
  jsonstr: string;
}

interface SponsorJson {
  name: string;
  idx: string;
  sponsorId: string;
  natCode: string;
  finances: number;
  expectations: number;
  patience: number;
  reputation: number;
  image: number;
  negotiation: number;
  estAvgProgress: number;
  progressColor: string;
}

interface CarSpotJson {
  name: string;
  sponsorId: number;
  carSpotName: string;
  amount: number | string;
  contractStatus: number;
  racesLeft: number | string;
  satisfaction: number | string;
}

interface OngNegJson {
  name: string;
  sponsorId: number;
  carSpotName: string;
  amount: number;
  duration: number;
  textColor: string;
  progress: string;
  priority: string;
  contested: string;
  avgProgress: string;
  attention: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idm = searchParams.get('idm');
    if (!idm) return apiError(400, 'IDM requerido');

    const [availRows, negRows] = await Promise.all([
      queryGpro<AvailSponsorsRow>(
        'SELECT IDM, temporada, carrera, jsonstr FROM AvailSponsors WHERE IDM = ? ORDER BY temporada DESC, carrera DESC LIMIT 1',
        [Number(idm)]
      ),
      queryGpro<NegOverviewRow>(
        'SELECT IDM, temporada, carrera, jsonstr FROM NegOverview WHERE IDM = ? ORDER BY temporada DESC, carrera DESC LIMIT 1',
        [Number(idm)]
      ),
    ]);

    const availJson = availRows?.[0]?.jsonstr ? JSON.parse(availRows[0].jsonstr) : null;
    const negJson = negRows?.[0]?.jsonstr ? JSON.parse(negRows[0].jsonstr) : null;

    const group: string = availJson?.group ?? negJson?.group ?? '';
    const rawSponsors: SponsorJson[] = availJson?.sponsors ?? [];
    const ongNegs: OngNegJson[] = negJson?.ongNegs ?? [];
    const carSpots: CarSpotJson[] = negJson?.carSpots ?? [];

    const ongNegIds = new Set(ongNegs.map((n) => String(n.sponsorId)));

    const sponsors = rawSponsors.map((s) => ({
      name: decodeHtml(s.name),
      idx: s.idx,
      sponsorId: s.sponsorId,
      natCode: s.natCode,
      finances: s.finances,
      expectations: s.expectations,
      patience: s.patience,
      reputation: s.reputation,
      image: s.image,
      negotiation: s.negotiation,
      estAvgProgress: s.estAvgProgress,
      progressColor: s.progressColor,
      isInNeg: ongNegIds.has(s.sponsorId),
    }));

    const activeNegotiations = ongNegs.map((n) => ({
      name: decodeHtml(n.name),
      sponsorId: n.sponsorId,
      carSpotName: decodeHtml(n.carSpotName),
      progress: n.progress,
      avgProgress: n.avgProgress,
      contested: decodeHtml(n.contested),
      textColor: n.textColor,
    }));

    const activeContracts = carSpots
      .filter((c) => c.contractStatus === 1)
      .map((c) => ({
        name: decodeHtml(c.name),
        sponsorId: c.sponsorId,
        carSpotName: decodeHtml(c.carSpotName),
        amount: c.amount,
        racesLeft: c.racesLeft,
        satisfaction: c.satisfaction,
      }));

    return NextResponse.json({
      group,
      sponsors,
      activeNegotiations,
      activeContracts,
    });
  } catch (e: unknown) {
    return apiError(500, 'Error al cargar sponsors', e);
  }
}
