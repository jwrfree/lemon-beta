import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

import { OfflineActions } from "./offline-actions";

export const metadata: Metadata = {
  title: "Offline - Lemon",
  description: "You're currently offline. Reconnect to keep tracking your finances.",
};

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <WifiOff aria-hidden className="h-10 w-10" />
      </span>
      <div className="max-w-xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">You&apos;re offline</h1>
        <p className="text-base text-muted-foreground">
          Check your internet connection and try again. You can still browse cached pages, and we&apos;ll sync your updates once
          you&apos;re back online.
        </p>
      </div>
      <OfflineActions />
    </main>
  );
}
