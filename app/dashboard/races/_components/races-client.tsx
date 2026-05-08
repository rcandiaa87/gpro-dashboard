'use client';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Flag, Clock, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { UserSelector } from '@/components/user-selector';
import { SeasonSelector } from '@/components/season-selector';
import { useDashboardStore } from '@/lib/store';
import Link from 'next/link';
import type { RaceSummary, SeasonRow } from '@/lib/gpro-types';

export function RacesClient() {
  const { idm, setIdm, season, setSeason } = useDashboardStore();
  const [races, setRaces] = useState<RaceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!idm || season !== 0) return;
    fetch(`/api/gpro/seasons?idm=${idm}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: SeasonRow[]) => { if (d?.[0]?.temporada) setSeason(d[0].temporada); })
      .catch(() => { toast.error('No se pudo cargar las temporadas disponibles.'); });
  }, [idm, season]);

  const loadRaces = useCallback(() => {
    if (!idm || !season) return;
    setLoading(true);
    setFetchError(false);
    fetch(`/api/gpro/races?idm=${idm}&season=${season}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: RaceSummary[]) => setRaces(Array.isArray(d) ? d : []))
      .catch(() => {
        toast.error('No se pudo cargar el historial de carreras. Intenta de nuevo.');
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  }, [idm, season]);

  useEffect(() => { loadRaces(); }, [loadRaces]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">Historial de Carreras</h1>
          <p className="text-sm text-slate-400 mt-1">Resultados detallados por temporada</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <UserSelector selectedIdm={idm} onIdmChange={setIdm} />
          {idm > 0 && <SeasonSelector selectedSeason={season} onSeasonChange={setSeason} idm={idm} />}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500">
          <p>No se pudo cargar el historial de carreras</p>
          <button onClick={loadRaces} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-600 transition-all">
            Reintentar
          </button>
        </div>
      ) : races?.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500"><p>No hay carreras para esta temporada</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {races.map((race) => (
            <Link key={`${race.temporada}-${race.carrera}`}
              href={`/dashboard/races/${race.temporada}/${race.carrera}?idm=${idm}`}
              className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/80 hover:border-blue-500/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-slate-500">S{race.temporada} R{race.carrera}</p>
                  <p className="text-lg font-bold text-white mt-1">{race.trackName ?? 'Circuito'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{race.group ?? ''}</p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-mono font-bold ${getPositionColor(race.finishPos)}`}>
                    P{race.finishPos ?? '-'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-700/50 pt-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Q: {race.q1Time ?? '-'}</span>
                <span className="flex items-center gap-1"><Flag className="w-3 h-3" /> Pits: {race.pits ?? 0}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {race.weather ?? ''}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function getPositionColor(pos: number | null | undefined): string {
  const p = Number(pos);
  if (p === 1) return 'text-amber-400';
  if (p <= 3) return 'text-emerald-400';
  if (p <= 10) return 'text-blue-400';
  return 'text-slate-300';
}
