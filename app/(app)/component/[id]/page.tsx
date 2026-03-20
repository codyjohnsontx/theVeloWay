"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";

import { trackEvent } from "@/src/features/cc-component-health/analytics/trackEvent";
import { CountdownSparkline } from "@/src/features/cc-component-health/components/CountdownSparkline";
import { EmptyState } from "@/src/features/cc-component-health/components/EmptyState";
import { HealthMeter } from "@/src/features/cc-component-health/components/HealthMeter";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import { retailerMap } from "@/src/features/cc-component-health/data/retailers";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMiles,
  formatMatchConfidence,
  formatOfferFreshness,
  formatPercent
} from "@/src/features/cc-component-health/lib/formatting";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const viewedComponentDetails = new Set<string>();
const viewedOfferPanels = new Set<string>();

type AlertLevel = "none" | "warning" | "critical" | "expired";

function alertBadgeVariant(level: AlertLevel) {
  switch (level) {
    case "warning": return "outline" as const;
    case "critical": return "destructive" as const;
    case "expired": return "destructive" as const;
    default: return "secondary" as const;
  }
}

export default function ComponentDetailPage() {
  const params = useParams<{ id: string }>();
  const componentId = params.id;
  const { state, getComponentDetailSnapshot, markComponentReplaced, recordAffiliateClick } = useDemoState();

  const detailSnapshot = getComponentDetailSnapshot(componentId);
  const component = detailSnapshot.component;
  const health = detailSnapshot.health;
  const pricingSectionRef = useRef<HTMLDivElement | null>(null);

  function scrollToPricing() {
    pricingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    if (!health || viewedComponentDetails.has(componentId)) return;
    viewedComponentDetails.add(componentId);
    trackEvent("component_detail_viewed", {
      componentId,
      bikeId: health.bikeId,
      catalogKey: health.catalogKey,
      remainingMiles: health.remainingMiles,
      remainingPercent: health.remainingPercent
    });
  }, [componentId, health]);

  useEffect(() => {
    if (!health) return;
    const key = `offers_viewed:${componentId}`;
    if (!viewedOfferPanels.has(key)) {
      viewedOfferPanels.add(key);
      trackEvent("offers_viewed", {
        componentId,
        bikeId: health.bikeId,
        catalogKey: health.catalogKey,
        retailerCount: health.offerSummary.retailerCount,
        remainingPercent: health.remainingPercent
      });
    }
    if (health.bestPriceOffer && !viewedOfferPanels.has(`best:${componentId}`)) {
      viewedOfferPanels.add(`best:${componentId}`);
      trackEvent("best_price_shown", {
        componentId,
        bikeId: health.bikeId,
        catalogKey: health.catalogKey,
        retailerId: health.bestPriceOffer.retailerId,
        price: health.bestPriceOffer.price,
        totalPrice: health.bestPriceOffer.totalPrice,
        remainingPercent: health.remainingPercent
      });
    }
  }, [componentId, health]);

  if (!state.stravaConnected) {
    return (
      <EmptyState
        title="Ride sync is required before opening component detail."
        description="Component detail depends on bike-tagged ride mileage to compute wear and compare partner retailer pricing."
        primaryHref="/dashboard"
        primaryLabel="Open dashboard"
      />
    );
  }

  if (!component || !health) {
    return (
      <EmptyState
        title="That component could not be found."
        description="The saved setup state does not include this component ID anymore."
        primaryHref="/dashboard"
        primaryLabel="Back to dashboard"
      />
    );
  }

  const toolsNeeded = health.preset?.toolsNeeded ?? [];

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-4">
        {/* Summary card */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{health.bikeName}</p>
                <h1 className="text-2xl font-bold mt-0.5">{component.label}</h1>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary">{formatPercent(health.remainingPercent)} left</Badge>
                <Badge variant={alertBadgeVariant(health.alertLevel)} className="capitalize">
                  {health.alertLevel === "none" ? "tracking" : health.alertLevel}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Remaining miles</p>
                <p className="font-semibold">{formatMiles(health.remainingMiles)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current bike</p>
                <p className="font-semibold">{health.bikeName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Replacements logged</p>
                <p className="font-semibold">{component.replacementCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Service status</p>
                <p className="font-semibold capitalize">
                  {health.alertLevel === "none" ? "On track" : health.alertLevel}
                </p>
              </div>
            </div>

            {health.bestPriceOffer && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Best comparison starts at {formatCurrency(health.bestPriceOffer.price)}.
                </p>
                <Button variant="outline" size="sm" onClick={scrollToPricing}>
                  Review pricing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Replacement rationale */}
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Why it is here</p>
            <h2 className="font-semibold text-sm mt-0.5">Replacement rationale</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{health.replacementReason}</p>
          </CardContent>
        </Card>

        {/* Wear trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Wear trend</p>
                <h2 className="font-semibold text-sm mt-0.5">Remaining miles across ride history</h2>
              </div>
              <Badge variant="secondary">x{health.sensitivityMultiplier.toFixed(2)} multiplier</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <CountdownSparkline points={health.countdownSeries} width={420} height={160} showAxes />
            <p className="text-xs text-muted-foreground">Derived from rides accumulated since the current install date.</p>
          </CardContent>
        </Card>

        {/* Retailer comparison */}
        <Card ref={pricingSectionRef}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Compare offers</p>
                <h2 className="font-semibold text-sm mt-0.5">Retailer comparison</h2>
              </div>
              <Badge variant="secondary">
                {health.offerSummary.availableOfferCount}/{health.offerSummary.retailerCount} in stock
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use this table to compare fit confidence, freshness, and current pricing. Verify the listing details before buying.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Lowest listed price</p>
                <p className="font-semibold">
                  {health.bestPriceOffer ? formatCurrency(health.bestPriceOffer.price) : "Unavailable"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lowest delivered total</p>
                <p className="font-semibold">
                  {health.lowestDeliveredOffer ? formatCurrency(health.lowestDeliveredOffer.totalPrice) : "Unavailable"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stores checked</p>
                <p className="font-semibold">{health.offerSummary.retailerCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last checked</p>
                <p className="font-semibold">{formatDateTime(health.offerSummary.lastCheckedAt)}</p>
              </div>
            </div>

            <div className="space-y-3">
              {health.offers.map((offer) => {
                const retailer = retailerMap.get(offer.retailerId);
                const badgeLabel =
                  offer.badge === "best_price" ? "Best price"
                  : offer.badge === "lowest_delivered" ? "Lowest delivered"
                  : null;

                return (
                  <Card key={offer.id} className="bg-muted/30">
                    <CardContent className="pt-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{retailer?.partnerLabel ?? "Retailer"}</p>
                          <p className="font-medium text-sm">{retailer?.name ?? offer.retailerId}</p>
                          <p className="text-xs text-muted-foreground">{offer.productName}</p>
                          {badgeLabel && (
                            <Badge variant="secondary" className="mt-1 text-xs">{badgeLabel}</Badge>
                          )}
                        </div>
                        <a
                          href={offer.affiliateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0"
                          onClick={() => {
                            recordAffiliateClick({
                              componentId: component.id,
                              retailerId: offer.retailerId,
                              offerId: offer.id,
                              surface: "detail",
                              catalogKey: health.catalogKey,
                              price: offer.price,
                              totalPrice: offer.totalPrice
                            });
                            trackEvent("affiliate_click", {
                              componentId: component.id,
                              bikeId: health.bikeId,
                              catalogKey: health.catalogKey,
                              retailerId: offer.retailerId,
                              price: offer.price,
                              totalPrice: offer.totalPrice,
                              remainingPercent: health.remainingPercent
                            });
                          }}
                        >
                          <Button size="sm">Visit retailer</Button>
                        </a>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Listed price</p>
                          <p className="font-semibold">{formatCurrency(offer.price)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Shipping</p>
                          <p className="font-semibold">{formatCurrency(offer.shippingPrice)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-semibold text-sm">{formatCurrency(offer.totalPrice)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Availability</p>
                          <Badge
                            variant={offer.inStock ? "secondary" : "outline"}
                            className="text-xs mt-0.5"
                          >
                            {offer.availabilityLabel}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fit</p>
                          <p className="font-medium">{formatMatchConfidence(offer.matchConfidence)}</p>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {retailer?.shippingPolicySummary ?? "Shipping details unavailable."} ·{" "}
                        {offer.fitNotes[0] ?? "Check listing details before purchase."} ·{" "}
                        Last checked {formatDateTime(offer.lastCheckedAt)} ·{" "}
                        {formatOfferFreshness(offer.freshness)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground">{detailSnapshot.affiliateDisclosure}</p>
          </CardContent>
        </Card>
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Current status</p>
            <h2 className="font-semibold text-sm">Replacement timing</h2>
            <HealthMeter
              remainingPercent={health.remainingPercent}
              remainingMiles={health.remainingMiles}
              alertLevel={health.alertLevel}
              label={component.label}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Service context</p>
            <h2 className="font-semibold text-sm">Bike and install details</h2>
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li>Install date: {formatDate(component.installDate)}</li>
              <li>Service life: {formatMiles(component.serviceLifeMiles)}</li>
              <li>Baseline miles: {formatMiles(component.baselineMiles)}</li>
              <li>Raw miles since install: {formatMiles(health.rawMilesSinceInstall)}</li>
              <li>Notes: {component.notes?.trim() || "No notes added"}</li>
            </ul>

            <Separator />

            <p className="text-sm font-medium">Service history</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {detailSnapshot.serviceHistory.map((event) => (
                <li key={event.id}>
                  {formatDate(event.date)} · {event.type} · {formatMiles(event.mileageAtService)}
                </li>
              ))}
            </ul>

            <Separator />

            <p className="text-sm font-medium">Tools needed</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {toolsNeeded.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>

            <Separator />

            <p className="text-sm text-muted-foreground">Installed the new part?</p>
            <Button size="sm" onClick={() => markComponentReplaced(component.id)}>
              Mark replaced
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
