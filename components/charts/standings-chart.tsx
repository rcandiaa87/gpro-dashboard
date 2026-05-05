'use client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
  data: any[];
}

export function StandingsChart({ data }: Props) {
  if (!data?.length) return <p className="text-slate-500 text-sm text-center">Sin datos</p>;

  const hasPosition = data?.some?.((d: any) => d?.position != null);
  const hasPoints = data?.some?.((d: any) => d?.points != null);

  if (hasPoints && !hasPosition) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data ?? []} margin={{ top: 5, right: 20, bottom: 25, left: 20 }}>
          <XAxis dataKey="label" tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
          <Area type="monotone" dataKey="points" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data ?? []} margin={{ top: 5, right: 20, bottom: 25, left: 20 }}>
        <XAxis dataKey="label" tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <YAxis reversed domain={[1, 'auto']} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
          formatter={(v: number) => [`P${v}`, 'Posición']} />
        <Area type="monotone" dataKey="position" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
