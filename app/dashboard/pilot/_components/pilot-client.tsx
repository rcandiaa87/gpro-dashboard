'use client';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, TrendingUp } from 'lucide-react';
import { SeasonSelector } from '@/components/season-selector';
import { useDashboardStore } from '@/lib/store';
import { basePath } from '@/lib/api';
import dynamic from 'next/dynamic';
import type { PilotEvolutionPoint, SeasonRow } from '@/lib/gpro-types';

interface PilotEvolutionChartProps {
  data: PilotEvolutionPoint[];
  dataKey: string;
  color: string;
}

const PilotEvolutionChart = dynamic<PilotEvolutionChartProps>(
  () => import('@/components/charts/pilot-evolution-chart').then(m => m.PilotEvolutionChart),
  { ssr: false, loading: () => <div className="h-80 bg-slate-800/50 rounded-lg animate-pulse" /> }
);

export function PilotClient() {
  const { idm, season, setSeason } = useDashboardStore();
  const [data, setData] = useState<PilotEvolutionPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!idm || season !== 0 || viewAll) return;
    fetch(`${basePath}/api/gpro/seasons?idm=${idm}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: SeasonRow[]) => { if (d?.[0]?.temporada) setSeason(d[0].temporada); })
      .catch(() => { toast.error('No se pudo cargar las temporadas disponibles.'); });
  }, [idm, season, viewAll]);

  const loadPilotData = useCallback(() => {
    if (!idm) return;
    if (!viewAll && !season) return;
    setLoading(true);
    setFetchError(false);
    const url = viewAll ? `${basePath}/api/gpro/pilot-evolution?idm=${idm}` : `${basePath}/api/gpro/pilot-evolution?idm=${idm}&season=${season}`;
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: PilotEvolutionPoint[]) => setData(Array.isArray(d) ? d : []))
      .catch(() => {
        toast.error('No se pudo cargar la evolución del piloto. Intenta de nuevo.');
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  }, [idm, season, viewAll]);

  useEffect(() => { loadPilotData(); }, [loadPilotData]);

  const latestData = data?.[data?.length - 1];

  const skills: Array<{ key: keyof PilotEvolutionPoint; label: string; color: string }> = [
    { key: 'overall', label: 'Overall', color: '#60B5FF' },
    { key: 'concentration', label: 'Concentración', color: '#80D8C3' },
    { key: 'talent', label: 'Talento', color: '#FF9149' },
    { key: 'experience', label: 'Experiencia', color: '#A19AD3' },
    { key: 'stamina', label: 'Resistencia', color: '#FF6363' },
    { key: 'aggressiveness', label: 'Agresividad', color: '#FF9898' },
    { key: 'techInsight', label: 'Con. Técnico', color: '#FF90BB' },
    { key: 'charisma', label: 'Carisma', color: '#72BF78' },
    { key: 'motivation', label: 'Motivación', color: '#f59e0b' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">Evolución del Piloto</h1>
          <p className="text-sm text-slate-400 mt-1">
            {latestData?.name ? `${latestData.name}` : 'Progreso de habilidades'}
            {latestData?.age ? ` · ${latestData.age} años` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setViewAll(!viewAll)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${viewAll ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-600'}`}>
            {viewAll ? 'Todas' : 'Por Temp.'}
          </button>
          {!viewAll && idm > 0 && <SeasonSelector selectedSeason={season} onSeasonChange={setSeason} idm={idm} />}
        </div>
      </div>

      {/* Current Stats */}
      {latestData && (
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {skills.map((s) => (
            <div key={s.key} className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500 truncate">{s.label}</p>
              <p className="text-xl font-mono font-bold" style={{ color: s.color }}>{latestData?.[s.key] ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500">
          <p>No se pudo cargar la evolución del piloto</p>
          <button onClick={loadPilotData} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-600 transition-all">
            Reintentar
          </button>
        </div>
      ) : data?.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500"><p>No hay datos de evolución</p></div>
      ) : (
        <div className="space-y-6">
          {skills.map((skill) => (
            <div key={skill.key} className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: skill.color }} />
                {skill.label}
                {data.length > 0 && (
                  <span className="ml-auto font-mono text-sm" style={{ color: skill.color }}>
                    {data[data.length - 1][skill.key] ?? 0}
                  </span>
                )}
              </h3>
              <div className="h-48">
                <PilotEvolutionChart data={data} dataKey={skill.key as string} color={skill.color} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
