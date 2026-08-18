import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { isClerkConfigured } from "@/src/lib/clerk";

export default function SignInPage() {
  if (!isClerkConfigured()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-semibold">Authentication is disabled in local demo mode.</h1>
          <p className="text-sm text-muted-foreground">
            Clerk keys are not configured, so the app is running as an open demo.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">Open dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn />
    </div>
  );
}
