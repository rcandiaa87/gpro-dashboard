'use client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
  laps: any[];
}

export function LapPositionChart({ laps }: Props) {
  const chartData = (laps ?? [])?.map?.((l: any) => ({
    lap: (l?.idx ?? 0) + 1,
    pos: l?.pos ?? null,
  }))?.filter?.((d: any) => d?.pos != null) ?? [];

  if (chartData?.length === 0) return <p className="text-slate-500 text-sm text-center">Sin datos de posición</p>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 20 }}>
        <XAxis dataKey="lap" tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }}
          label={{ value: 'Vuelta', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11, fill: '#94a3b8' } }} />
        <YAxis reversed domain={[1, 'auto']} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }}
          label={{ value: 'Posición', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#94a3b8' } }} />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
          labelFormatter={(v: any) => `Vuelta ${v}`}
          formatter={(v: number) => [`P${v}`, 'Posición']} />
        <Area type="stepAfter" dataKey="pos" stroke="#FF9149" fill="#FF9149" fillOpacity={0.15} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
