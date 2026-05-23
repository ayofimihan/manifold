import { useMemo } from 'react';

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = '#2DD4BF',
  fill = true,
  strokeWidth = 1.25,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
}) {
  const { d, area } = useMemo(() => {
    if (data.length === 0) return { d: '', area: '' };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = Math.max(0.0001, max - min);
    const step = width / Math.max(1, data.length - 1);
    const pts = data.map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return [x, y] as const;
    });
    const path = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ');
    const areaPath = `${path} L${width},${height} L0,${height} Z`;
    return { d: path, area: areaPath };
  }, [data, width, height]);

  const gid = `spark-${color.replace('#', '')}-${width}-${height}`;
  return (
    <svg width={width} height={height} className="block overflow-visible" aria-hidden>
      {fill && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gid})`} />
        </>
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
