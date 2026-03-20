"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import { trackEvent } from "@/src/features/cc-component-health/analytics/trackEvent";
import { ComponentCard } from "@/src/features/cc-component-health/components/ComponentCard";
import { EmptyState } from "@/src/features/cc-component-health/components/EmptyState";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import { formatCurrency, formatMiles, formatPercent } from "@/src/features/cc-component-health/lib/formatting";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const emittedDashboardEvents = new Set<string>();

function alertBadgeVariant(level: "none" | "warning" | "critical" | "expired") {
  switch (level) {
    case "warning": return "outline" as const;
    case "critical": return "destructive" as const;
    case "expired": return "destructive" as const;
    default: return "secondary" as const;
  }
}

export default function DashboardPage() {
  const { hydrated, dashboardSnapshot, selectBike, state } = useDemoState();
  const {
    activities,
    bikes,
    selectedBikeId,
    totalRideMiles,
    filteredComponentHealth,
    filteredAlerts,
    isSetupComplete,
    dueSoonCount,
    spendAtRisk,
    pricedUrgentCount,
    priorityItems
  } = dashboardSnapshot;
  const hasInitializedBikeFilter = useRef(false);

  useEffect(() => {
    if (!hydrated || hasInitializedBikeFilter.current) return;
    hasInitializedBikeFilter.current = true;
    if (bikes.length > 1 && selectedBikeId !== "all") selectBike("all");
  }, [bikes.length, hydrated, selectBike, selectedBikeId]);

  useEffect(() => {
    const key = "dashboard_viewed";
    if (emittedDashboardEvents.has(key)) return;
    emittedDashboardEvents.add(key);
    trackEvent("dashboard_viewed", {
      componentCount: filteredComponentHealth.length,
      activeAlerts: filteredAlerts.length,
      bikeId: selectedBikeId
    });
  }, [filteredAlerts.length, filteredComponentHealth.length, selectedBikeId]);

  useEffect(() => {
    filteredComponentHealth
      .filter((item) => item.bestPriceOffer)
      .forEach((item) => {
        const key = `best_price_shown:${item.componentId}:${selectedBikeId}`;
        if (emittedDashboardEvents.has(key)) return;
        emittedDashboardEvents.add(key);
        trackEvent("best_price_shown", {
          componentId: item.componentId,
          bikeId: item.bikeId,
          catalogKey: item.catalogKey,
          price: item.bestPriceOffer?.price,
          totalPrice: item.bestPriceOffer?.totalPrice,
          remainingPercent: item.remainingPercent
        });
      });
  }, [filteredComponentHealth, selectedBikeId]);

  if (!state.stravaConnected) {
    return (
      <EmptyState
        title="Ride sync must be active before loading Gear Health."
        description="The dashboard uses bike-tagged ride miles to calculate wear and compare part pricing."
        primaryHref="/dashboard"
        primaryLabel="Open landing page"
      />
    );
  }

  if (!isSetupComplete) {
    return (
      <EmptyState
        title="Add at least one bike and tracked component."
        description="Gear Health needs bike setup and service installs before it can surface wear timing and retailer pricing."
        primaryHref="/setup"
        primaryLabel="Open bike setup"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Gear Health</p>
        <h1 className="text-2xl font-bold mt-0.5">Current replacement timing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bike-tagged rides keep service timing current so the maintenance queue stays actionable.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Components due soon</p>
            <p className="text-2xl font-bold">{dueSoonCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Active alerts</p>
            <p className="text-2xl font-bold">{filteredAlerts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Miles tracked</p>
            <p className="text-2xl font-bold">{formatMiles(totalRideMiles)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          {/* Bike filter tabs */}
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

          {/* Components grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredComponentHealth.map((item) => (
              <ComponentCard
                key={item.componentId}
                component={item.component}
                health={item}
                preset={item.preset}
              />
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          {/* Priority queue */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Service queue</p>
                  <h2 className="font-semibold mt-0.5 text-sm">Priority queue</h2>
                </div>
                {filteredAlerts.length > 0 && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/alerts">Open alerts</Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {priorityItems.map((item) => (
                <Link
                  key={item.componentId}
                  href={`/component/${item.componentId}`}
                  className="block p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{item.component.label}</span>
                    {item.alertLevel !== "none" && (
                      <Badge variant={alertBadgeVariant(item.alertLevel)} className="text-xs capitalize shrink-0">
                        {item.alertLevel}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.bikeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercent(item.remainingPercent)} left · {formatMiles(item.remainingMiles)} remaining
                  </p>
                  {item.bestPriceOffer && (
                    <p className="text-xs text-muted-foreground">
                      Best price {formatCurrency(item.bestPriceOffer.price)}
                    </p>
                  )}
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Cost snapshot */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Replacement cost snapshot</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spend at risk</span>
                  <span className="font-semibold">{spendAtRisk > 0 ? formatCurrency(spendAtRisk) : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Urgent parts with pricing</span>
                  <span className="font-semibold">{pricedUrgentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rides logged</span>
                  <span className="font-semibold">{activities.length}</span>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/alerts">Open alerts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
