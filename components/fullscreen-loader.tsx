"use client";

import { Loader2 } from "lucide-react";
import type React from "react";

interface FullscreenLoaderProps {
  message?: string;
}

export function FullscreenLoader({ message }: FullscreenLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/70 backdrop-blur-xl">
      {/* background sutil no mesmo estilo do cadastro */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-20 left-10 w-80 h-80 bg-primary/20 rounded-full blur-[96px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/20 rounded-full blur-[96px] animate-pulse delay-700" />

      <div className="relative z-10 flex flex-col items-center gap-3 bg-card/80 border border-border/30 rounded-2xl px-8 py-6 shadow-2xl">
        <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary flex items-center justify-center animate-spin">
          <Loader2 className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {message ?? "Carregando..."}
        </p>
        <p className="text-xs text-muted-foreground">
          Organizando suas finanças em casal
        </p>
      </div>
    </div>
  );
}
