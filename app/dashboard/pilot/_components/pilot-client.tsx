'use client';
import { useEffect, useState } from 'react';
import { User, Loader2, TrendingUp } from 'lucide-react';
import { UserSelector } from '@/components/user-selector';
import { SeasonSelector } from '@/components/season-selector';
import dynamic from 'next/dynamic';

const PilotEvolutionChart: any = dynamic(
  () => import('@/components/charts/pilot-evolution-chart').then((m: any) => m.PilotEvolutionChart),
  { ssr: false, loading: () => <div className="h-80 bg-slate-800/50 rounded-lg animate-pulse" /> }
);

export function PilotClient() {
  const [idm, setIdm] = useState(0);
  const [season, setSeason] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    if (!idm) {
      fetch('/api/gpro/users').then(r => r.json()).then((d: any) => { if (d?.[0]?.usr_idm) setIdm(d[0].usr_idm); }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!idm) return;
    if (!viewAll) {
      fetch(`/api/gpro/seasons?idm=${idm}`).then(r => r.json()).then((d: any) => { if (d?.[0]?.temporada && !season) setSeason(d[0].temporada); }).catch(() => {});
    }
  }, [idm, viewAll]);

  useEffect(() => {
    if (!idm) return;
    setLoading(true);
    const url = viewAll ? `/api/gpro/pilot-evolution?idm=${idm}` : `/api/gpro/pilot-evolution?idm=${idm}&season=${season}`;
    if (!viewAll && !season) { setLoading(false); return; }
    fetch(url)
      .then(r => r.json())
      .then((d: any) => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [idm, season, viewAll]);

  const latestData = data?.[data?.length - 1];

  const skills = [
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
          <UserSelector selectedIdm={idm} onIdmChange={(v: number) => { setIdm(v); setSeason(0); }} />
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
          {skills?.map?.((s: any) => (
            <div key={s?.key} className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500 truncate">{s?.label}</p>
              <p className="text-xl font-mono font-bold" style={{ color: s?.color }}>{latestData?.[s?.key] ?? 0}</p>
            </div>
          )) ?? []}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : data?.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500"><p>No hay datos de evolución</p></div>
      ) : (
        <div className="space-y-6">
          {skills?.map?.((skill: any) => (
            <div key={skill?.key} className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: skill?.color }} />
                {skill?.label}
                {data?.length > 0 && (
                  <span className="ml-auto font-mono text-sm" style={{ color: skill?.color }}>
                    {data?.[data?.length - 1]?.[skill?.key] ?? 0}
                  </span>
                )}
              </h3>
              <div className="h-48">
                <PilotEvolutionChart data={data} dataKey={skill?.key} color={skill?.color} />
              </div>
            </div>
          )) ?? []}
        </div>
      )}
    </div>
  );
}
