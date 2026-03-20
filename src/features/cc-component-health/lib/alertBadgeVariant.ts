import type { AlertLevel } from "@/src/features/cc-component-health/domain/types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function alertBadgeVariant(level: AlertLevel): BadgeVariant {
  switch (level) {
    case "warning": return "outline";
    case "critical": return "destructive";
    case "expired": return "destructive";
    default: return "secondary";
  }
}
