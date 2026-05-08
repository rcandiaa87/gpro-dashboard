'use client';
import { useEffect, useState, useMemo } from 'react';
import { useDashboardStore } from '@/lib/store';
import { basePath } from '@/lib/api';
import { Gauge, Loader2, Zap, RotateCcw, Search, X, Flag } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { TrackRow, TrackPerformanceResponse, TrackPerformancePoint } from '@/lib/gpro-types';

function posColor(pos: number | null | undefined): string {
  if (pos == null) return 'text-slate-500';
  if (pos <= 3) return 'text-emerald-400';
  if (pos <= 10) return 'text-yellow-400';
  return 'text-slate-300';
}

export function TracksClient() {
  const idm = useDashboardStore(s => s.idm);

  const [tracks, setTracks] = useState<TrackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [raceCounts, setRaceCounts] = useState<Record<number, number>>({});
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [performance, setPerformance] = useState<TrackPerformanceResponse | null>(null);
  const [perfLoading, setPerfLoading] = useState(false);

  useEffect(() => {
    fetch(`${basePath}/api/gpro/tracks`)
      .then(r => r.json())
      .then((d: TrackRow[]) => setTracks(Array.isArray(d) ? d : []))
      .catch(() => setTracks([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!idm) return;
    fetch(`${basePath}/api/gpro/track-race-counts?idm=${idm}`)
      .then(r => r.json())
      .then((d: Record<number, number>) => setRaceCounts(d ?? {}))
      .catch(() => setRaceCounts({}));
  }, [idm]);

  useEffect(() => {
    if (!selectedTrackId || !idm) return;
    setPerfLoading(true);
    setPerformance(null);
    fetch(`${basePath}/api/gpro/track-performance?idm=${idm}&trackId=${selectedTrackId}`)
      .then(r => r.json())
      .then((d: TrackPerformanceResponse) => setPerformance(d))
      .catch(() => setPerformance(null))
      .finally(() => setPerfLoading(false));
  }, [selectedTrackId, idm]);

  const filtered = tracks.filter(t => {
    const matchesSearch =
      (t.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.natCode ?? '').toLowerCase().includes(search.toLowerCase());
    const hasMineRaces = !onlyMine || (raceCounts[t.id] ?? 0) > 0;
    return matchesSearch && hasMineRaces;
  });

  const handleTrackClick = (trackId: number) => {
    setSelectedTrackId(prev => prev === trackId ? null : trackId);
  };

  const avgCarPha = useMemo(() => {
    const validRaces = (performance?.races ?? []).filter(
      (r: TrackPerformancePoint) => r.carPower !== null
    );
    if (!validRaces.length) return null;
    const n = validRaces.length;
    return {
      power: Math.round(validRaces.reduce((s, r) => s + (r.carPower ?? 0), 0) / n),
      handl: Math.round(validRaces.reduce((s, r) => s + (r.carHandl ?? 0), 0) / n),
      accel: Math.round(validRaces.reduce((s, r) => s + (r.carAccel ?? 0), 0) / n),
    };
  }, [performance]);

  const radarData = useMemo(() => {
    if (!performance?.track) return [];
    return [
      { subject: 'Potencia', Circuito: performance.track.power },
      { subject: 'Manejo', Circuito: performance.track.handl },
      { subject: 'Aceleración', Circuito: performance.track.accel },
    ];
  }, [performance]);

  const chartData = useMemo(() => {
    return (performance?.races ?? []).map((r: TrackPerformancePoint) => ({
      label: `T${r.temporada}·C${r.carrera}`,
      Q1: r.q1Pos,
      Q2: r.q2Pos,
      Llegada: r.finishPos,
    }));
  }, [performance]);

  const selectedTrackName = performance?.track?.name
    ?? filtered.find(t => t.id === selectedTrackId)?.name
    ?? '';

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">Circuitos</h1>
          <p className="text-sm text-slate-400 mt-1">{tracks.length} circuitos disponibles</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={e => setOnlyMine(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-blue-500 cursor-pointer"
            />
            <span className="text-sm text-slate-300 whitespace-nowrap">Solo mis circuitos</span>
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar circuito..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className={`flex gap-6 items-start transition-all`}>
          {/* Track grid */}
          <div className={selectedTrackId ? 'w-1/2 shrink-0' : 'w-full'}>
          <div className={`grid gap-4 ${selectedTrackId ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
            {filtered.map(track => (
              <button
                key={track.id}
                onClick={() => handleTrackClick(track.id)}
                className={`text-left bg-slate-900/80 border rounded-xl p-5 transition-all cursor-pointer w-full ${
                  selectedTrackId === track.id
                    ? 'border-blue-500 ring-1 ring-blue-500/40 shadow-lg shadow-blue-900/20'
                    : 'border-slate-700/50 hover:border-blue-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-white">{track.name ?? '-'}</p>
                    <p className="text-xs text-slate-500">{track.category ?? ''} · {track.natCode?.toUpperCase() ?? ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-slate-500">{track.gpsHeld ?? 0} GPs</span>
                    {(raceCounts[track.id] ?? 0) > 0 && (
                      <span className="text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5">
                        {raceCounts[track.id]} {raceCounts[track.id] === 1 ? 'carrera' : 'carreras'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <Zap className="w-3 h-3 mx-auto text-red-400 mb-1" />
                    <p className="text-xs text-slate-500">Potencia</p>
                    <p className="font-mono text-sm font-bold text-white">{track.power ?? '-'}</p>
                  </div>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <RotateCcw className="w-3 h-3 mx-auto text-blue-400 mb-1" />
                    <p className="text-xs text-slate-500">Manejo</p>
                    <p className="font-mono text-sm font-bold text-white">{track.handl ?? '-'}</p>
                  </div>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <Gauge className="w-3 h-3 mx-auto text-emerald-400 mb-1" />
                    <p className="text-xs text-slate-500">Aceler.</p>
                    <p className="font-mono text-sm font-bold text-white">{track.accel ?? '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Vueltas:</span><span className="font-mono text-white">{track.laps ?? '-'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Distancia:</span><span className="font-mono text-white">{Number(track.kms ?? 0).toFixed(1)}km</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Vel. media:</span><span className="font-mono text-white">{Number(track.avgSpeed ?? 0).toFixed(0)}km/h</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Curvas:</span><span className="font-mono text-white">{track.nbTurns ?? '-'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Downforce:</span><span className="font-mono text-white">{track.downforce ?? '-'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Desg. Neum.:</span><span className="font-mono text-white">{track.tyreWear ?? '-'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Adelantamiento:</span><span className="font-mono text-white">{track.overtaking ?? '-'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Grip:</span><span className="font-mono text-white">{track.gripLevel ?? '-'}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          </div>

          {/* Performance panel */}
          {selectedTrackId && (
            <div className="w-1/2 shrink-0 sticky top-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="bg-slate-900/80 border border-blue-500/30 rounded-xl p-6 space-y-6">
              {/* Panel header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Mi rendimiento · {selectedTrackName}
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {perfLoading
                      ? 'Cargando...'
                      : performance?.races?.length
                        ? `${performance.races.length} carrera${performance.races.length !== 1 ? 's' : ''} disputada${performance.races.length !== 1 ? 's' : ''}`
                        : 'Sin carreras en este circuito'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTrackId(null)}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {perfLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : !performance?.races?.length ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                  <Flag className="w-8 h-8 mb-2 opacity-40" />
                  <p>Aún no has disputado una carrera en este circuito</p>
                </div>
              ) : (
                <>
                  {/* Charts row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* PHA panel */}
                    <div className="bg-slate-800/50 rounded-xl p-4 space-y-4">
                      <h3 className="text-sm font-semibold text-slate-300">Perfil PHA del circuito</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 9 }} />
                          <Radar name="Circuito" dataKey="Circuito" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                        </RadarChart>
                      </ResponsiveContainer>

                      {/* Car PHA stats */}
                      {avgCarPha && (
                        <div>
                          <p className="text-xs text-slate-500 mb-2">PHA del vehículo (promedio en este circuito)</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center bg-slate-700/40 rounded-lg p-2">
                              <Zap className="w-3 h-3 mx-auto text-red-400 mb-1" />
                              <p className="text-xs text-slate-500">Potencia</p>
                              <p className="font-mono text-base font-bold text-white">{avgCarPha.power}</p>
                              <p className="text-xs text-amber-400 mt-0.5">Circ: {performance.track?.power}</p>
                            </div>
                            <div className="text-center bg-slate-700/40 rounded-lg p-2">
                              <RotateCcw className="w-3 h-3 mx-auto text-blue-400 mb-1" />
                              <p className="text-xs text-slate-500">Manejo</p>
                              <p className="font-mono text-base font-bold text-white">{avgCarPha.handl}</p>
                              <p className="text-xs text-amber-400 mt-0.5">Circ: {performance.track?.handl}</p>
                            </div>
                            <div className="text-center bg-slate-700/40 rounded-lg p-2">
                              <Gauge className="w-3 h-3 mx-auto text-emerald-400 mb-1" />
                              <p className="text-xs text-slate-500">Aceleración</p>
                              <p className="font-mono text-base font-bold text-white">{avgCarPha.accel}</p>
                              <p className="text-xs text-amber-400 mt-0.5">Circ: {performance.track?.accel}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Positions chart */}
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-3">Posiciones por carrera en este circuito</h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} />
                          <YAxis reversed domain={[1, 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                            labelStyle={{ color: '#94a3b8' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                          <Line type="monotone" dataKey="Q1" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                          <Line type="monotone" dataKey="Q2" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                          <Line type="monotone" dataKey="Llegada" stroke="#34d399" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 5 }} connectNulls />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* History table */}
                  <div className="bg-slate-800/50 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left px-4 py-3 text-slate-400 font-medium">Temporada · Carrera</th>
                          <th className="text-center px-3 py-3 text-yellow-400 font-medium">Q1</th>
                          <th className="text-center px-3 py-3 text-violet-400 font-medium">Q2</th>
                          <th className="text-center px-3 py-3 text-emerald-400 font-medium">Llegada</th>
                          <th className="text-center px-3 py-3 text-red-400 font-medium">
                            <Zap className="w-3 h-3 inline mr-1" />Pot.
                          </th>
                          <th className="text-center px-3 py-3 text-blue-400 font-medium">
                            <RotateCcw className="w-3 h-3 inline mr-1" />Man.
                          </th>
                          <th className="text-center px-3 py-3 text-teal-400 font-medium">
                            <Gauge className="w-3 h-3 inline mr-1" />Acel.
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {performance.races.map((r: TrackPerformancePoint, i: number) => (
                          <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                            <td className="px-4 py-3 text-slate-300 font-mono">
                              T{r.temporada} · C{r.carrera}
                            </td>
                            <td className={`text-center px-3 py-3 font-mono font-bold ${posColor(r.q1Pos)}`}>
                              {r.q1Pos ?? '-'}
                            </td>
                            <td className={`text-center px-3 py-3 font-mono font-bold ${posColor(r.q2Pos)}`}>
                              {r.q2Pos ?? '-'}
                            </td>
                            <td className={`text-center px-3 py-3 font-mono font-bold ${posColor(r.finishPos)}`}>
                              {r.finishPos ?? '-'}
                            </td>
                            <td className="text-center px-3 py-3 font-mono text-slate-300">{r.carPower ?? '-'}</td>
                            <td className="text-center px-3 py-3 font-mono text-slate-300">{r.carHandl ?? '-'}</td>
                            <td className="text-center px-3 py-3 font-mono text-slate-300">{r.carAccel ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
