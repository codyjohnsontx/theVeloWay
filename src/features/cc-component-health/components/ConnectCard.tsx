"use client";

import Link from "next/link";
import { Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ConnectCardProps {
  athleteName: string;
  activityCount: number;
  connected: boolean;
  connectDisabled: boolean;
  modeLabel: string;
  onConnect: () => void;
  primaryHref: string;
}

export function ConnectCard({
  athleteName,
  activityCount,
  connected,
  connectDisabled,
  modeLabel,
  onConnect,
  primaryHref
}: ConnectCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {connected ? "Account" : "Ride sync"}
            </p>
            <h2 className="font-semibold mt-0.5">
              {connected ? athleteName : "Connect ride history"}
            </h2>
          </div>
          <Badge variant="secondary" className="shrink-0">{modeLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {connected
            ? `${activityCount} tagged rides are flowing into Gear Health for bike-aware service tracking.`
            : "Connect ride history to start bike-aware wear tracking and retailer comparison."}
        </p>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Activities ready</span>
          <span className="font-semibold">{activityCount}</span>
        </div>

        <div className="flex items-center gap-2">
          {!connected ? (
            <Button
              disabled={connectDisabled}
              onClick={onConnect}
              className="gap-2"
            >
              <LinkIcon className="h-4 w-4" />
              Connect Strava account
            </Button>
          ) : (
            <Button asChild>
              <Link href={primaryHref}>Open dashboard</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href="/setup">Manage bikes</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
