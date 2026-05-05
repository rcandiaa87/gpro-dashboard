'use client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
  data: any[];
  dataKey: string;
  color: string;
}

export function PilotEvolutionChart({ data, dataKey, color }: Props) {
  if (!data?.length) return <p className="text-slate-500 text-sm text-center">Sin datos</p>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data ?? []} margin={{ top: 5, right: 20, bottom: 25, left: 20 }}>
        <XAxis dataKey="label" tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} interval="preserveStartEnd"
          label={{ value: 'Carrera', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11, fill: '#94a3b8' } }} />
        <YAxis domain={['auto', 'auto']} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
        <Area type="monotone" dataKey={dataKey} stroke={color ?? '#60B5FF'} fill={color ?? '#60B5FF'} fillOpacity={0.1} strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
