"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useDemoState } from "@/src/features/cc-component-health/context/DemoStateProvider";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/alerts", label: "Alerts" },
  { href: "/setup", label: "Setup" }
];

function NavLinks({ pathname, alertCount, onClick }: { pathname: string; alertCount: number; onClick?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <span>{item.label}</span>
            {item.label === "Alerts" && alertCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 text-xs px-1.5">
                {alertCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function VelowayShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrated, alerts, state, resetDemoState } = useDemoState();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading ride and component state...
      </div>
    );
  }

  const alertCount = alerts.length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            {/* Mobile nav trigger */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 pt-10">
                <NavLinks pathname={pathname} alertCount={alertCount} onClick={() => setSheetOpen(false)} />
                <Separator className="my-4" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground w-full justify-start"
                  onClick={() => { resetDemoState(); setSheetOpen(false); }}
                >
                  Restore defaults
                </Button>
              </SheetContent>
            </Sheet>

            <Link href="/dashboard" className="font-semibold text-base tracking-tight">
              Veloway
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {alertCount > 0 && (
              <Link href="/alerts">
                <Badge variant="destructive" className="text-xs">
                  {alertCount} alert{alertCount !== 1 ? "s" : ""}
                </Badge>
              </Link>
            )}
            <UserButton />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-56 flex-col border-r border-border bg-background p-4 gap-4 shrink-0">
          <NavLinks pathname={pathname} alertCount={alertCount} />
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1 px-1">
            <p className="font-medium text-foreground">{state.athleteName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground justify-start mt-auto"
            onClick={resetDemoState}
          >
            Restore defaults
          </Button>
        </aside>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
