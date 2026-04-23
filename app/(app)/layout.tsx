import { VelowayShell } from "@/src/features/cc-component-health/components/VelowayShell";
import { DemoStateProvider } from "@/src/features/cc-component-health/context/DemoStateProvider";
import { getFeatureBootstrap } from "@/src/features/cc-component-health/server/queries/getGearHealthSnapshots";
import { isClerkConfigured } from "@/src/lib/clerk";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const initialBootstrap = await getFeatureBootstrap();
  const authEnabled = isClerkConfigured();

  return (
    <DemoStateProvider initialBootstrap={initialBootstrap}>
      <VelowayShell authEnabled={authEnabled}>{children}</VelowayShell>
    </DemoStateProvider>
  );
}
