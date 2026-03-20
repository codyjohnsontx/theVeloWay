export type WearSensitivity = "conservative" | "normal" | "aggressive";

export type StravaMode = "mock" | "real" | "disabled";
export type BikeFilterId = string | "all";

export type ComponentType =
  | "chain"
  | "front-tire"
  | "rear-tire"
  | "brake-pads"
  | "cassette"
  | "bar-tape-grips";

export type AlertLevel = "none" | "warning" | "critical" | "expired";
export type HealthTone = "healthy" | "warning" | "critical" | "expired";
export type RetailerId =
  | "jenson-usa"
  | "competitive-cyclist"
  | "worldwide-cyclery"
  | "trek-bikes"
  | "rei";
export type OfferCatalogKey =
  | "road-chain"
  | "road-front-tire"
  | "road-rear-tire"
  | "gravel-chain"
  | "gravel-front-tire"
  | "gravel-rear-tire"
  | "road-brake-pads"
  | "gravel-brake-pads"
  | "road-cassette"
  | "gravel-cassette"
  | "bar-tape"
  | "gravel-bar-tape";
export type OfferBadge =
  | "best_price"
  | "lowest_delivered"
  | "fastest_ship"
  | "popular_retailer"
  | "none";
export type BrakeSystem = "disc" | "rim";
export type WheelSize = "700c" | "650b";
export type CassetteRangeFamily =
  | "road-close"
  | "road-wide"
  | "gravel-wide"
  | "universal";
export type OfferFreshness = "fresh" | "aging" | "stale";
export type CompatibilityStatus =
  | "confirmed"
  | "likely"
  | "review"
  | "incompatible";
export type MatchConfidence = "exact" | "high" | "medium" | "low";
export type ServiceEventType = "installed" | "replaced" | "inspection";
export type EventSource = "seeded" | "user" | "api";
export type AffiliateSurface =
  | "landing"
  | "dashboard"
  | "detail"
  | "alerts";

export interface Activity {
  id: string;
  bikeId: string;
  date: string;
  distanceMiles: number;
  title: string;
  type: "ride";
}

export interface BikeProfile {
  id: string;
  name: string;
  discipline: "road" | "gravel" | "track" | "triathlon";
  wearSensitivity: WearSensitivity;
}

export interface ComponentCompatibilityProfile {
  componentType: ComponentType;
  discipline: BikeProfile["discipline"];
  drivetrainSpeed?: 11 | 12 | 13;
  brakeSystem?: BrakeSystem;
  wheelSize?: WheelSize;
  tireWidthMm?: number;
  cassetteRangeFamily?: CassetteRangeFamily;
  position?: "front" | "rear";
  fitNotes?: string[];
}

export interface ComponentPreset {
  type: ComponentType;
  label: string;
  defaultServiceLifeMiles: number;
  catalogKey: OfferCatalogKey;
  replacementSearchLabel: string;
  replacementCategoryLabel: string;
  toolsNeeded: string[];
  defaultCompatibility: Partial<ComponentCompatibilityProfile>;
}

export interface BikeComponent {
  id: string;
  bikeId: string;
  type: ComponentType;
  label: string;
  serviceLifeMiles: number;
  installDate: string;
  baselineMiles: number;
  position?: "front" | "rear";
  catalogKey?: OfferCatalogKey;
  replacementSearchLabel?: string;
  compatibilityProfile?: Partial<ComponentCompatibilityProfile>;
  notes?: string;
  replacementCount: number;
}

export interface CountdownPoint {
  date: string;
  remainingMiles: number;
}

export interface ComponentHealth {
  componentId: string;
  bikeId: string;
  milesSinceInstall: number;
  rawMilesSinceInstall: number;
  remainingMiles: number;
  remainingPercent: number;
  alertLevel: AlertLevel;
  countdownSeries: CountdownPoint[];
  sensitivityMultiplier: number;
}

export interface ServiceEvent {
  id: string;
  componentId: string;
  bikeId: string;
  type: ServiceEventType;
  date: string;
  mileageAtService: number;
  notes?: string;
  source: EventSource;
}

export interface HealthAlert {
  id: string;
  componentId: string;
  bikeId: string;
  bikeName: string;
  componentLabel: string;
  severity: Exclude<AlertLevel, "none">;
  remainingMiles: number;
  remainingPercent: number;
  catalogKey?: OfferCatalogKey;
  bestPriceStartingAt?: number;
  retailerCount?: number;
  replacementReason?: string;
  thresholdTriggered: 0.25 | 0.1 | 0;
}

export interface Retailer {
  id: RetailerId;
  name: string;
  baseUrl: string;
  partnerLabel: string;
  shippingPolicySummary: string;
  logoText: string;
  disclosureLabel: string;
}

export interface RetailerListing {
  listingId: string;
  catalogKey: OfferCatalogKey;
  retailerId: RetailerId;
  productName: string;
  brand: string;
  productUrl: string;
  affiliateUrl: string;
  compatibilityProfile: Partial<ComponentCompatibilityProfile>;
}

export interface OfferSnapshot {
  snapshotId: string;
  listingId: string;
  price: number;
  shippingPrice: number;
  totalPrice: number;
  inStock: boolean;
  availabilityLabel: string;
  lastCheckedAt: string;
  freshness: OfferFreshness;
}

export interface OfferMatch {
  listingId: string;
  compatibilityStatus: CompatibilityStatus;
  matchConfidence: MatchConfidence;
  fitNotes: string[];
}

export interface RetailerOffer
  extends RetailerListing,
    OfferSnapshot,
    OfferMatch {
  id: string;
  badge: OfferBadge;
}

export interface OfferSummary {
  catalogKey: OfferCatalogKey;
  bestPriceOfferId: string | null;
  lowestDeliveredOfferId: string | null;
  availableOfferCount: number;
  compatibleOfferCount: number;
  freshOfferCount: number;
  agingOfferCount: number;
  staleOfferCount: number;
  retailerCount: number;
  lastCheckedAt: string | null;
}

export interface AffiliateClickEvent {
  id: string;
  componentId: string;
  retailerId: RetailerId;
  offerId: string;
  surface: AffiliateSurface;
  clickedAt: string;
  catalogKey?: OfferCatalogKey;
  price?: number;
  totalPrice?: number;
}

export interface DemoState {
  stravaConnected: boolean;
  stravaMode: StravaMode;
  athleteName: string;
  bikes: BikeProfile[];
  selectedBikeId: BikeFilterId;
  components: BikeComponent[];
  serviceEvents: ServiceEvent[];
  affiliateClicks: AffiliateClickEvent[];
}

export interface RideStats {
  count: number;
  miles: number;
}

export interface ResolvedComponentHealth extends ComponentHealth {
  component: BikeComponent;
  componentLabel: string;
  bike?: BikeProfile;
  bikeName: string;
  preset?: ComponentPreset;
  catalogKey: OfferCatalogKey;
  compatibilityProfile: ComponentCompatibilityProfile;
  offers: RetailerOffer[];
  offerSummary: OfferSummary;
  bestPriceOffer: RetailerOffer | null;
  lowestDeliveredOffer: RetailerOffer | null;
  serviceHistory: ServiceEvent[];
  replacementReason: string;
}

export interface GearHealthSnapshot {
  state: DemoState;
  activities: Activity[];
  bikes: BikeProfile[];
  selectedBikeId: BikeFilterId;
  totalRideMiles: number;
  rideStatsByBike: Record<string, RideStats>;
  componentHealth: ResolvedComponentHealth[];
  filteredComponentHealth: ResolvedComponentHealth[];
  alerts: HealthAlert[];
  filteredAlerts: HealthAlert[];
  isSetupComplete: boolean;
}

export interface LandingSnapshot extends GearHealthSnapshot {
  previewComponents: ResolvedComponentHealth[];
  urgentComponent: ResolvedComponentHealth | null;
}

export interface DashboardSnapshot extends GearHealthSnapshot {
  dueSoonCount: number;
  spendAtRisk: number;
  pricedUrgentCount: number;
  priorityItems: ResolvedComponentHealth[];
}

export interface AlertsSnapshot extends GearHealthSnapshot {
  activeBikeName: string;
}

export interface ComponentDetailSnapshot {
  state: DemoState;
  component: BikeComponent | null;
  health: ResolvedComponentHealth | null;
  serviceHistory: ServiceEvent[];
  affiliateDisclosure: string;
}

export interface FeatureBootstrapData {
  state: DemoState;
  activities: Activity[];
  offers: RetailerOffer[];
}
