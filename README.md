# Strava Gear Health

Gear Health is a Strava feature concept that turns bike-tagged ride history into component wear tracking, replace-soon alerts, and affiliate-driven retailer price comparison.

This repo is a portfolio-grade web MVP for the idea. It is intentionally built with mocked retailer offers and a local demo persistence layer, but the architecture now includes clean seams for future Strava sync, partner feeds, and server-backed storage.

## Product Thesis

### Executive context

Strava leadership wants to fund training-platform expansion with a low-cost, high-yield revenue stream that uses behavior the product already owns.

Strava already knows:

- which bike a rider used
- how many miles they have put on it
- which cyclists are highly engaged

Cyclists replace chains, tires, brake pads, cassettes, and bar tape on a recurring cadence. That creates a high-intent moment where users want to know:

- is this part due soon?
- what should I buy?
- who has the best price right now?

Gear Health uses that moment to create rider value and monetizable outbound commerce.

### Problem

Strava has strong ride and bike data, but limited revenue surfaces tied to real cyclist intent between activities.

### Opportunity

Create a feature that:

- derives gear wear from bike-specific ride mileage
- surfaces replace-soon moments at useful thresholds
- compares retailer pricing for the likely replacement
- monetizes via affiliate referrals and retailer partnerships

## Goals

### Business goals

- Generate incremental affiliate revenue from cyclists already showing replacement intent
- Increase retention by making Strava more useful between rides

### User goals

- Know when a component is likely due for replacement
- Find the best price quickly across trusted retailers
- Reduce friction by showing fit signals, service context, and tools needed

### Non-goals for this MVP

- Perfect compatibility across every bike standard
- Predictive wear based on terrain, weather, or drivetrain telemetry
- In-app checkout or inventory ownership

## Success Metrics

### Primary

- Affiliate revenue per monthly active cyclist

### Secondary

- Activation: percent of users who set up at least one bike and add at least three components
- Engagement: weekly Gear Health dashboard views
- Commerce: outbound click-through rate to retailers
- Conversion proxy: attributed orders or retailer conversion pings where available
- Retention lift: 30/60 day retention for Gear Health users versus control

## What Ships In This Repo

This repo implements the web MVP path of the concept.

### Current user experience

- Gear Health landing page with account snapshot, a maintenance-first attention list, and a service queue
- Dashboard with bike filtering, service-readiness summaries, prioritized components, and a secondary replacement-cost snapshot
- Component detail page with:
  - remaining life chart
  - replacement rationale
  - compatibility-aware offer comparison
  - offer freshness and fit confidence labels
  - tools list
  - service history
  - affiliate click tracking
- Alerts view for replace-soon parts
- Setup flow for bikes, tracked components, and starter-kit presets with guided maintenance-oriented copy
- Replace action that resets lifecycle and appends service history

### Current routes

- `/projects/cc-component-health`
- `/projects/cc-component-health/setup`
- `/projects/cc-component-health/dashboard`
- `/projects/cc-component-health/component/[id]`
- `/projects/cc-component-health/alerts`

### Suggested review flow

1. Open `/projects/cc-component-health`
2. Review the seeded account and current replacement opportunities
3. Open `/projects/cc-component-health/dashboard`
4. Filter between bikes and inspect replace-soon items
5. Open a component detail page and compare retailer offers
6. Visit `/projects/cc-component-health/alerts`
7. Use `/projects/cc-component-health/setup` to edit bikes and installs

## MVP Scope Alignment

The implementation currently covers:

- Gear Health section on web
- bikes plus components data model
- ride mileage attribution by bike
- replace-soon thresholds at 25%, 10%, and 0%
- mocked offer comparison with pluggable provider boundaries
- affiliate click logging endpoint
- service history tracking when a user marks a component replaced

The implementation intentionally does not yet include:

- real Strava OAuth or activity sync
- live retailer feeds
- price alerts
- sponsored placements
- push/email messaging
- server-backed Postgres persistence

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- CSS Modules
- Vitest
- Playwright
- Zod
- Husky + lint-staged + GitHub Actions

## Architecture

The feature is isolated under `src/features/cc-component-health`.

### Current layering

- `domain/`
  - shared types
  - compatibility logic
  - offer ranking and matching
  - snapshot builders for landing, dashboard, alerts, and component detail
- `schemas/`
  - `zod` validation for persisted state and route contracts
- `adapters/mock/`
  - seeded demo state, activities, and offer bootstrap
- `adapters/local/`
  - browser `localStorage` persistence for demo mode
- `server/queries/`
  - read-model builders for route snapshots
- `server/mutations/`
  - replacement logging, setup save validation, affiliate click recording
- `context/`
  - thin client provider that hydrates persisted demo state and wires UI actions

### Key implementation decisions

- Keep the feature portfolio-friendly with mocked data, but isolate real-integration seams now
- Use server-produced bootstrap data plus client rehydration for local demo persistence
- Keep sorting user-first: best price first, compatibility-aware, and freshness-aware
- Avoid claiming guaranteed fit; use confidence labels and verify-fit language instead

## Data Model

Core entities:

- `BikeProfile`
- `BikeComponent`
- `Activity`
- `ComponentCompatibilityProfile`
- `ServiceEvent`
- `RetailerListing`
- `OfferSnapshot`
- `OfferMatch`
- `RetailerOffer`
- `GearHealthSnapshot`
- `ComponentDetailSnapshot`
- `AffiliateClickEvent`

Important modeling choices in this version:

- rides are attributed to a specific bike
- components belong to a specific bike
- service history is recorded separately from the current install state
- offers now carry:
  - fit confidence
  - compatibility status
  - freshness labels
  - affiliate URLs
- `catalogKey` remains as a seeded matching shortcut, not the only future matching path

## Wear Model

The current wear model is explainable and mileage-based:

```ts
rawMilesSinceInstall =
  baselineMiles +
  sum(activity.distanceMiles where
    activity.bikeId === component.bikeId &&
    activity.date >= installDate)

effectiveMilesSinceInstall =
  rawMilesSinceInstall * sensitivityMultiplier

remainingMiles =
  max(0, serviceLifeMiles - effectiveMilesSinceInstall)

remainingPercent =
  remainingMiles / serviceLifeMiles
```

Alert thresholds:

- warning at `<= 25%`
- critical at `<= 10%`
- expired at `<= 0%`

## Price Aggregation Model

The repo ships mocked US retailer offers for:

- Jenson USA
- Competitive Cyclist
- Worldwide Cyclery
- Trek Bikes
- REI

Each offer includes:

- retailer
- list price
- shipping price
- delivered total
- stock state
- freshness label
- fit confidence
- compatibility status
- affiliate-style outbound URL

The default ranking behavior is user-first:

- in-stock before out-of-stock
- compatible before incompatible
- fresher data before stale data
- best price and lowest delivered badges highlighted

## Public API Surface

Current route handlers:

- `GET /api/projects/cc-component-health/offers?componentId=<id>`
- `GET /api/projects/cc-component-health/offers?catalogKey=<key>`
- `POST /api/projects/cc-component-health/components/:id/replaced`
- `POST /api/projects/cc-component-health/affiliate-clicks`
- `POST /api/projects/cc-component-health/setup`

These routes validate payloads with `zod` and are intentionally shaped so a future server-backed version can swap out mock adapters for real persistence and partner integrations.

## Analytics Events

Current instrumentation in the codebase includes:

- `strava_connect_success`
- `bike_created`
- `component_added`
- `dashboard_viewed`
- `component_detail_viewed`
- `bike_filter_changed`
- `offers_viewed`
- `best_price_shown`
- `affiliate_click`
- `alert_clicked`
- `component_marked_replaced`
- `demo_reset`

PRD-relevant events to preserve or expand in a production version:

- `gear_health_opened`
- `bike_selected`
- `component_edited`
- `replace_alert_shown`
- `replace_alert_clicked`
- `price_compare_viewed`
- `retailer_offer_clicked`
- `affiliate_redirect_success`
- `price_alert_set`

## Risks And Mitigations

### Compatibility trust risk

- Mitigated in MVP by fit-confidence language and review-fit messaging
- The UI avoids presenting perfect compatibility as a guarantee

### Retailer data complexity

- Mitigated by mocked offers in this repo plus pluggable provider boundaries

### Pay-to-play perception

- Best-price sorting is the default behavior
- Affiliate disclosure is shown on pricing surfaces
- Sponsored placements are out of scope for this repo

### Alert fatigue

- Current implementation keeps alerts explainable and tied to concrete thresholds
- Notification controls are deferred

## Rollout / Experiment Plan

Recommended rollout based on the product case:

### Phase 0

- affiliate and legal readiness
- disclosure language
- attribution policy

### Phase 1

- internal dogfood
- validate bike mileage attribution, alerts, rendering, and click tracking

### Phase 2

- beta to eligible cyclists
- suggested cohort:
  - at least two rides per week or at least 1,000 miles per year
  - at least two bikes configured

### Phase 3

- ramp in-app surfaces and lifecycle messaging

### Phase 4

- GA
- expand component support
- add price alerts and saved retailer preferences

### A/B test framing

- Control: wear estimates and alerts only
- Treatment: wear estimates plus price comparison and affiliate offers
- Primary KPI: incremental affiliate revenue per eligible user

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the app:

```bash
pnpm dev
```

Quality checks:

```bash
pnpm run check:types
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## Project Structure

```text
app/
  projects/cc-component-health/
  api/projects/cc-component-health/
src/
  features/cc-component-health/
    adapters/
    analytics/
    components/
    context/
    data/
    domain/
    schemas/
    server/
```

## Case Study Framing

This repo supports the following case study narrative:

- Strava needed a low-cost, high-yield revenue concept
- existing bike and ride attribution data made maintenance lifecycle tracking feasible
- cyclists already price compare replacement parts
- the product uses that replacement moment to deliver utility and monetize with transparent affiliate referrals

## What I’d Build Next

- real Strava OAuth and bike sync
- server-backed persistence with Postgres
- richer compatibility metadata and bike standards
- retailer feed adapters and price refresh jobs
- price alerts and notification preferences
- experiment flags for wear-only versus price-compare treatment
- help-center and customer-support content for wear and fit explanations
