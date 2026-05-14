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
  chassis: 'hsl(var(--chart-1))',
  engine: 'hsl(var(--chart-7))',
  FWing: 'hsl(var(--chart-2))',
  RWing: 'hsl(var(--chart-9))',
  underbody: 'hsl(var(--chart-10))',
  sidepods: 'hsl(var(--chart-11))',
  cooling: 'hsl(var(--chart-8))',
  gear: 'hsl(var(--chart-3))',
  brakes: 'hsl(var(--chart-5))',
  susp: 'hsl(var(--chart-6))',
  electronics: 'hsl(var(--chart-4))',
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
    const controller = new AbortController();
    fetch(`${basePath}/api/gpro/seasons?idm=${idm}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: SeasonRow[]) => { if (d?.[0]?.temporada) setSeason(d[0].temporada); })
      .catch((e) => { if (e.name !== 'AbortError') toast.error('No se pudo cargar las temporadas disponibles.'); });
    return () => controller.abort();
  }, [idm, season]);

  const loadVehicle = useCallback(() => {
    if (!idm || !season) return;
    setLoading(true);
    setFetchError(false);
    const controller = new AbortController();
    fetch(`${basePath}/api/gpro/vehicle?idm=${idm}&season=${season}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: VehicleRacePoint[]) => setData(Array.isArray(d) ? d : []))
      .catch((e) => {
        if (e.name === 'AbortError') return;
        toast.error('No se pudo cargar los datos del vehículo. Intenta de nuevo.');
        setFetchError(true);
      })
      .finally(() => setLoading(false));
    return controller;
  }, [idm, season]);

  useEffect(() => {
    const controller = loadVehicle();
    return () => controller?.abort();
  }, [loadVehicle]);

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
                  <div
                    role="progressbar"
                    aria-label={`Desgaste de ${partLabels?.[key] ?? key}`}
                    aria-valuenow={wear}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2 bg-slate-700 rounded-full overflow-hidden"
                  >
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
        <div className="flex items-center justify-center h-64">
          <div role="status" aria-label="Cargando datos del vehículo">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" aria-hidden="true" />
          </div>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
          <p>No se pudo cargar los datos del vehículo</p>
          <button onClick={loadVehicle} className="px-4 min-h-[44px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-600 transition-colors">
            Reintentar
          </button>
        </div>
      ) : data?.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-400"><p>No hay datos de vehículo</p></div>
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
