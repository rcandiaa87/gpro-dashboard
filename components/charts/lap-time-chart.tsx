'use client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

interface Props {
  laps: any[];
  pits: any[];
}

function lapTimeToSeconds(t: string): number | null {
  if (!t || t === '-') return null;
  const match = t?.match?.(/(\d+):(\d+\.\d+)/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function LapTimeChart({ laps, pits }: Props) {
  const chartData = (laps ?? [])?.map?.((l: any) => ({
    lap: (l?.idx ?? 0) + 1,
    time: lapTimeToSeconds(l?.lapTime ?? ''),
    timeStr: l?.lapTime ?? '',
  }))?.filter?.((d: any) => d?.time != null) ?? [];

  if (chartData?.length === 0) return <p className="text-slate-500 text-sm text-center">Sin datos de tiempos</p>;

  const pitLaps = (pits ?? [])?.map?.((p: any) => p?.lap) ?? [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 20 }}>
        <XAxis dataKey="lap" tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }}
          label={{ value: 'Vuelta', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11, fill: '#94a3b8' } }} />
        <YAxis domain={['auto', 'auto']} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickFormatter={(v: number) => `${Math.floor(v / 60)}:${(v % 60)?.toFixed?.(1)?.padStart(4, '0')}`}
          label={{ value: 'Tiempo', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#94a3b8' } }} />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
          labelFormatter={(v: any) => `Vuelta ${v}`}
          formatter={(v: number) => [`${Math.floor(v / 60)}:${(v % 60)?.toFixed?.(3)?.padStart(6, '0')}`, 'Tiempo']} />
        {pitLaps?.map?.((pl: number) => (
          <ReferenceLine key={pl} x={pl} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} />
        )) ?? []}
        <Line type="monotone" dataKey="time" stroke="#60B5FF" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
