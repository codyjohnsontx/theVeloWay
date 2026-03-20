"use client";

import { buildSvgPath } from "@/src/features/cc-component-health/lib/chartSeries";
import { formatDate, formatMiles } from "@/src/features/cc-component-health/lib/formatting";
import type { CountdownPoint } from "@/src/features/cc-component-health/types";

interface CountdownSparklineProps {
  points: CountdownPoint[];
  width?: number;
  height?: number;
  showAxes?: boolean;
}

export function CountdownSparkline({
  points,
  width = 240,
  height = 76,
  showAxes = false
}: CountdownSparklineProps) {
  const path = buildSvgPath(points, width, height);
  const lastPoint = points[points.length - 1];
  const maxY = Math.max(...points.map((point) => point.remainingMiles), 1);
  const lastPointY = lastPoint ? height - (lastPoint.remainingMiles / maxY) * height : height - 1;

  return (
    <div className="space-y-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Remaining component life over time"
        className="w-full"
      >
        <line
          x1="0"
          y1={height - 1}
          x2={width}
          y2={height - 1}
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {lastPoint ? (
          <circle
            cx={width}
            cy={Math.max(4, lastPointY)}
            r="4"
            fill="hsl(var(--primary))"
          />
        ) : null}
      </svg>

      {showAxes && points.length > 0 && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatDate(points[0].date)}</span>
          <span>{formatMiles(points[points.length - 1].remainingMiles)}</span>
        </div>
      )}
    </div>
  );
}
