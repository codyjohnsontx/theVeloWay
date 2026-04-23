import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { isClerkConfigured } from "@/src/lib/clerk";

export const metadata: Metadata = {
  title: "Veloway — Bike Component Health",
  description:
    "Know exactly when to replace your bike components. Ride-attributed wear tracking and retailer price comparison."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authEnabled = isClerkConfigured();
  const document = (
    <html lang="en">
      <body>{children}</body>
    </html>
  );

  if (!authEnabled) {
    return document;
  }

  return (
    <ClerkProvider>
      {document}
    </ClerkProvider>
  );
}
