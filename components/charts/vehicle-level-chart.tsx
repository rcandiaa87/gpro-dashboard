'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Props {
  data: any[];
  partColors: Record<string, string>;
  partLabels: Record<string, string>;
}

export function VehicleLevelChart({ data, partColors, partLabels }: Props) {
  // Show latest race levels as grouped bar
  const latestRace = data?.[data?.length - 1];
  if (!latestRace) return <p className="text-slate-500 text-sm text-center">Sin datos</p>;

  const chartData = Object.keys(partLabels ?? {})?.map?.((key: string) => ({
    name: partLabels?.[key] ?? key,
    nivel: latestRace?.parts?.[key]?.lvl ?? 0,
    desgaste: latestRace?.parts?.[key]?.finishWear ?? 0,
    fill: partColors?.[key] ?? '#60B5FF',
  })) ?? [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 45, left: 20 }}>
        <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-45} textAnchor="end" height={60} />
        <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }}
          label={{ value: 'Nivel', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11, fill: '#94a3b8' } }} />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
        <Bar dataKey="nivel" fill="#60B5FF" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
