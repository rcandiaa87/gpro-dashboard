'use client';
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

interface SeasonSelectorProps {
  selectedSeason: number;
  onSeasonChange: (season: number) => void;
  idm: number;
}

export function SeasonSelector({ selectedSeason, onSeasonChange, idm }: SeasonSelectorProps) {
  const [seasons, setSeasons] = useState<number[]>([]);

  useEffect(() => {
    if (!idm) return;
    fetch(`/api/gpro/seasons?idm=${idm}`)
      .then((r) => r.json())
      .then((data: any) => {
        const s = (data ?? [])?.map?.((r: any) => r?.temporada) ?? [];
        setSeasons(s);
      })
      .catch(() => setSeasons([]));
  }, [idm]);

  return (
    <div className="flex items-center gap-3">
      <Calendar className="w-4 h-4 text-blue-400" />
      <select
        value={selectedSeason}
        onChange={(e) => onSeasonChange(Number(e.target.value))}
        className="bg-slate-800 border border-slate-600 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {(seasons ?? [])?.map?.((s: number) => (
          <option key={s} value={s}>Temporada {s}</option>
        )) ?? []}
      </select>
    </div>
  );
}
