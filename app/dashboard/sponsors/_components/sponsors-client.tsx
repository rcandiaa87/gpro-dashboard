'use client';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, Search, Handshake, CircleDot, ChevronRight, SlidersHorizontal, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useDashboardStore } from '@/lib/store';
import { basePath } from '@/lib/api';
import { getSponsorAnswers } from '@/lib/sponsor-logic';
import type { SponsorAttributes, SponsorAnswer } from '@/lib/sponsor-logic';

interface Sponsor extends SponsorAttributes {
  name: string;
  idx: string;
  sponsorId: string;
  natCode: string;
  estAvgProgress: number;
  progressColor: string;
  isInNeg: boolean;
}

interface ActiveNegotiation {
  name: string;
  sponsorId: number;
  carSpotName: string;
  progress: string;
  avgProgress: string;
  contested: string;
  textColor: string;
}

interface ActiveContract {
  name: string;
  sponsorId: number;
  carSpotName: string;
  amount: number | string;
  racesLeft: number | string;
  satisfaction: number | string;
}

interface SponsorsData {
  group: string;
  sponsors: Sponsor[];
  activeNegotiations: ActiveNegotiation[];
  activeContracts: ActiveContract[];
}

type SortKey = keyof SponsorAttributes;
type SortDir = 'asc' | 'desc';

const ATTR_KEYS: { key: SortKey; label: string }[] = [
  { key: 'finances',     label: 'Finanzas' },
  { key: 'expectations', label: 'Expectativas' },
  { key: 'patience',     label: 'Paciencia' },
  { key: 'reputation',   label: 'Reputación' },
  { key: 'image',        label: 'Imagen' },
  { key: 'negotiation',  label: 'Negociación' },
];

const SEGMENT_COLORS = [
  'bg-red-500',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-yellow-400',
  'bg-yellow-400',
  'bg-lime-500',
  'bg-green-500',
];

function SegmentedBar({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const filled = value + 1;
  const h = size === 'sm' ? 'h-2' : 'h-3.5';
  const w = size === 'sm' ? 'w-3' : 'w-5';
  return (
    <div className="flex gap-px">
      {SEGMENT_COLORS.map((color, i) => (
        <div
          key={i}
          className={`${h} ${w} rounded-sm transition-colors ${i < filled ? color : 'bg-slate-700'}`}
        />
      ))}
    </div>
  );
}

function natToFlag(natCode: string): string {
  if (!natCode || natCode.length !== 2) return '🏳';
  return natCode.toUpperCase().split('').map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))).join('');
}

const ANSWER_COLORS: Record<number, string> = {
  1: 'border-purple-500/30 bg-purple-500/10',
  2: 'border-blue-500/30 bg-blue-500/10',
  3: 'border-emerald-500/30 bg-emerald-500/10',
  4: 'border-amber-500/30 bg-amber-500/10',
  5: 'border-orange-500/30 bg-orange-500/10',
};

const ANSWER_BADGE_COLORS: Record<number, string> = {
  1: 'bg-purple-500/20 text-purple-300',
  2: 'bg-blue-500/20 text-blue-300',
  3: 'bg-emerald-500/20 text-emerald-300',
  4: 'bg-amber-500/20 text-amber-300',
  5: 'bg-orange-500/20 text-orange-300',
};

function AnswerCard({ ans }: { ans: SponsorAnswer }) {
  return (
    <div className={`rounded-lg border p-4 ${ANSWER_COLORS[ans.questionNumber]}`}>
      <div className="flex items-start gap-3">
        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${ANSWER_BADGE_COLORS[ans.questionNumber]}`}>
          P{ans.questionNumber}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 mb-1">{ans.question}</p>
          <p className="text-sm font-semibold text-white">"{ans.answer}"</p>
          {ans.answer2 && (
            <p className="text-sm font-semibold text-slate-300 mt-0.5">
              <span className="text-slate-500 text-xs mr-1">o bien</span>
              "{ans.answer2}"
            </p>
          )}
          {ans.note && (
            <p className="text-xs text-slate-500 mt-1 italic">{ans.note}</p>
          )}
        </div>
        {ans.attribute !== '—' && (
          <span className="shrink-0 text-xs text-slate-500 hidden sm:block">↑ {ans.attribute}</span>
        )}
      </div>
    </div>
  );
}

const DEFAULT_FILTERS: Record<SortKey, number> = {
  finances: 0, expectations: 0, patience: 0,
  reputation: 0, image: 0, negotiation: 0,
};

export function SponsorsClient() {
  const { idm } = useDashboardStore();
  const [data, setData]           = useState<SponsorsData | null>(null);
  const [loading, setLoading]     = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [selected, setSelected]   = useState<Sponsor | null>(null);
  const [search, setSearch]       = useState('');
  const [onlyNeg, setOnlyNeg]     = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]     = useState<Record<SortKey, number>>(DEFAULT_FILTERS);
  const [sortKey, setSortKey]     = useState<SortKey | null>(null);
  const [sortDir, setSortDir]     = useState<SortDir>('desc');

  const loadSponsors = useCallback(() => {
    if (!idm) return;
    setLoading(true);
    setFetchError(false);
    const controller = new AbortController();
    fetch(`${basePath}/api/gpro/sponsors?idm=${idm}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: SponsorsData) => setData(d))
      .catch((e) => {
        if (e.name === 'AbortError') return;
        toast.error('No se pudo cargar los sponsors. Intenta de nuevo.');
        setFetchError(true);
      })
      .finally(() => setLoading(false));
    return controller;
  }, [idm]);

  useEffect(() => {
    const controller = loadSponsors();
    return () => controller?.abort();
  }, [loadSponsors]);

  const hasActiveFilters = Object.values(filters).some(v => v > 0);

  const filtered = (data?.sponsors ?? [])
    .filter(s => {
      if (onlyNeg && !s.isInNeg) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      for (const { key } of ATTR_KEYS) {
        if (s[key] < filters[key]) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      return sortDir === 'desc' ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey];
    });

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const answers: SponsorAnswer[] = selected ? getSponsorAnswers(selected, data?.group ?? '') : [];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">Sponsors</h1>
          <p className="text-sm text-slate-400 mt-1">
            Respuestas recomendadas para negociaciones
            {data?.group && <span className="ml-2 text-blue-400 font-medium">{data.group}</span>}
          </p>
        </div>
      </div>

      {/* Active contracts */}
      {(data?.activeContracts?.length ?? 0) > 0 && (
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Contratos activos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data!.activeContracts.map((c) => (
              <div key={c.sponsorId} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                <CircleDot className="w-3 h-3 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.carSpotName} · {c.racesLeft} carreras</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active negotiations */}
      {(data?.activeNegotiations?.length ?? 0) > 0 && (
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Negociaciones en curso</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data!.activeNegotiations.map((n) => (
              <button
                key={n.sponsorId}
                onClick={() => {
                  const s = data?.sponsors.find(sp => String(sp.sponsorId) === String(n.sponsorId));
                  if (s) setSelected(s);
                }}
                className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-left hover:bg-blue-500/20 transition-colors w-full"
              >
                <Handshake className="w-3 h-3 text-blue-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{n.name}</p>
                  <p className="text-xs text-slate-400">{n.carSpotName} · {n.progress}% progreso</p>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
          <p>No se pudo cargar los sponsors</p>
          <button onClick={loadSponsors} className="px-4 min-h-[44px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-600 transition-colors">
            Reintentar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── Sponsor list ── */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl flex flex-col">

            {/* Search + filter toggle */}
            <div className="p-4 border-b border-slate-700/50 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar sponsor..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(f => !f)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyNeg}
                  onChange={e => setOnlyNeg(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-400">Solo negociaciones activas</span>
              </label>

              {/* Filter panel */}
              {showFilters && (
                <div className="bg-slate-800/60 rounded-lg p-3 space-y-2 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filtrar por mínimo</span>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" /> Limpiar
                      </button>
                    )}
                  </div>
                  {ATTR_KEYS.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-24 shrink-0">{label}</span>
                      <input
                        type="range"
                        min={0}
                        max={6}
                        value={filters[key]}
                        onChange={e => setFilters(f => ({ ...f, [key]: Number(e.target.value) }))}
                        className="flex-1 accent-blue-500 h-1.5"
                      />
                      <span className="text-xs font-mono text-blue-400 w-3 text-right">{filters[key]}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sort buttons */}
              <div className="flex flex-wrap gap-1.5">
                {ATTR_KEYS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors ${
                      sortKey === key
                        ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {label}
                    {sortKey === key && (
                      sortDir === 'desc'
                        ? <ArrowDown className="w-3 h-3" />
                        : <ArrowUp className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>

              <p className="text-xs text-slate-600">{filtered.length} sponsor{filtered.length !== 1 ? 's' : ''}</p>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[600px]">
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                  No hay sponsors con esos filtros
                </div>
              ) : (
                <ul>
                  {filtered.map((s) => (
                    <li key={s.sponsorId}>
                      <button
                        onClick={() => setSelected(s)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-slate-800/60 hover:bg-slate-800/50 ${
                          selected?.sponsorId === s.sponsorId
                            ? 'bg-slate-800/80 border-l-2 border-l-blue-500'
                            : ''
                        }`}
                      >
                        <span className="text-xl leading-none mt-0.5 shrink-0">{natToFlag(s.natCode)}</span>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white truncate">{s.name}</span>
                            {s.isInNeg && (
                              <span className="shrink-0 text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full">Neg.</span>
                            )}
                          </div>
                          {/* Attribute bars */}
                          <div className="space-y-1">
                            {ATTR_KEYS.map(({ key, label }) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 w-20 shrink-0">{label}</span>
                                <SegmentedBar value={s[key]} size="sm" />
                                <span className="text-xs font-mono text-slate-500 w-3 text-right">{s[key]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mt-1" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ── Detail panel ── */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl">
            {!selected ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-500 gap-2 p-8">
                <Handshake className="w-10 h-10 text-slate-700" />
                <p className="text-sm text-center">Selecciona un sponsor para ver las respuestas recomendadas</p>
              </div>
            ) : (
              <div className="p-5 space-y-5">
                {/* Sponsor header */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none">{natToFlag(selected.natCode)}</span>
                  <div>
                    <h2 className="text-lg font-display font-bold text-white">{selected.name}</h2>
                    <p className="text-xs text-slate-400">
                      Sponsor #{selected.sponsorId}
                      {selected.isInNeg && (
                        <span className="ml-2 text-blue-400 font-medium">· En negociación activa</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Attribute bars (large) */}
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Atributos</h3>
                  {ATTR_KEYS.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-24 shrink-0">{label}</span>
                      <SegmentedBar value={selected[key]} size="md" />
                      <span className="text-xs font-mono text-slate-300 w-3 text-right">{selected[key]}</span>
                    </div>
                  ))}
                </div>

                {/* Recommended answers */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Respuestas recomendadas</h3>
                  {answers.map((ans) => (
                    <AnswerCard key={ans.questionNumber} ans={ans} />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
