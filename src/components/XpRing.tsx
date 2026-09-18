"use client";

interface XpRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
}

// Circular progress ring: the bright arc is *remaining* XP out of `max`, so
// it visibly drains as XP is spent and refills on a refund. Pure SVG, no
// deps — two stacked circles (dim track + animated accent arc).
export default function XpRing({ value, max, size = 132, strokeWidth = 10 }: XpRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = circumference * (1 - fraction);
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border"
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ filter: "drop-shadow(0 0 6px rgba(215,251,61,0.55))" }}
        className="text-accent transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}
