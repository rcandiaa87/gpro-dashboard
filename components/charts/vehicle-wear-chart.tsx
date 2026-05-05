'use client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Props {
  data: any[];
  partColors: Record<string, string>;
  partLabels: Record<string, string>;
}

export function VehicleWearChart({ data, partColors, partLabels }: Props) {
  const chartData = (data ?? [])?.map?.((d: any) => {
    const row: any = { label: d?.label ?? '' };
    Object.keys(partLabels ?? {})?.forEach?.((key: string) => {
      row[key] = d?.parts?.[key]?.finishWear ?? 0;
    });
    return row;
  }) ?? [];

  if (!chartData?.length) return <p className="text-slate-500 text-sm text-center">Sin datos</p>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 20 }}>
        <XAxis dataKey="label" tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} interval="preserveStartEnd"
          label={{ value: 'Carrera', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11, fill: '#94a3b8' } }} />
        <YAxis domain={[0, 100]} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }}
          label={{ value: 'Desgaste %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#94a3b8' } }} />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
          formatter={(v: number, name: string) => [`${v}%`, partLabels?.[name] ?? name]} />
        <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }}
          formatter={(v: string) => partLabels?.[v] ?? v} />
        {Object.keys(partLabels ?? {})?.map?.((key: string) => (
          <Line key={key} type="monotone" dataKey={key} stroke={partColors?.[key] ?? '#60B5FF'}
            strokeWidth={1.5} dot={false} />
        )) ?? []}
      </LineChart>
    </ResponsiveContainer>
  );
}
