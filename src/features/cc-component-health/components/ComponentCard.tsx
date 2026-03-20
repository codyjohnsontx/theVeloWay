"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthMeter } from "@/src/features/cc-component-health/components/HealthMeter";
import { formatCurrency, formatMiles } from "@/src/features/cc-component-health/lib/formatting";
import type {
  BikeComponent,
  ComponentPreset,
  ResolvedComponentHealth
} from "@/src/features/cc-component-health/types";

interface ComponentCardProps {
  component: BikeComponent;
  health: ResolvedComponentHealth;
  preset?: ComponentPreset;
}

const alertBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  none: "secondary",
  warning: "outline",
  critical: "destructive",
  expired: "destructive"
};

export function ComponentCard({ component, health, preset }: ComponentCardProps) {
  const metadata = [
    `Service life ${formatMiles(component.serviceLifeMiles)}`,
    component.position
      ? `${component.position[0].toUpperCase()}${component.position.slice(1)}`
      : null,
    preset ? `${preset.toolsNeeded.length} tools` : null
  ].filter(Boolean) as string[];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{health.bikeName}</p>
            <h3 className="font-semibold mt-0.5">{component.label}</h3>
          </div>
          {health.alertLevel !== "none" && (
            <Badge variant={alertBadgeVariant[health.alertLevel]} className="shrink-0 capitalize">
              {health.alertLevel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <HealthMeter
          remainingPercent={health.remainingPercent}
          remainingMiles={health.remainingMiles}
          alertLevel={health.alertLevel}
          label={component.label}
        />
        <p className="text-sm text-muted-foreground">{health.replacementReason}</p>
        <p className="text-xs text-muted-foreground">{metadata.join(" · ")}</p>
        <p className="text-xs text-muted-foreground">
          {health.bestPriceOffer
            ? `Best current price ${formatCurrency(health.bestPriceOffer.price)} across ${health.offerSummary.retailerCount} retailers`
            : "Retailer comparison will appear here when pricing is available"}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-0">
        <Button asChild variant="outline" size="sm">
          <Link href={`/component/${component.id}`}>Review component</Link>
        </Button>
        <span className="text-xs text-muted-foreground">
          {preset?.replacementCategoryLabel ?? "Replacement part"} comparison
        </span>
      </CardFooter>
    </Card>
  );
}
