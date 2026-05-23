import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import type { KpiDef, KpiSnapshot } from '@/types';
import { fmt } from '@/lib/format';

interface Props {
  def: KpiDef;
  snapshot: KpiSnapshot;
  height?: number;
}

export function TrendChart({ def, snapshot, height = 280 }: Props) {
  const data = useMemo(() => {
    const days = snapshot.series.length;
    const now = new Date();
    return snapshot.series.map((value, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (days - 1 - i));
      return {
        date: d.toISOString().slice(0, 10),
        value,
        benchmark: snapshot.benchmark,
      };
    });
  }, [snapshot]);

  const color = '#2DD4BF';
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1A1F23" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => fmt.date(d)}
            stroke="#3D4348"
            tick={{ fill: '#5C6469', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={{ stroke: '#1A1F23' }}
            minTickGap={32}
          />
          <YAxis
            stroke="#3D4348"
            tick={{ fill: '#5C6469', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => fmt.kpi(Number(v), def.unit)}
          />
          <Tooltip
            cursor={{ stroke: '#363D43', strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const v = Number(payload[0]?.value ?? 0);
              return (
                <div className="panel-raised px-3 py-2 text-xs shadow-xl">
                  <div className="num text-text-tertiary">{fmt.date(String(label))}</div>
                  <div className="num text-text-primary mt-0.5 font-medium text-md">{fmt.kpi(v, def.unit)}</div>
                  <div className="num text-text-tertiary mt-1">bench {fmt.kpi(snapshot.benchmark, def.unit)}</div>
                </div>
              );
            }}
          />
          <ReferenceLine y={snapshot.benchmark} stroke="#5C6469" strokeDasharray="3 3" />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill="url(#trend-gradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
