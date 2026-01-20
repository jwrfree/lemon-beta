"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function OfflineActions() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        onClick={() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
      >
        Try again
      </Button>
      <Button asChild variant="outline">
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
