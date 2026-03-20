"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
}

export function EmptyState({ title, description, primaryHref, primaryLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 max-w-md mx-auto space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Nothing to show</p>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild>
        <Link href={primaryHref}>{primaryLabel}</Link>
      </Button>
    </div>
  );
}
