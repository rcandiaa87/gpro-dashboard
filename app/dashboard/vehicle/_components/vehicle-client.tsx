'use client';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Car, Loader2 } from 'lucide-react';
import { SeasonSelector } from '@/components/season-selector';
import { useDashboardStore } from '@/lib/store';
import { basePath } from '@/lib/api';
import dynamic from 'next/dynamic';
import type { VehicleRacePoint, SeasonRow } from '@/lib/gpro-types';

interface VehicleChartProps {
  data: VehicleRacePoint[];
  partColors: Record<string, string>;
  partLabels: Record<string, string>;
}

const VehicleWearChart = dynamic<VehicleChartProps>(
  () => import('@/components/charts/vehicle-wear-chart').then(m => m.VehicleWearChart),
  { ssr: false, loading: () => <div className="h-80 bg-slate-800/50 rounded-lg animate-pulse" /> }
);

const VehicleLevelChart = dynamic<VehicleChartProps>(
  () => import('@/components/charts/vehicle-level-chart').then(m => m.VehicleLevelChart),
  { ssr: false, loading: () => <div className="h-80 bg-slate-800/50 rounded-lg animate-pulse" /> }
);

const partColors: Record<string, string> = {
  chassis: '#60B5FF', engine: '#FF6363', FWing: '#80D8C3', RWing: '#FF9149',
  underbody: '#A19AD3', sidepods: '#FF90BB', cooling: '#72BF78',
  gear: '#f59e0b', brakes: '#FF9898', susp: '#06b6d4', electronics: '#a855f7',
};

const partLabels: Record<string, string> = {
  chassis: 'Chasis', engine: 'Motor', FWing: 'Al. Del.', RWing: 'Al. Tras.',
  underbody: 'F. Plano', sidepods: 'Pontones', cooling: 'Refrig.',
  gear: 'Caja', brakes: 'Frenos', susp: 'Susp.', electronics: 'Electr.',
};

export function VehicleClient() {
  const { idm, season, setSeason } = useDashboardStore();
  const [data, setData] = useState<VehicleRacePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!idm || season !== 0) return;
    fetch(`${basePath}/api/gpro/seasons?idm=${idm}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: SeasonRow[]) => { if (d?.[0]?.temporada) setSeason(d[0].temporada); })
      .catch(() => { toast.error('No se pudo cargar las temporadas disponibles.'); });
  }, [idm, season]);

  const loadVehicle = useCallback(() => {
    if (!idm || !season) return;
    setLoading(true);
    setFetchError(false);
    fetch(`${basePath}/api/gpro/vehicle?idm=${idm}&season=${season}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: VehicleRacePoint[]) => setData(Array.isArray(d) ? d : []))
      .catch(() => {
        toast.error('No se pudo cargar los datos del vehículo. Intenta de nuevo.');
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  }, [idm, season]);

  useEffect(() => { loadVehicle(); }, [loadVehicle]);

  const latestRace = data?.[data?.length - 1];
  const parts = Object.keys(partLabels);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">Evolución del Vehículo</h1>
          <p className="text-sm text-slate-400 mt-1">Estado y desgaste de los 11 componentes</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {idm > 0 && <SeasonSelector selectedSeason={season} onSeasonChange={setSeason} idm={idm} />}
        </div>
      </div>

      {latestRace && (
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Estado Actual (tras {latestRace?.trackName ?? 'carrera'})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {parts?.map?.((key: string) => {
              const part = latestRace?.parts?.[key];
              const wear = part?.finishWear ?? 0;
              return (
                <div key={key} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{partLabels?.[key] ?? key}</span>
                    <span className="text-xs font-mono text-blue-400">Lv{part?.lvl ?? 0}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${wear > 80 ? 'bg-red-500' : wear > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${wear}%` }} />
                  </div>
                  <p className={`text-xs font-mono mt-1 ${wear > 80 ? 'text-red-400' : wear > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {wear}% desgaste
                  </p>
                </div>
              );
            }) ?? []}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500">
          <p>No se pudo cargar los datos del vehículo</p>
          <button onClick={loadVehicle} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-600 transition-all">
            Reintentar
          </button>
        </div>
      ) : data?.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500"><p>No hay datos de vehículo</p></div>
      ) : (
        <>
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-red-400" /> Desgaste Fin de Carrera por Componente
            </h3>
            <div className="h-80">
              <VehicleWearChart data={data} partColors={partColors} partLabels={partLabels} />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-400" /> Nivel por Componente
            </h3>
            <div className="h-80">
              <VehicleLevelChart data={data} partColors={partColors} partLabels={partLabels} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
