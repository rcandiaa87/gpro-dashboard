'use client';
import { useEffect, useState } from 'react';
import { Trophy, Loader2, TrendingUp, Medal } from 'lucide-react';
import { UserSelector } from '@/components/user-selector';
import { SeasonSelector } from '@/components/season-selector';
import dynamic from 'next/dynamic';

const StandingsChart: any = dynamic(
  () => import('@/components/charts/standings-chart').then((m: any) => m.StandingsChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-800/50 rounded-lg animate-pulse" /> }
);

function decodeHtml(html: string) {
  if (!html) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export function StandingsClient() {
  const [idm, setIdm] = useState(0);
  const [season, setSeason] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idm) {
      fetch('/api/gpro/users').then(r => r.json()).then((d: any) => { if (d?.[0]?.usr_idm) setIdm(d[0].usr_idm); }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!idm) return;
    fetch(`/api/gpro/seasons?idm=${idm}`).then(r => r.json()).then((d: any) => { if (d?.[0]?.temporada && !season) setSeason(d[0].temporada); }).catch(() => {});
  }, [idm]);

  useEffect(() => {
    if (!idm || !season) return;
    setLoading(true);
    fetch(`/api/gpro/standings?idm=${idm}&season=${season}`)
      .then(r => r.json())
      .then((d: any) => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [idm, season]);

  // Parse standings - the JSON typically has a standings array
  const latestStanding = data?.[data?.length - 1];
  const standingsJson = latestStanding?.standings;
  // The standings JSON may have various structures, let's handle common ones
  let standingsArray: any[] = [];  
  if (standingsJson?.managers && Array.isArray(standingsJson.managers)) {  
    standingsArray = standingsJson.managers;  
  } else if (Array.isArray(standingsJson)) {  
    standingsArray = standingsJson;  
  }

  const positionData = (data ?? [])?.map?.((d: any) => {
      const json = d?.standings;
      let arr: any[] = [];
      
      // Extraemos el array de managers correctamente
      if (json?.managers && Array.isArray(json.managers)) arr = json.managers;
      else if (Array.isArray(json)) arr = json;
      
      // BUSCADOR DINÁMICO (Usando IDM en mayúsculas como en tu imagen)
      const myEntry = arr?.find?.((e: any) => 
        Number(e?.IDM) === Number(idm) || 
        Number(e?.manId) === Number(idm) ||
        Number(e?.managerId) === Number(idm)
      ); 

      return {
        label: `R${d?.carrera}`,
        carrera: d?.carrera,
        // Convertimos strings a números para el gráfico
        position: myEntry?.pos ? Number(myEntry.pos) : null,
        points: myEntry?.pts ? Number(myEntry.pts) : null,
      };
    })?.filter?.((d: any) => d.position !== null) ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">Clasificación</h1>
          <p className="text-sm text-slate-400 mt-1">Standings del campeonato por temporada</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <UserSelector selectedIdm={idm} onIdmChange={(v: number) => { setIdm(v); setSeason(0); }} />
          {idm > 0 && <SeasonSelector selectedSeason={season} onSeasonChange={setSeason} idm={idm} />}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : data?.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500"><p>No hay datos de clasificación</p></div>
      ) : (
        <>
          {/* Position Evolution */}
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

          {/* Standings Table */}
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
                    {standingsArray?.slice?.(0, 30)?.map?.((entry: any, i: number) => {
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
