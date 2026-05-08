'use client';
import { useEffect, useState, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Trophy, Flag, Car, User, DollarSign, Target, Activity } from 'lucide-react';
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
    fetch(`${basePath}/api/gpro/dashboard-summary?idm=${idm}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: DashboardSummaryResponse) => setSummary(d))
      .catch(() => {
        toast.error('No se pudo cargar el resumen del dashboard. Intenta de nuevo.');
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  }, [idm]);

  useEffect(() => { loadSummary(); }, [loadSummary]);

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
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !idm ? (
        <div className="flex items-center justify-center h-64 text-slate-500">
          <p>Accedé al dashboard desde el menú principal de la aplicación.</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500">
          <p>No se pudo cargar el resumen del dashboard</p>
          <button onClick={loadSummary} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-600 transition-all">
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Flag} label="Carreras Totales" value={summary?.totalRaces ?? 0} color="blue" />
            <StatCard icon={Trophy} label="Última Posición" value={summary?.latestRace?.finishPos ?? '-'} color="amber" />
            <StatCard icon={Target} label="Temporada Actual" value={`S${summary?.latestSeason ?? '-'}`} color="emerald" />
            <StatCard icon={DollarSign} label="Balance" value={formatMoney(summary?.latestRace?.balance)} color="violet" />
          </div>

          {/* Latest Race Info */}
          {summary?.latestRace && (
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                <Flag className="w-4 h-4 text-blue-400" /> Última Carrera
              </h3>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-lg font-bold text-white">{summary.latestRace.trackName}</p>
                  <p className="text-xs text-slate-500">S{summary.latestSeason} R{summary.latestRace.carrera}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-mono font-bold text-amber-400">P{summary.latestRace.finishPos}</p>
                  <p className="text-xs text-slate-500">Resultado</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-mono font-bold text-blue-400">P{summary.latestRace.q1Pos}</p>
                  <p className="text-xs text-slate-500">Clasificación</p>
                </div>
              </div>
            </div>
          )}

          {/* Pilot & Car Grid */}
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
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-24 shrink-0">{s.label}</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} rounded-full transition-all`}
                          style={{ width: `${Math.min(((s.value ?? 0) / (s.max ?? 1)) * 100, 100)}%` }} />
                      </div>
                      <span className="text-xs font-mono text-white w-8 text-right">{s.value ?? 0}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50">
                    <span className="text-xs text-slate-500">Peso: {pilot?.weight ?? '-'}kg</span>
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
                  {carParts.map((part) => (
                    <div key={part.name} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-20 shrink-0">{partLabels[part.name] ?? part.name}</span>
                      <span className="text-xs font-mono text-blue-400 w-8">Lv{part.lvl ?? 0}</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${
                          (part.wear ?? 0) > 80 ? 'bg-red-500' : (part.wear ?? 0) > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                          style={{ width: `${part.wear ?? 0}%` }} />
                      </div>
                      <span className={`text-xs font-mono w-10 text-right ${
                        (part.wear ?? 0) > 80 ? 'text-red-400' : (part.wear ?? 0) > 50 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{part.wear ?? 0}%</span>
                    </div>
                  ))}
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

function StatCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap?.[color] ?? colorMap.blue}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-mono font-bold">{value}</p>
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
