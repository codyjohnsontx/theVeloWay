const PUBLISHABLE_KEY_PREFIXES = ["pk_test_", "pk_live_"] as const;
const SECRET_KEY_PREFIXES = ["sk_test_", "sk_live_"] as const;

function hasKnownPrefix(
  value: string | undefined,
  prefixes: readonly string[]
): value is string {
  return (
    typeof value === "string" &&
    value.length >= 32 &&
    prefixes.some((prefix) => value.startsWith(prefix))
  );
}

export function isClerkConfigured(): boolean {
  return (
    hasKnownPrefix(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, PUBLISHABLE_KEY_PREFIXES) &&
    hasKnownPrefix(process.env.CLERK_SECRET_KEY, SECRET_KEY_PREFIXES)
  );
}
