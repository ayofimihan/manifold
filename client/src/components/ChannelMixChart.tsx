import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { ChannelMixRow } from '@/types';
import { CHANNEL_COLORS } from '@/data/channelMix';
import { fmt } from '@/lib/format';

export function ChannelMixChart({ rows }: { rows: ChannelMixRow[] }) {
  const total = rows.reduce((a, b) => a + b.spend, 0);
  const data = rows.map((r) => ({ name: r.channel, value: r.spend, color: CHANNEL_COLORS[r.channel] }));

  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-4">
      <div className="relative shrink-0 mx-auto" style={{ width: 168, height: 168 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={56}
              outerRadius={82}
              stroke="#050607"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="label-meta">Spend</div>
          <div className="num text-lg font-medium">{fmt.currency(total)}</div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="label-meta">
              <th className="text-left font-normal py-1.5">Channel</th>
              <th className="text-right font-normal py-1.5">Spend</th>
              <th className="text-right font-normal py-1.5 hidden sm:table-cell">Leads</th>
              <th className="text-right font-normal py-1.5">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.channel} className="hairline-t hover:bg-bg-raised">
                <td className="py-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2" style={{ background: CHANNEL_COLORS[r.channel] }} />
                    <span className="text-text-primary">{r.channel}</span>
                  </span>
                </td>
                <td className="py-2 text-right num text-text-primary">{fmt.currency(r.spend)}</td>
                <td className="py-2 text-right num text-text-secondary hidden sm:table-cell">{fmt.number(r.leads)}</td>
                <td className="py-2 text-right num text-text-secondary">{(r.share * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
