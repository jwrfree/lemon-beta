import React from 'react';
import { WifiOff, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8">
        <WifiOff className="h-12 w-12 text-muted-foreground" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-3">
        Sedang Offline
      </h1>

      <p className="text-muted-foreground mb-10 max-w-sm">
        Lemon memerlukan koneksi internet untuk sinkronisasi data keuanganmu.
        Beberapa fitur tidak tersedia saat kamu tidak terhubung.
      </p>

      <div className="space-y-3 w-full max-w-xs">
        <Button variant="default" className="w-full" asChild>
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Coba Lagi
          </Link>
        </Button>

        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium opacity-50">
          Financial Co-Pilot
        </p>
      </div>
    </div>
  );
}
