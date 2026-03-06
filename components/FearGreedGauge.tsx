interface FearGreedGaugeProps {
  value: number;
  label: string;
}

export function FearGreedGauge({ value, label }: FearGreedGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));

  // Arc from 210° to 330° (240° sweep)
  const startAngle = 210;
  const sweepAngle = 120;
  const needleAngle = startAngle + (clamped / 100) * sweepAngle;

  function polarToXY(angle: number, r: number, cx: number, cy: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(startDeg: number, endDeg: number, r: number, cx: number, cy: number) {
    const s = polarToXY(startDeg, r, cx, cy);
    const e = polarToXY(endDeg, r, cx, cy);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const cx = 60;
  const cy = 60;
  const r = 44;

  const segments = [
    { from: 210, to: 234, color: '#ef4444' },   // Extreme Fear
    { from: 234, to: 258, color: '#f97316' },   // Fear
    { from: 258, to: 282, color: '#eab308' },   // Neutral
    { from: 282, to: 306, color: '#84cc16' },   // Greed
    { from: 306, to: 330, color: '#22c55e' },   // Extreme Greed
  ];

  const needleEnd = polarToXY(needleAngle, r - 8, cx, cy);
  const needleBase1 = polarToXY(needleAngle - 90, 5, cx, cy);
  const needleBase2 = polarToXY(needleAngle + 90, 5, cx, cy);

  const color =
    clamped <= 25 ? '#ef4444' :
    clamped <= 45 ? '#f97316' :
    clamped <= 55 ? '#eab308' :
    clamped <= 75 ? '#84cc16' : '#22c55e';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="120" height="78" viewBox="0 0 120 78">
        {/* Track */}
        <path d={arcPath(210, 330, r, cx, cy)} fill="none" stroke="#27272a" strokeWidth="8" strokeLinecap="round" />
        {/* Colored segments */}
        {segments.map((seg, i) => (
          <path key={i} d={arcPath(seg.from, seg.to, r, cx, cy)} fill="none" stroke={seg.color} strokeWidth="8" opacity="0.25" />
        ))}
        {/* Active fill up to value */}
        <path d={arcPath(210, needleAngle, r, cx, cy)} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
        {/* Needle */}
        <polygon
          points={`${needleEnd.x},${needleEnd.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill={color}
          opacity="0.9"
        />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r="4" fill={color} />
        {/* Value text */}
        <text x={cx} y={cy + 18} textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{clamped}</text>
      </svg>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}
