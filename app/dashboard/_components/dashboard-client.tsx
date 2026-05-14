'use client';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Flag, Car, User, Activity } from 'lucide-react';
import { CarPartsRadar } from '@/components/charts/car-parts-radar';
import { PilotStatsRadar } from '@/components/charts/pilot-stats-radar';
import { useDashboardStore } from '@/lib/store';
import { basePath } from '@/lib/api';
import type { DashboardSummaryResponse } from '@/lib/gpro-types';

export function DashboardClient() {
  const idm = useDashboardStore((s) => s.idm);
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const loadSummary = useCallback(() => {
    if (!idm) return;
    setLoading(true);
    setFetchError(false);
    const controller = new AbortController();
    fetch(`${basePath}/api/gpro/dashboard-summary?idm=${idm}`, { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: DashboardSummaryResponse) => setSummary(d))
      .catch((e) => {
        if (e.name === 'AbortError') return;
        toast.error('No se pudo cargar el resumen del dashboard. Intenta de nuevo.');
        setFetchError(true);
      })
      .finally(() => setLoading(false));
    return controller;
  }, [idm]);

  useEffect(() => {
    const controller = loadSummary();
    return () => controller?.abort();
  }, [loadSummary]);

  const pilot = summary?.pilot;
  const car = summary?.car;
  const carParts = car ? Object.entries(car).map(([key, val]) => ({
    name: key, lvl: val.lvl ?? 0, wear: val.wear ?? 0,
  })) : [];

  const partLabels: Record<string, string> = {
    chassis: 'Chasis', engine: 'Motor', fWing: 'Al. Del.', rWing: 'Al. Tras.',
    underbody: 'F. Plano', sidepods: 'Pontones', cooling: 'Refrig.',
    gear: 'Caja', brakes: 'Frenos', susp: 'Susp.', electronics: 'Electr.',
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            {summary?.user?.name ? `Manager: ${summary.user.name}` : 'Cargando...'}
            {summary?.latestRace?.group ? ` · ${summary.latestRace.group}` : ''}
          </p>
        </div>
      </div>

      {loading && idm ? (
        <div className="flex items-center justify-center h-64">
          <div role="status" aria-label="Cargando datos del dashboard">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          </div>
        </div>
      ) : !idm ? (
        <div className="flex items-center justify-center h-64 text-slate-500">
          <p>Accedé al dashboard desde el menú principal de la aplicación.</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
          <p>No se pudo cargar el resumen del dashboard</p>
          <button onClick={loadSummary} className="px-4 min-h-[44px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-600 transition-colors">
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Métricas rápidas — sin hero-metric template */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-800 bg-slate-900/60 rounded-xl border border-slate-800">
            <Metric label="Carreras totales" value={summary?.totalRaces ?? 0} />
            <Metric label="Última posición" value={summary?.latestRace?.finishPos != null ? `P${summary.latestRace.finishPos}` : '—'} highlight />
            <Metric label="Temporada" value={`S${summary?.latestSeason ?? '—'}`} />
            <Metric label="Balance" value={formatMoney(summary?.latestRace?.balance)} />
          </div>

          {/* Última carrera — tratamiento distinto al resto de secciones */}
          {summary?.latestRace && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 py-5 px-1 border-b border-slate-800">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Última carrera</p>
                <p className="text-xl font-display font-bold text-white truncate">{summary.latestRace.trackName}</p>
                <p className="text-xs text-slate-400 mt-0.5">S{summary.latestSeason} · R{summary.latestRace.carrera}</p>
              </div>
              <div className="flex items-center gap-8 shrink-0">
                <div>
                  <p className="text-3xl font-mono font-bold text-amber-400">P{summary.latestRace.finishPos}</p>
                  <p className="text-xs text-slate-400">Carrera</p>
                </div>
                <div>
                  <p className="text-3xl font-mono font-bold text-blue-400">P{summary.latestRace.q1Pos}</p>
                  <p className="text-xs text-slate-400">Qualy</p>
                </div>
              </div>
            </div>
          )}

          {/* Piloto & Vehículo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pilot Stats */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" /> Estado del Piloto
              </h3>
              {pilot ? (
                <div className="space-y-3">
                  {[
                    { label: 'Overall', value: pilot?.oa, max: 300, color: 'bg-blue-500' },
                    { label: 'Concentración', value: pilot?.concentration, max: 300, color: 'bg-emerald-500' },
                    { label: 'Talento', value: pilot?.talent, max: 300, color: 'bg-amber-500' },
                    { label: 'Experiencia', value: pilot?.experience, max: 300, color: 'bg-violet-500' },
                    { label: 'Resistencia', value: pilot?.stamina, max: 300, color: 'bg-rose-500' },
                    { label: 'Agresividad', value: pilot?.aggressiveness, max: 300, color: 'bg-red-500' },
                    { label: 'Con. Técnico', value: pilot?.techInsight, max: 300, color: 'bg-cyan-500' },
                    { label: 'Carisma', value: pilot?.charisma, max: 300, color: 'bg-pink-500' },
                    { label: 'Motivación', value: pilot?.motivation, max: 300, color: 'bg-orange-500' },
                  ].map((s) => {
                    const pct = Math.min(((s.value ?? 0) / (s.max ?? 1)) * 100, 100);
                    return (
                      <div key={s.label} className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-24 shrink-0">{s.label}</span>
                        <div
                          role="progressbar"
                          aria-label={s.label}
                          aria-valuenow={s.value ?? 0}
                          aria-valuemin={0}
                          aria-valuemax={s.max}
                          className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden"
                        >
                          <div className={`h-full ${s.color} rounded-full transition-[width]`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-mono text-white w-8 text-right">{s.value ?? 0}</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50">
                    <span className="text-xs text-slate-400">Peso: {pilot?.weight ?? '-'}kg</span>
                  </div>
                </div>
              ) : <p className="text-slate-500 text-sm">Sin datos de piloto</p>}
            </div>

            {/* Car State */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <Car className="w-4 h-4 text-red-400" /> Estado del Vehículo
              </h3>
              {car ? (
                <div className="space-y-3">
                  {carParts.map((part) => {
                    const wear = part.wear ?? 0;
                    const wearColor = wear > 80 ? 'bg-red-500' : wear > 50 ? 'bg-amber-500' : 'bg-emerald-500';
                    const wearTextColor = wear > 80 ? 'text-red-400' : wear > 50 ? 'text-amber-400' : 'text-emerald-400';
                    const partName = partLabels[part.name] ?? part.name;
                    return (
                      <div key={part.name} className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-20 shrink-0">{partName}</span>
                        <span className="text-xs font-mono text-blue-400 w-8">Lv{part.lvl ?? 0}</span>
                        <div
                          role="progressbar"
                          aria-label={`Desgaste de ${partName}`}
                          aria-valuenow={wear}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden"
                        >
                          <div className={`h-full rounded-full transition-[width] ${wearColor}`}
                            style={{ width: `${wear}%` }} />
                        </div>
                        <span className={`text-xs font-mono w-10 text-right ${wearTextColor}`}>{wear}%</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-slate-500 text-sm">Sin datos de vehículo</p>}
            </div>
          </div>

          {/* Staff */}
          {summary?.staff && (
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Staff
              </h3>
              <div className="flex gap-8">
                <div>
                  <p className="text-2xl font-mono font-bold text-white">{summary.staff.concentration ?? '-'}</p>
                  <p className="text-xs text-slate-500">Concentración</p>
                </div>
                <div>
                  <p className="text-2xl font-mono font-bold text-white">{summary.staff.stress ?? '-'}</p>
                  <p className="text-xs text-slate-500">Estrés</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-mono font-bold ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function formatMoney(val: unknown): string {
  if (val == null) return '-';
  const num = Number(val);
  if (isNaN(num)) return '-';
  if (num >= 1_000_000) return `$${(num / 1_000_000)?.toFixed?.(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000)?.toFixed?.(0)}K`;
  return `$${num}`;
}
