import React from 'react';
import { OfflineActions } from './offline-actions';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8">
        <svg
          aria-hidden="true"
          viewBox="0 0 256 256"
          className="h-12 w-12 text-muted-foreground"
          fill="currentColor"
        >
          <path d="M213.92,210.62a8,8,0,1,1-11.84,10.76l-52-57.15a60,60,0,0,0-57.41,7.24,8,8,0,1,1-9.42-12.93A75.43,75.43,0,0,1,128,144c1.28,0,2.55,0,3.82.1L104.9,114.49A108,108,0,0,0,61,135.31,8,8,0,0,1,49.73,134,8,8,0,0,1,51,122.77a124.27,124.27,0,0,1,41.71-21.66L69.37,75.4a155.43,155.43,0,0,0-40.29,24A8,8,0,0,1,18.92,87,171.87,171.87,0,0,1,58,62.86L42.08,45.38A8,8,0,1,1,53.92,34.62ZM128,192a12,12,0,1,0,12,12A12,12,0,0,0,128,192ZM237.08,87A172.3,172.3,0,0,0,106,49.4a8,8,0,1,0,2,15.87A158.33,158.33,0,0,1,128,64a156.25,156.25,0,0,1,98.92,35.37A8,8,0,0,0,237.08,87ZM195,135.31a8,8,0,0,0,11.24-1.3,8,8,0,0,0-1.3-11.24,124.25,124.25,0,0,0-51.73-24.2A8,8,0,1,0,150,114.24,108.12,108.12,0,0,1,195,135.31Z" />
        </svg>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight mb-3">
        Sedang Offline
      </h1>

      <p className="text-muted-foreground mb-10 max-w-sm">
        Lemon memerlukan koneksi internet untuk sinkronisasi data keuanganmu.
        Halaman yang pernah dibuka dan snapshot data terakhir masih bisa tampil,
        tetapi perubahan baru belum bisa dikirim sampai koneksi kembali normal.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <OfflineActions />

        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium opacity-50">
          Financial Co-Pilot
        </p>
      </div>
    </div>
  );
}

