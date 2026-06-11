"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 antialiased font-sans">
        <div className="relative w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/85 rounded-2xl p-8 shadow-2xl overflow-hidden flex flex-col items-center text-center">
          {/* Glow effects */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <AlertOctagon className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-sm">
            An unexpected error occurred. Sentry has logged this incident and our team has been notified.
          </p>
          
          {error?.message && (
            <div className="w-full bg-slate-950/80 border border-slate-800/50 rounded-lg p-3.5 mb-6 text-left font-mono text-xs text-rose-300 overflow-x-auto max-h-32">
              <span className="text-slate-500 select-none">Error: </span>
              {error.message}
              {error.digest && (
                <div className="mt-1">
                  <span className="text-slate-500 select-none">Digest: </span>
                  {error.digest}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 w-full">
            <button
              onClick={() => reset()}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-semibold text-sm h-11 px-5 rounded-xl shadow-lg shadow-rose-900/25 active:scale-98 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

