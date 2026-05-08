'use client';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Trophy, Loader2, TrendingUp } from 'lucide-react';
import { SeasonSelector } from '@/components/season-selector';
import { useDashboardStore } from '@/lib/store';
import { basePath } from '@/lib/api';
import dynamic from 'next/dynamic';
import type { StandingsPoint, StandingEntry, SeasonRow } from '@/lib/gpro-types';

interface StandingsChartPoint {
  label: string;
  carrera: number;
  position: number | null;
  points: number | null;
}

interface StandingsChartProps {
  data: StandingsChartPoint[];
}

const StandingsChart = dynamic<StandingsChartProps>(
  () => import('@/components/charts/standings-chart').then(m => m.StandingsChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-800/50 rounded-lg animate-pulse" /> }
);

function decodeHtml(html: string) {
  if (!html) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export function StandingsClient() {
  const { idm, season, setSeason } = useDashboardStore();
  const [data, setData] = useState<StandingsPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!idm || season !== 0) return;
    fetch(`${basePath}/api/gpro/seasons?idm=${idm}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: SeasonRow[]) => { if (d?.[0]?.temporada) setSeason(d[0].temporada); })
      .catch(() => { toast.error('No se pudo cargar las temporadas disponibles.'); });
  }, [idm, season]);

  const loadStandings = useCallback(() => {
    if (!idm || !season) return;
    setLoading(true);
    setFetchError(false);
    fetch(`${basePath}/api/gpro/standings?idm=${idm}&season=${season}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: StandingsPoint[]) => setData(Array.isArray(d) ? d : []))
      .catch(() => {
        toast.error('No se pudo cargar la clasificación. Intenta de nuevo.');
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  }, [idm, season]);

  useEffect(() => { loadStandings(); }, [loadStandings]);

  const latestStanding = data[data.length - 1];
  const standingsJson = latestStanding?.standings;
  let standingsArray: StandingEntry[] = [];
  if (standingsJson?.managers && Array.isArray(standingsJson.managers)) {
    standingsArray = standingsJson.managers as StandingEntry[];
  } else if (Array.isArray(standingsJson)) {
    standingsArray = standingsJson as StandingEntry[];
  }

  const positionData = data.map((d: StandingsPoint) => {
    const json = d.standings;
    let arr: StandingEntry[] = [];
    if (json?.managers && Array.isArray(json.managers)) arr = json.managers as StandingEntry[];
    else if (Array.isArray(json)) arr = json as StandingEntry[];
    const myEntry = arr.find((e: StandingEntry) =>
      Number(e?.IDM) === Number(idm) ||
      Number(e?.manId) === Number(idm) ||
      Number(e?.managerId) === Number(idm)
    );
    return {
      label: `R${d.carrera}`,
      carrera: d.carrera,
      position: myEntry?.pos ? Number(myEntry.pos) : null,
      points: myEntry?.pts ? Number(myEntry.pts) : null,
    };
  }).filter((d): d is StandingsChartPoint & { position: number } => d.position !== null);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">Clasificación</h1>
          <p className="text-sm text-slate-400 mt-1">Standings del campeonato por temporada</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {idm > 0 && <SeasonSelector selectedSeason={season} onSeasonChange={setSeason} idm={idm} />}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500">
          <p>No se pudo cargar la clasificación</p>
          <button onClick={loadStandings} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-600 transition-all">
            Reintentar
          </button>
        </div>
      ) : data?.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500"><p>No hay datos de clasificación</p></div>
      ) : (
        <>
          {positionData?.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Evolución de Posición en el Campeonato
              </h3>
              <div className="h-64">
                <StandingsChart data={positionData} />
              </div>
            </div>
          )}

          {standingsArray?.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Tabla de Posiciones (R{latestStanding?.carrera})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 text-xs">
                      <th className="text-left py-2 px-3">Pos</th>
                      <th className="text-left py-2 px-3">Manager</th>
                      <th className="text-right py-2 px-3">Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standingsArray.slice(0, 30).map((entry: StandingEntry, i: number) => {
                      const isMe = Number(entry?.IDM) === Number(idm);
                      return (
                        <tr key={i} className={`border-t border-slate-700/30 ${isMe ? 'bg-blue-600/10' : ''}`}>
                          <td className="py-2 px-3">
                            <span className={`font-mono font-bold ${i < 3 ? 'text-amber-400' : 'text-slate-300'}`}>
                              {entry?.pos ?? entry?.position ?? i + 1}
                            </span>
                          </td>
                          <td className={`py-2 px-3 ${isMe ? 'text-blue-400 font-semibold' : 'text-slate-300'}`}>
                            {decodeHtml(entry?.name ?? '-')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-white">{entry?.pts ?? entry?.points ?? 0}</td>
                        </tr>
                      );
                    }) ?? []}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
