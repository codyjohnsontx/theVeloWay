"use client";

import { Progress } from "@/components/ui/progress";
import { formatMiles, formatPercent } from "@/src/features/cc-component-health/lib/formatting";
import {
  getHealthStatusLabel,
  getHealthTone,
  getMeterFillPercent
} from "@/src/features/cc-component-health/lib/healthPresentation";
import type { AlertLevel } from "@/src/features/cc-component-health/types";
import { cn } from "@/lib/utils";

interface HealthMeterProps {
  remainingPercent: number;
  remainingMiles: number;
  alertLevel: AlertLevel;
  compact?: boolean;
  label?: string;
}

const toneClasses: Record<string, string> = {
  good: "[&>div]:bg-emerald-500",
  warning: "[&>div]:bg-amber-500",
  critical: "[&>div]:bg-orange-600",
  expired: "[&>div]:bg-red-600"
};

const statusTextClasses: Record<AlertLevel, string> = {
  none: "text-emerald-600",
  warning: "text-amber-600",
  critical: "text-orange-600",
  expired: "text-red-600"
};

export function HealthMeter({
  remainingPercent,
  remainingMiles,
  alertLevel,
  compact = false,
  label
}: HealthMeterProps) {
  const tone = getHealthTone(alertLevel);
  const statusLabel = getHealthStatusLabel(alertLevel);
  const fillPercent = getMeterFillPercent(remainingPercent);

  return (
    <div
      className={cn("space-y-2", compact && "space-y-1")}
      role="img"
      aria-label={
        label
          ? `${label}: ${formatMiles(remainingMiles)} left, ${formatPercent(remainingPercent)} remaining, ${statusLabel}`
          : `${formatMiles(remainingMiles)} left, ${formatPercent(remainingPercent)} remaining, ${statusLabel}`
      }
    >
      <Progress
        value={fillPercent}
        className={cn("h-2", toneClasses[tone] ?? "")}
      />
      <div className={cn("flex items-center justify-between", compact ? "text-xs" : "text-sm")}>
        <div>
          <span className="font-medium">{formatMiles(remainingMiles)} left</span>
          <span className="text-muted-foreground ml-2">{formatPercent(remainingPercent)} remaining</span>
        </div>
        <span className={cn("font-medium text-xs", statusTextClasses[alertLevel])}>
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
