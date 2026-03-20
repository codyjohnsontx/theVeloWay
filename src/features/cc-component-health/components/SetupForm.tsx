"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  componentPresets,
  createComponentFromPreset
} from "@/src/features/cc-component-health/data/componentPresets";
import { formatMiles } from "@/src/features/cc-component-health/lib/formatting";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";
import type { BikeComponent, BikeProfile } from "@/src/features/cc-component-health/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const bikeTemplate: BikeProfile = {
  id: "",
  name: "New Bike",
  discipline: "road",
  wearSensitivity: "normal"
};

export function SetupForm() {
  const {
    state,
    bikes,
    activities,
    totalRideMiles,
    rideStatsByBike,
    saveBike,
    addComponent,
    addStarterKit,
    updateComponent
  } = useDemoState();
  const [bikeDrafts, setBikeDrafts] = useState<BikeProfile[]>(bikes);
  const [componentDrafts, setComponentDrafts] = useState<BikeComponent[]>(state.components);
  const [presetBikeId, setPresetBikeId] = useState<string>(bikes[0]?.id ?? "");

  useEffect(() => {
    setBikeDrafts(bikes);
    setComponentDrafts(state.components);
    setPresetBikeId((current) => current || bikes[0]?.id || "");
  }, [bikes, state.components]);

  const activityRange = useMemo(() => {
    if (activities.length === 0) return "No rides loaded";
    return `${activities[0].date} to ${activities[activities.length - 1].date}`;
  }, [activities]);

  function handleSaveBike(bikeId: string) {
    const bike = bikeDrafts.find((draft) => draft.id === bikeId);
    if (!bike) return;
    saveBike({ ...bike, id: bike.id || crypto.randomUUID() });
  }

  function handleAddBikeDraft() {
    const id = crypto.randomUUID();
    setBikeDrafts((current) => [
      ...current,
      { ...bikeTemplate, id, name: `Bike ${current.length + 1}` }
    ]);
  }

  function handleAddPreset(presetType: string) {
    const preset = componentPresets.find((item) => item.type === presetType);
    if (!preset || !presetBikeId) return;
    addComponent(createComponentFromPreset(preset, presetBikeId));
  }

  function updateBikeDraftValue<T extends keyof BikeProfile>(bikeId: string, field: T, value: BikeProfile[T]) {
    setBikeDrafts((current) =>
      current.map((draft) => (draft.id === bikeId ? { ...draft, [field]: value } : draft))
    );
  }

  function updateDraftValue<T extends keyof BikeComponent>(componentId: string, field: T, value: BikeComponent[T]) {
    setComponentDrafts((current) =>
      current.map((draft) => (draft.id === componentId ? { ...draft, [field]: value } : draft))
    );
  }

  function handleSaveComponent(componentId: string) {
    const component = componentDrafts.find((draft) => draft.id === componentId);
    if (!component) return;
    updateComponent(component);
  }

  if (!state.stravaConnected) {
    return (
      <Card className="max-w-md">
        <CardContent className="pt-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Ride sync required</p>
          <h2 className="font-semibold text-lg">Reconnect Strava before editing bike installs.</h2>
          <p className="text-sm text-muted-foreground">
            Gear Health depends on ride attribution to keep bike-specific maintenance timing accurate.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Bikes section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Set up bikes</p>
              <h2 className="font-semibold mt-0.5">Confirm ride attribution and bike profiles</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Keep the bikes list accurate first so every maintenance estimate is tied to the correct ride mileage.
              </p>
            </div>
            <Button size="sm" onClick={handleAddBikeDraft}>Add bike</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bikeDrafts.map((bike) => (
            <Card key={bike.id} className="bg-muted/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground capitalize">{bike.discipline}</p>
                    <h3 className="font-medium">{bike.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveBike(bike.id)}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => addStarterKit(bike.id)}>
                      Starter kit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`name-${bike.id}`}>Bike name</Label>
                  <Input
                    id={`name-${bike.id}`}
                    value={bike.name}
                    onChange={(e) => updateBikeDraftValue(bike.id, "name", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`discipline-${bike.id}`}>Discipline</Label>
                  <Select
                    value={bike.discipline}
                    onValueChange={(val) =>
                      updateBikeDraftValue(bike.id, "discipline", val as BikeProfile["discipline"])
                    }
                  >
                    <SelectTrigger id={`discipline-${bike.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="road">Road</SelectItem>
                      <SelectItem value="gravel">Gravel</SelectItem>
                      <SelectItem value="track">Track</SelectItem>
                      <SelectItem value="triathlon">Triathlon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`sensitivity-${bike.id}`}>Wear sensitivity</Label>
                  <Select
                    value={bike.wearSensitivity}
                    onValueChange={(val) =>
                      updateBikeDraftValue(bike.id, "wearSensitivity", val as BikeProfile["wearSensitivity"])
                    }
                  >
                    <SelectTrigger id={`sensitivity-${bike.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Ride attribution</p>
                  <p className="font-semibold">{rideStatsByBike[bike.id]?.count ?? 0} rides</p>
                  <p className="text-xs text-muted-foreground">{formatMiles(rideStatsByBike[bike.id]?.miles ?? 0)}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Separator />
          <p className="text-xs text-muted-foreground">
            Imported rides: {activities.length} activities, {formatMiles(totalRideMiles)}, {activityRange}.
          </p>
        </CardContent>
      </Card>

      {/* Presets section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Add common wear items</p>
              <h2 className="font-semibold mt-0.5">Seed each bike with the parts you expect to replace</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Start with common presets so the dashboard can surface maintenance timing quickly.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Review dashboard</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="preset-bike">Target bike</Label>
            <Select value={presetBikeId} onValueChange={setPresetBikeId}>
              <SelectTrigger id="preset-bike">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bikes.map((bike) => (
                  <SelectItem key={bike.id} value={bike.id}>
                    {bike.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {componentPresets.map((preset) => (
              <Card key={preset.type} className="bg-muted/30">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-sm">{preset.label}</h3>
                      <p className="text-xs text-muted-foreground">Default life: {formatMiles(preset.defaultServiceLifeMiles)}</p>
                    </div>
                    <Button size="sm" onClick={() => handleAddPreset(preset.type)}>Add</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{preset.replacementSearchLabel}</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                    {preset.toolsNeeded.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Components tuning section */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tune service inputs</p>
              <h2 className="font-semibold mt-0.5">Refine installed components and replacement timing</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Adjust install dates, service life, baseline miles, and notes so the active service queue matches real-world maintenance.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/alerts">Review alerts</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {componentDrafts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add at least one component preset to restore full service tracking.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {componentDrafts.map((component) => (
                <Card key={component.id} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {bikes.find((bike) => bike.id === component.bikeId)?.name ?? "Bike"}
                        </p>
                        <h3 className="font-medium text-sm">{component.label}</h3>
                      </div>
                      <Button size="sm" onClick={() => handleSaveComponent(component.id)}>Apply</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Bike</Label>
                      <Select
                        value={component.bikeId}
                        onValueChange={(val) => updateDraftValue(component.id, "bikeId", val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {bikes.map((bike) => (
                            <SelectItem key={bike.id} value={bike.id}>{bike.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Label</Label>
                      <Input
                        value={component.label}
                        onChange={(e) => updateDraftValue(component.id, "label", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Service life miles</Label>
                      <Input
                        type="number"
                        min="0"
                        step="50"
                        value={component.serviceLifeMiles}
                        onChange={(e) =>
                          updateDraftValue(component.id, "serviceLifeMiles", Number(e.target.value))
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Install date</Label>
                      <Input
                        type="date"
                        value={component.installDate}
                        onChange={(e) => updateDraftValue(component.id, "installDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Baseline miles</Label>
                      <Input
                        type="number"
                        min="0"
                        step="10"
                        value={component.baselineMiles}
                        onChange={(e) =>
                          updateDraftValue(component.id, "baselineMiles", Number(e.target.value))
                        }
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label>Notes</Label>
                      <textarea
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-16 resize-y"
                        value={component.notes ?? ""}
                        onChange={(e) => updateDraftValue(component.id, "notes", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
