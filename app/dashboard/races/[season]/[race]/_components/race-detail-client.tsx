'use client';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Flag, Clock, Thermometer, Droplets, Wrench, DollarSign, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { RaceDetailResponse, LapResponse, PitResponse } from '@/lib/gpro-types';
import { basePath } from '@/lib/api';

interface LapTimeChartProps { laps: LapResponse[]; pits: PitResponse[]; }
interface LapPositionChartProps { laps: LapResponse[]; }

const LapTimeChart = dynamic<LapTimeChartProps>(() => import('@/components/charts/lap-time-chart').then(m => m.LapTimeChart), { ssr: false, loading: () => <div className="h-64 bg-slate-800/50 rounded-lg animate-pulse" /> });
const LapPositionChart = dynamic<LapPositionChartProps>(() => import('@/components/charts/lap-position-chart').then(m => m.LapPositionChart), { ssr: false, loading: () => <div className="h-64 bg-slate-800/50 rounded-lg animate-pulse" /> });

interface Props { season: string; race: string; }

export function RaceDetailClient({ season, race }: Props) {
  const searchParams = useSearchParams();
  const idm = searchParams?.get('idm') ?? '0';
  const [data, setData] = useState<RaceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeTab, setActiveTab] = useState('telemetry');

  const loadRace = useCallback(() => {
    if (!idm || idm === '0') return;
    setLoading(true);
    setFetchError(false);
    fetch(`${basePath}/api/gpro/race-detail?idm=${idm}&season=${season}&race=${race}`)
      .then(r => {
        if (!r.ok) {
          if (r.status === 404) return null;
          throw new Error(`HTTP ${r.status}`);
        }
        return r.json();
      })
      .then((d: RaceDetailResponse | null) => setData(d))
      .catch(() => {
        toast.error('No se pudo cargar los datos de la carrera. Intenta de nuevo.');
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  }, [idm, season, race]);

  useEffect(() => { loadRace(); }, [loadRace]);

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (fetchError) return (
    <div className="p-6 flex flex-col items-center justify-center h-64 gap-4 text-slate-500">
      <p>No se pudo cargar los datos de la carrera</p>
      <button onClick={loadRace} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-600 transition-all">
        Reintentar
      </button>
      <Link href="/dashboard/races" className="text-blue-400 hover:text-blue-300 text-sm">← Volver a carreras</Link>
    </div>
  );

  if (!data) return (
    <div className="p-6 text-center text-slate-500">
      <p>No se encontraron datos para esta carrera</p>
      <Link href="/dashboard/races" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">← Volver</Link>
    </div>
  );

  const laps = data?.laps ?? [];
  const lastLap = laps?.[laps?.length - 1];
  const tabs = [
    { id: 'telemetry', label: 'Telemetría' },
    { id: 'setup', label: 'Setup' },
    { id: 'car', label: 'Vehículo' },
    { id: 'finance', label: 'Finanzas' },
  ];

  const partLabels: Record<string, string> = {
    chassis: 'Chasis', engine: 'Motor', fWing: 'Al. Delantero', rWing: 'Al. Trasero',
    underbody: 'Fondo Plano', sidepods: 'Pontones', cooling: 'Refrigeración',
    gear: 'Caja Cambios', brakes: 'Frenos', susp: 'Suspensión', electronics: 'Electrónica',
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/races" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Volver a carreras
          </Link>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">
            {data?.trackName ?? 'Carrera'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            S{season} R{race} · {data?.group ?? ''} · {data?.trackCountry ?? ''}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-mono font-bold ${getPositionColor(lastLap?.pos)}`}>
            P{lastLap?.pos ?? '-'}
          </div>
          <p className="text-xs text-slate-500">Resultado Final</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <QuickStat label="Q1" value={data?.q1Time ?? '-'} sub={`P${data?.q1Pos ?? '-'}`} />
        <QuickStat label="Q2" value={data?.q2Time ?? '-'} sub={`P${data?.q2Pos ?? '-'}`} />
        <QuickStat label="Vueltas" value={laps?.length ?? 0} />
        <QuickStat label="Pits" value={data?.pits?.length ?? 0} />
        <QuickStat label="Adelantamientos" value={`${data?.overtakes ?? 0}/${data?.otAttempts ?? 0}`} />
        <QuickStat label="Energía" value={formatRange(data?.raceEnergy)} />
      </div>

      {/* Driver Info */}
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Piloto: {data?.driver?.name ?? '-'}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { k: 'OA', v: data?.driver?.OA, c: data?.driverChanges?.OA },
            { k: 'CON', v: data?.driver?.con, c: data?.driverChanges?.con },
            { k: 'TAL', v: data?.driver?.tal, c: data?.driverChanges?.tal },
            { k: 'EXP', v: data?.driver?.exp, c: data?.driverChanges?.exp },
            { k: 'AGR', v: data?.driver?.agr, c: data?.driverChanges?.agr },
            { k: 'TEI', v: data?.driver?.tei, c: data?.driverChanges?.tei },
            { k: 'STA', v: data?.driver?.sta, c: data?.driverChanges?.sta },
            { k: 'CHA', v: data?.driver?.cha, c: data?.driverChanges?.cha },
            { k: 'MOT', v: data?.driver?.mot, c: data?.driverChanges?.mot },
            { k: 'REP', v: data?.driver?.rep, c: data?.driverChanges?.rep },
          ].map((s) => {
            const change = Number(s?.c ?? 0);
            return (
              <div key={s?.k} className="bg-slate-800/50 rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">{s?.k}</p>
                <p className="text-lg font-mono font-bold text-white">{s?.v ?? '-'}</p>
                {change !== 0 && (
                  <p className={`text-xs font-mono flex items-center justify-center gap-0.5 ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {change > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {change > 0 ? '+' : ''}{change}
                  </p>
                )}
              </div>
            );
          }) ?? []}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}>{tab?.label}</button>
        )) ?? []}
      </div>

      {/* Tab Content */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Lap Times Chart */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Tiempos por Vuelta
            </h3>
            <div className="h-72">
              <LapTimeChart laps={laps} pits={data?.pits ?? []} />
            </div>
          </div>

          {/* Position Chart */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-400" /> Posición por Vuelta
            </h3>
            <div className="h-72">
              <LapPositionChart laps={laps} />
            </div>
          </div>

          {/* Weather */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" /> Clima
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4]?.map?.((q: number) => (
                <div key={q} className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Q{q} Carrera</p>
                  <p className="text-sm text-white">
                    <Thermometer className="w-3 h-3 inline text-orange-400" /> {data?.weather?.[`raceQ${q}TempLow`] ?? '-'}-{data?.weather?.[`raceQ${q}TempHigh`] ?? '-'}°C
                  </p>
                  <p className="text-sm text-white">
                    <Droplets className="w-3 h-3 inline text-blue-400" /> {data?.weather?.[`raceQ${q}HumLow`] ?? '-'}-{data?.weather?.[`raceQ${q}HumHigh`] ?? '-'}%
                  </p>
                  <p className="text-xs text-slate-500">
                    Lluvia: {data?.weather?.[`raceQ${q}RainPLow`] ?? 0}-{data?.weather?.[`raceQ${q}RainPHigh`] ?? 0}%
                  </p>
                </div>
              )) ?? []}
            </div>
          </div>

          {/* Pits */}
          {(data?.pits?.length ?? 0) > 0 && (
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" /> Pit Stops
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 text-xs">
                      <th className="text-left py-2 px-3">#</th>
                      <th className="text-left py-2 px-3">Vuelta</th>
                      <th className="text-left py-2 px-3">Razón</th>
                      <th className="text-right py-2 px-3">Neumáticos</th>
                      <th className="text-right py-2 px-3">Combustible</th>
                      <th className="text-right py-2 px-3">Recarga</th>
                      <th className="text-right py-2 px-3">Tiempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.pits?.map?.((pit: PitResponse, i: number) => (
                      <tr key={i} className="border-t border-slate-700/30 text-slate-300">
                        <td className="py-2 px-3">{pit?.idx ?? i + 1}</td>
                        <td className="py-2 px-3 font-mono">{pit?.lap ?? '-'}</td>
                        <td className="py-2 px-3">{pit?.reason ?? '-'}</td>
                        <td className="py-2 px-3 text-right font-mono">{pit?.tyreCond ?? '-'}%</td>
                        <td className="py-2 px-3 text-right font-mono">{pit?.fuelLeft ?? '-'}L</td>
                        <td className="py-2 px-3 text-right font-mono">{pit?.refilledTo ?? '-'}L</td>
                        <td className="py-2 px-3 text-right font-mono text-blue-400">{pit?.pitTime ?? '-'}s</td>
                      </tr>
                    )) ?? []}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'setup' && (
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Setup Utilizado</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="text-left py-2 px-3">Sesión</th>
                  <th className="text-right py-2 px-3">Al. Del.</th>
                  <th className="text-right py-2 px-3">Al. Tras.</th>
                  <th className="text-right py-2 px-3">Motor</th>
                  <th className="text-right py-2 px-3">Frenos</th>
                  <th className="text-right py-2 px-3">Caja</th>
                  <th className="text-right py-2 px-3">Susp.</th>
                  <th className="text-right py-2 px-3">Neumáticos</th>
                </tr>
              </thead>
              <tbody>
                {data?.setupsUsed?.map?.((s: Record<string, string | number | null>, i: number) => (
                  <tr key={i} className="border-t border-slate-700/30 text-slate-300">
                    <td className="py-2 px-3 font-semibold text-white">{s?.session ?? '-'}</td>
                    <td className="py-2 px-3 text-right font-mono">{s?.setFWing ?? '-'}</td>
                    <td className="py-2 px-3 text-right font-mono">{s?.setRWing ?? '-'}</td>
                    <td className="py-2 px-3 text-right font-mono">{s?.setEng ?? '-'}</td>
                    <td className="py-2 px-3 text-right font-mono">{s?.setBra ?? '-'}</td>
                    <td className="py-2 px-3 text-right font-mono">{s?.setGear ?? '-'}</td>
                    <td className="py-2 px-3 text-right font-mono">{s?.setSusp ?? '-'}</td>
                    <td className="py-2 px-3 text-right">{s?.setTyres ?? '-'}</td>
                  </tr>
                )) ?? []}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Riesgo Q1</p>
              <p className="font-mono text-white">{data?.q1Risk ?? '-'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Riesgo Q2</p>
              <p className="font-mono text-white">{data?.q2Risk ?? '-'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Riesgo Salida</p>
              <p className="font-mono text-white">{data?.startRisk ?? '-'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Riesgo Adelantamiento</p>
              <p className="font-mono text-white">{data?.overtakeRisk ?? '-'}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'car' && (
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Estado del Vehículo</h3>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">Potencia</p>
              <p className="text-lg font-mono font-bold text-red-400">{data?.carPower ?? '-'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">Manejo</p>
              <p className="text-lg font-mono font-bold text-blue-400">{data?.carHandl ?? '-'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">Aceleración</p>
              <p className="text-lg font-mono font-bold text-emerald-400">{data?.carAccel ?? '-'}</p>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(data?.carParts ?? {}).map(([key, val]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-24 shrink-0">{partLabels?.[key] ?? key}</span>
                <span className="text-xs font-mono text-blue-400 w-8">Lv{val?.lvl ?? 0}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="h-full bg-emerald-500/30 rounded-full" style={{ width: `${val?.finishWear ?? 0}%` }} />
                    <div className="h-full bg-emerald-500 rounded-full absolute top-0 left-0" style={{ width: `${val?.startWear ?? 0}%` }} />
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 w-20 text-right">{val?.startWear ?? 0}% → {val?.finishWear ?? 0}%</span>
              </div>
            )) ?? []}
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Transacciones
          </h3>
          <div className="space-y-2">
            {data?.transactions?.map?.((t: { desc: string; amount: number }, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/30">
                <span className="text-sm text-slate-300">{t?.desc ?? '-'}</span>
                <span className={`font-mono text-sm ${(t?.amount ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(t?.amount ?? 0) >= 0 ? '+' : ''}{formatNum(t?.amount)}
                </span>
              </div>
            )) ?? []}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-600 flex justify-between">
            <span className="text-sm text-slate-400">Balance Actual</span>
            <span className="font-mono font-bold text-emerald-400">${formatNum(data?.currentBalance)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-mono font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-blue-400">{sub}</p>}
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

function formatNum(val: unknown): string {
  const num = Number(val ?? 0);
  if (isNaN(num)) return '0';
  return num?.toLocaleString?.('es-AR') ?? '0';
}

function formatRange(val: unknown): string {
  if (!val) return '-';
  if (typeof val === 'object' && val !== null && 'from' in val && 'to' in val) {
    return `${(val as { from: unknown; to: unknown }).from} → ${(val as { from: unknown; to: unknown }).to}`;
  }
  return String(val);
}
