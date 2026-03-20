"use client";

import type { HealthAlert } from "@/src/features/cc-component-health/types";
import { trackEvent } from "@/src/features/cc-component-health/analytics/trackEvent";
import { AlertList } from "@/src/features/cc-component-health/components/AlertList";
import { EmptyState } from "@/src/features/cc-component-health/components/EmptyState";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import { Card, CardContent } from "@/components/ui/card";

const severityRank: Record<HealthAlert["severity"], number> = {
  warning: 1,
  critical: 2,
  expired: 3
};

function formatSeverity(severity: HealthAlert["severity"]) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export default function AlertsPage() {
  const { alertsSnapshot, selectBike, state } = useDemoState();
  const { bikes, selectedBikeId, filteredAlerts, isSetupComplete, activeBikeName } = alertsSnapshot;

  const highestSeverity = [...filteredAlerts].sort(
    (l, r) => severityRank[r.severity] - severityRank[l.severity]
  )[0]?.severity;
  const bikesRepresented = new Set(filteredAlerts.map((a) => a.bikeId)).size;

  if (!state.stravaConnected) {
    return (
      <EmptyState
        title="Alerts are unavailable until ride sync is active."
        description="Gear Health derives alerts from bike-tagged ride mileage and current service thresholds."
        primaryHref="/dashboard"
        primaryLabel="Open dashboard"
      />
    );
  }

  if (!isSetupComplete) {
    return (
      <EmptyState
        title="No tracked components yet."
        description="Add bikes and component installs before expecting warning, critical, or expired alerts."
        primaryHref="/setup"
        primaryLabel="Open setup"
      />
    );
  }

  if (filteredAlerts.length === 0) {
    return (
      <EmptyState
        title="No alerts in the current bike view."
        description="No warning, critical, or expired thresholds are active for the selected bike filter."
        primaryHref="/dashboard"
        primaryLabel="Open dashboard"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Alerts</p>
        <h1 className="text-2xl font-bold mt-0.5">Active service queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          This queue keeps replacement decisions ordered by severity and remaining life, with pricing as supporting context.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_240px] gap-6">
        <div className="space-y-4">
          {/* Bike filter */}
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedBikeId === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => selectBike("all")}
            >
              All bikes
            </button>
            {bikes.map((bike) => (
              <button
                key={bike.id}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedBikeId === bike.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => selectBike(bike.id)}
              >
                {bike.name}
              </button>
            ))}
          </div>

          <AlertList
            alerts={filteredAlerts}
            onAlertClick={(alert) =>
              trackEvent("alert_clicked", {
                componentId: alert.componentId,
                bikeId: alert.bikeId,
                catalogKey: alert.catalogKey,
                price: alert.bestPriceStartingAt,
                remainingMiles: alert.remainingMiles,
                remainingPercent: alert.remainingPercent
              })
            }
          />
        </div>

        <div>
          <Card>
            <CardContent className="pt-4 space-y-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Current scope</p>
              <p className="font-semibold">{activeBikeName}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alerts in view</span>
                  <span className="font-medium">{filteredAlerts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Highest severity</span>
                  <span className="font-medium">{highestSeverity ? formatSeverity(highestSeverity) : "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bikes represented</span>
                  <span className="font-medium">{bikesRepresented}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
