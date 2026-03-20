"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatMiles, formatPercent } from "@/src/features/cc-component-health/lib/formatting";
import type { HealthAlert } from "@/src/features/cc-component-health/types";

interface AlertListProps {
  alerts: HealthAlert[];
  onAlertClick: (alert: HealthAlert) => void;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

function severityVariant(severity: HealthAlert["severity"]): BadgeVariant {
  switch (severity) {
    case "warning":
      return "outline";
    case "critical":
      return "destructive";
    case "expired":
      return "destructive";
  }
}

export function AlertList({ alerts, onAlertClick }: AlertListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {alerts.map((alert) => (
        <Card key={alert.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{alert.bikeName}</p>
                <h3 className="font-semibold mt-0.5">{alert.componentLabel}</h3>
              </div>
              <Badge variant={severityVariant(alert.severity)} className="shrink-0 capitalize">
                {alert.severity}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{formatPercent(alert.remainingPercent)} left</Badge>
              <span className="text-xs text-muted-foreground">{formatMiles(alert.remainingMiles)} remaining</span>
            </div>
            {alert.replacementReason && (
              <p className="text-sm text-muted-foreground">{alert.replacementReason}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Threshold hit at {formatPercent(alert.thresholdTriggered)} remaining life.
            </p>
            <p className="text-xs text-muted-foreground">
              {alert.bestPriceStartingAt !== undefined
                ? `Starting at ${formatCurrency(alert.bestPriceStartingAt)} across ${alert.retailerCount ?? 0} retailers`
                : "Pricing is still loading for this replacement path"}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="outline" size="sm" onClick={() => onAlertClick(alert)}>
              <Link href={`/component/${alert.componentId}`}>Open component</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
