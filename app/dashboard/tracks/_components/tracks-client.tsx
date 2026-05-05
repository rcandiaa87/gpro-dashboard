'use client';
import { useEffect, useState } from 'react';
import { Gauge, Loader2, Zap, RotateCcw, Wind, Droplets, Search } from 'lucide-react';

export function TracksClient() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/gpro/tracks')
      .then(r => r.json())
      .then((d: any) => setTracks(Array.isArray(d) ? d : []))
      .catch(() => setTracks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (tracks ?? [])?.filter?.((t: any) =>
    (t?.name ?? '')?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? '') ||
    (t?.natCode ?? '')?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? '')
  ) ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">Circuitos</h1>
          <p className="text-sm text-slate-400 mt-1">{tracks?.length ?? 0} circuitos disponibles</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar circuito..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered?.map?.((track: any) => (
            <div key={track?.id} className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-white">{track?.name ?? '-'}</p>
                  <p className="text-xs text-slate-500">{track?.category ?? ''} · {track?.natCode?.toUpperCase?.() ?? ''}</p>
                </div>
                <div className="text-xs text-slate-500">{track?.gpsHeld ?? 0} GPs</div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center bg-slate-800/50 rounded-lg p-2">
                  <Zap className="w-3 h-3 mx-auto text-red-400 mb-1" />
                  <p className="text-xs text-slate-500">Potencia</p>
                  <p className="font-mono text-sm font-bold text-white">{track?.power ?? '-'}</p>
                </div>
                <div className="text-center bg-slate-800/50 rounded-lg p-2">
                  <RotateCcw className="w-3 h-3 mx-auto text-blue-400 mb-1" />
                  <p className="text-xs text-slate-500">Manejo</p>
                  <p className="font-mono text-sm font-bold text-white">{track?.handl ?? '-'}</p>
                </div>
                <div className="text-center bg-slate-800/50 rounded-lg p-2">
                  <Gauge className="w-3 h-3 mx-auto text-emerald-400 mb-1" />
                  <p className="text-xs text-slate-500">Aceler.</p>
                  <p className="font-mono text-sm font-bold text-white">{track?.accel ?? '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Vueltas:</span><span className="font-mono text-white">{track?.laps ?? '-'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Distancia:</span><span className="font-mono text-white">{Number(track?.kms ?? 0)?.toFixed?.(1) ?? '-'}km</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Vel. media:</span><span className="font-mono text-white">{Number(track?.avgSpeed ?? 0)?.toFixed?.(0) ?? '-'}km/h</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Curvas:</span><span className="font-mono text-white">{track?.nbTurns ?? '-'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Downforce:</span><span className="font-mono text-white">{track?.downforce ?? '-'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Desg. Neum.:</span><span className="font-mono text-white">{track?.tyreWear ?? '-'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Adelantamiento:</span><span className="font-mono text-white">{track?.overtaking ?? '-'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Grip:</span><span className="font-mono text-white">{track?.gripLevel ?? '-'}</span>
                </div>
              </div>
            </div>
          )) ?? []}
        </div>
      )}
    </div>
  );
}
