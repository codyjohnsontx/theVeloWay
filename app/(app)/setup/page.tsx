"use client";

import { SetupForm } from "@/src/features/cc-component-health/components/SetupForm";

export default function SetupPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Gear Health setup</p>
        <h1 className="text-2xl font-bold mt-0.5">Set up bikes and tracked wear items</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Start with bike attribution, add common wear items, and then tune the service inputs that drive each replacement recommendation.
        </p>
      </div>
      <SetupForm />
    </div>
  );
}
