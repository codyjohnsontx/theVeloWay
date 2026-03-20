import { VelowayShell } from "@/src/features/cc-component-health/components/VelowayShell";
import { DemoStateProvider } from "@/src/features/cc-component-health/context/DemoStateProvider";
import { getFeatureBootstrap } from "@/src/features/cc-component-health/server/queries/getGearHealthSnapshots";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const initialBootstrap = await getFeatureBootstrap();

  return (
    <DemoStateProvider initialBootstrap={initialBootstrap}>
      <VelowayShell>{children}</VelowayShell>
    </DemoStateProvider>
  );
}
