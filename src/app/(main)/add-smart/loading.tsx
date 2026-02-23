
import { Loader2, Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col h-full items-center justify-center animate-in fade-in duration-300">
      <div className="relative">
        <div className="p-4 bg-primary/10 rounded-card mb-4">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        </div>
      </div>
      <h2 className="text-lg font-medium text-foreground">Menyiapkan Smart Add...</h2>
      <p className="text-sm text-muted-foreground mt-2">Sedang memuat asisten AI kamu</p>
    </div>
  );
}

