import { componentPresetMap } from "@/src/features/cc-component-health/data/componentPresets";
import { buildAlerts } from "@/src/features/cc-component-health/lib/alerts";
import { formatDate } from "@/src/features/cc-component-health/lib/formatting";
import { calculateAllComponentHealth } from "@/src/features/cc-component-health/lib/wear";
import { resolveComponentCompatibilityProfile } from "@/src/features/cc-component-health/domain/compatibility";
import {
  buildOfferSummary,
  getBestPriceOffer,
  getLowestDeliveredOffer,
  matchOffersForComponent,
  rankRetailerOffers,
  resolveComponentCatalogKey
} from "@/src/features/cc-component-health/domain/offers";
import type {
  AlertsSnapshot,
  ComponentDetailSnapshot,
  DashboardSnapshot,
  FeatureBootstrapData,
  GearHealthSnapshot,
  LandingSnapshot,
  ResolvedComponentHealth
} from "@/src/features/cc-component-health/types";

function buildRideStats(activities: FeatureBootstrapData["activities"]) {
  return activities.reduce<Record<string, { count: number; miles: number }>>(
    (result, activity) => {
      const current = result[activity.bikeId] ?? { count: 0, miles: 0 };

      result[activity.bikeId] = {
        count: current.count + 1,
        miles: current.miles + activity.distanceMiles
      };

      return result;
    },
    {}
  );
}

function buildReplacementReason(item: ResolvedComponentHealth): string {
  if (item.alertLevel === "expired") {
    return `${item.component.label} is past its target service life based on bike-tagged mileage since ${formatDate(item.component.installDate)}.`;
  }

  if (item.alertLevel === "critical") {
    return `${item.component.label} has under 10% life remaining, so replacement planning should happen now.`;
  }

  if (item.alertLevel === "warning") {
    return `${item.component.label} has entered the warning window with less than 25% service life remaining.`;
  }

  return `${item.component.label} is still inside its expected service window, but pricing is ready when replacement timing changes.`;
}

export function buildGearHealthSnapshot(
  bootstrap: FeatureBootstrapData,
  bikeId = bootstrap.state.selectedBikeId
): GearHealthSnapshot {
  const { state, activities, offers } = bootstrap;
  const bikes = state.bikes;
  const bikeMap = new Map(bikes.map((bike) => [bike.id, bike]));
  const bikeSensitivityById = bikes.reduce<
    Partial<Record<string, (typeof bikes)[number]["wearSensitivity"]>>
  >((result, bike) => {
    result[bike.id] = bike.wearSensitivity;
    return result;
  }, {});

  const rideStatsByBike = buildRideStats(activities);
  const totalRideMiles = activities.reduce(
    (total, activity) => total + activity.distanceMiles,
    0
  );

  const componentHealth = calculateAllComponentHealth(
    state.components,
    activities,
    "normal",
    bikeSensitivityById
  ).map((health) => {
    const component = state.components.find((item) => item.id === health.componentId);
    const bike = component ? bikeMap.get(component.bikeId) : undefined;
    const preset = component ? componentPresetMap.get(component.type) : undefined;
    const catalogKey = component ? resolveComponentCatalogKey(component) : "road-chain";
    const compatibilityProfile = component
      ? resolveComponentCompatibilityProfile(component, bike)
      : {
          componentType: "chain" as const,
          discipline: "road" as const
        };
    const resolvedOffers = component
      ? rankRetailerOffers(matchOffersForComponent(component, compatibilityProfile, offers, bike))
      : [];
    const serviceHistory = state.serviceEvents
      .filter((event) => event.componentId === health.componentId)
      .sort((left, right) => right.date.localeCompare(left.date));

    const resolvedHealth: ResolvedComponentHealth = {
      ...health,
      component: component!,
      componentLabel: component?.label ?? "Component",
      bike,
      bikeName: bike?.name ?? "Bike",
      preset,
      catalogKey,
      compatibilityProfile,
      offers: resolvedOffers,
      offerSummary: buildOfferSummary(resolvedOffers),
      bestPriceOffer: getBestPriceOffer(resolvedOffers),
      lowestDeliveredOffer: getLowestDeliveredOffer(resolvedOffers),
      serviceHistory,
      replacementReason: ""
    };

    return {
      ...resolvedHealth,
      replacementReason: buildReplacementReason(resolvedHealth)
    };
  });

  const filteredComponentHealth =
    bikeId === "all"
      ? componentHealth
      : componentHealth.filter((item) => item.bikeId === bikeId);

  const alerts = buildAlerts(
    componentHealth.map((item) => ({
      ...item,
      bikeId: item.bikeId,
      bikeName: item.bikeName
    }))
  ).map((alert) => {
    const healthItem = componentHealth.find((item) => item.componentId === alert.componentId);

    return {
      ...alert,
      catalogKey: healthItem?.catalogKey,
      bestPriceStartingAt: healthItem?.bestPriceOffer?.price,
      retailerCount: healthItem?.offerSummary.retailerCount ?? 0,
      replacementReason: healthItem?.replacementReason
    };
  });

  const filteredAlerts =
    bikeId === "all" ? alerts : alerts.filter((alert) => alert.bikeId === bikeId);

  return {
    state: {
      ...state,
      selectedBikeId: bikeId
    },
    activities,
    bikes,
    selectedBikeId: bikeId,
    totalRideMiles,
    rideStatsByBike,
    componentHealth,
    filteredComponentHealth,
    alerts,
    filteredAlerts,
    isSetupComplete: Boolean(state.bikes.length > 0 && state.components.length > 0)
  };
}

export function buildLandingSnapshot(bootstrap: FeatureBootstrapData): LandingSnapshot {
  const snapshot = buildGearHealthSnapshot(bootstrap);
  const previewComponents = [...snapshot.componentHealth]
    .sort((left, right) => left.remainingPercent - right.remainingPercent)
    .slice(0, 3);

  return {
    ...snapshot,
    previewComponents,
    urgentComponent: previewComponents[0] ?? null
  };
}

export function buildDashboardSnapshot(
  bootstrap: FeatureBootstrapData,
  bikeId = bootstrap.state.selectedBikeId
): DashboardSnapshot {
  const snapshot = buildGearHealthSnapshot(bootstrap, bikeId);
  const dueSoonItems = snapshot.filteredComponentHealth.filter(
    (item) => item.alertLevel !== "none"
  );
  const dueSoonCount = dueSoonItems.length;
  const pricedUrgentCount = dueSoonItems.filter((item) => item.bestPriceOffer).length;
  const spendAtRisk = dueSoonItems
    .filter((item) => item.bestPriceOffer)
    .reduce((sum, item) => sum + (item.bestPriceOffer?.price ?? 0), 0);
  const priorityItems = [...snapshot.filteredComponentHealth]
    .sort((left, right) => left.remainingPercent - right.remainingPercent)
    .slice(0, 5);

  return {
    ...snapshot,
    dueSoonCount,
    spendAtRisk,
    pricedUrgentCount,
    priorityItems
  };
}

export function buildAlertsSnapshot(
  bootstrap: FeatureBootstrapData,
  bikeId = bootstrap.state.selectedBikeId
): AlertsSnapshot {
  const snapshot = buildGearHealthSnapshot(bootstrap, bikeId);

  return {
    ...snapshot,
    activeBikeName:
      bikeId === "all"
        ? "All bikes"
        : snapshot.bikes.find((bike) => bike.id === bikeId)?.name ?? "Bike"
  };
}

export function buildComponentDetailSnapshot(
  bootstrap: FeatureBootstrapData,
  componentId: string
): ComponentDetailSnapshot {
  const snapshot = buildGearHealthSnapshot(bootstrap);
  const health =
    snapshot.componentHealth.find((item) => item.componentId === componentId) ?? null;

  return {
    state: snapshot.state,
    component: health?.component ?? null,
    health,
    serviceHistory: health?.serviceHistory ?? [],
    affiliateDisclosure:
      "Prices can change quickly and fit may still need rider verification. Purchases through partner links may earn Veloway a commission."
  };
}
