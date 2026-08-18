import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isClerkConfigured } from "@/src/lib/clerk";

export default function LandingPage() {
  const authEnabled = isClerkConfigured();
  const primaryHref = authEnabled ? "/sign-up" : "/dashboard";
  const primaryLabel = authEnabled ? "Get Started Free" : "Open demo";

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <Badge variant="secondary" className="mb-2">Now in beta</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Know exactly when to replace your bike components.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Veloway tracks wear across every ride, alerts you before parts fail, and
            surfaces the best current prices only when you actually need them.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
          {!authEnabled && (
            <p className="text-sm text-muted-foreground">
              Local demo mode is active because Clerk auth keys are not configured.
            </p>
          )}
        </div>
      </section>

      {/* Stats row */}
      <section className="border-y border-border bg-muted/30 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-foreground">2,400+</p>
            <p className="text-sm text-muted-foreground mt-1">Components tracked</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">12</p>
            <p className="text-sm text-muted-foreground mt-1">Partner retailers</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">$140</p>
            <p className="text-sm text-muted-foreground mt-1">Avg. saved per year</p>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Everything your maintenance needs</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Built around how bikes actually wear — per ride, per bike, per component.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Auto-tracking</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Every ride from your Strava history is attributed to the right bike and
                applied to each installed component automatically.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Smart alerts</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Get warned before parts hit critical thresholds — not after. Alerts are
                ranked by urgency so you always know what needs attention first.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Buy at the right time</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Retailer pricing surfaces only when a part is actually nearing replacement,
                pulling live inventory from 12+ stores so you can compare at a glance.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 px-6 bg-primary text-primary-foreground text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Ready to stop guessing?</h2>
          <p className="text-primary-foreground/80">
            Set up in under two minutes. Connect Strava, add your bikes, and your
            component health dashboard is live.
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link href={authEnabled ? "/pricing" : "/dashboard"}>
              {authEnabled ? "View plans" : "Open dashboard"}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
