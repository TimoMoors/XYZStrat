interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

export function Sparkline({ data, width = 120, height = 40, positive }: SparklineProps) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="bg-zinc-800 rounded animate-pulse" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = data.map((price, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - ((price - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  // Fill path going down to baseline
  const firstX = pad;
  const lastX = pad + w;
  const baseline = pad + h;
  const fillD = `${pathD} L ${lastX},${baseline} L ${firstX},${baseline} Z`;

  const isPositive = positive ?? (data[data.length - 1] >= data[0]);
  const stroke = isPositive ? '#10b981' : '#ef4444';
  const fill = isPositive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={fillD} fill={fill} stroke="none" />
      <path d={pathD} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
