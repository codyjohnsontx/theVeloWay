import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Track one bike, get the essentials.",
    features: [
      "1 bike profile",
      "Up to 5 components tracked",
      "Warning and critical alerts",
      "Retailer price comparison",
      "Strava activity sync"
    ],
    cta: "Get started free",
    href: "/sign-up",
    highlighted: false
  },
  {
    name: "Pro",
    price: "$5",
    period: "/ month",
    description: "Unlimited bikes and full component history.",
    features: [
      "Unlimited bike profiles",
      "Unlimited components",
      "Priority alerts + email notifications",
      "Full retailer comparison (12+ stores)",
      "Service history and install log",
      "Wear trend charts"
    ],
    cta: "Start Pro free for 14 days",
    href: "/sign-up",
    highlighted: true
  },
  {
    name: "Team",
    price: "$15",
    period: "/ month",
    description: "For clubs, coaches, and fleet managers.",
    features: [
      "Everything in Pro",
      "Up to 10 rider accounts",
      "Shared fleet dashboard",
      "CSV export",
      "Priority support"
    ],
    cta: "Contact us",
    href: "mailto:hello@veloway.app",
    highlighted: false
  }
];

export default function PricingPage() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start free. Upgrade when you need more bikes or richer history.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? "border-primary shadow-lg relative" : ""}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most popular</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Separator />
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
