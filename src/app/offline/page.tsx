import type { Metadata } from "next";
import { WifiOff, ShieldAlert, Sparkles } from "lucide-react";
import { OfflineActions } from "./offline-actions";

export const metadata: Metadata = {
  title: "Luring (Offline) - Lemon",
  description: "Anda sedang luring. Lemon akan menyinkronkan data kembali setelah koneksi tersedia.",
};

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 dark:bg-black p-6 text-center">
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-150 opacity-50" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200/60 dark:border-zinc-800/60">
          <WifiOff aria-hidden className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-2 -right-2 p-2 bg-amber-500 rounded-full border-4 border-zinc-50 dark:border-black shadow-sm">
          <ShieldAlert className="h-4 w-4 text-white" />
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-medium tracking-tighter text-zinc-900 dark:text-white leading-none">Anda Sedang Luring</h1>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
          Koneksi internet terputus. Jangan khawatir, Lemon tetap menyimpan perubahanmu secara lokal dan akan menyinkronkannya saat internet kembali.
        </p>
      </div>

      <div className="mt-10 w-full max-w-xs">
        <OfflineActions />
      </div>

      <div className="mt-16 flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-primary/40">
        <Sparkles className="h-3 w-3" />
        <span>Mode Aman Aktif</span>
      </div>
    </main>
  );
}

