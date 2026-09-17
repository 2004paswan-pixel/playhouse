"use client";

import { useEffect, useRef, useState } from "react";
import { Scan, X, CameraOff } from "lucide-react";

// Mobile-only floating scan button. Opens the phone's real camera in a
// scanner-style viewfinder — UI only for now, ahead of the geofencing /
// check-in logic that will read what the camera sees.
export default function ScannerButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't access your camera. Check your browser's camera permission and try again.");
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  function close() {
    setOpen(false);
    setError(null);
  }

  return (
    <>
      <button
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        aria-label="Scan to check in"
        className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center justify-center rounded-full border border-accent/60 bg-accent text-accent-foreground shadow-[0_8px_24px_-6px_rgba(215,251,61,0.55)] transition-transform active:scale-95 sm:hidden"
        style={{ height: 52, width: 52 }}
      >
        <Scan size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black sm:hidden">
          <div className="flex items-center justify-between p-4">
            <p className="text-sm font-medium text-white">Scan to check in</p>
            <button
              onClick={close}
              aria-label="Close scanner"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            {error ? (
              <div className="flex max-w-[260px] flex-col items-center gap-3 text-center">
                <CameraOff size={32} className="text-muted" />
                <p className="text-sm text-muted">{error}</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/35" />
                {/* Viewfinder frame */}
                <div className="relative h-64 w-64 max-w-[75vw]">
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/10" />
                  {[
                    "left-0 top-0 border-l-2 border-t-2 rounded-tl-lg",
                    "right-0 top-0 border-r-2 border-t-2 rounded-tr-lg",
                    "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-lg",
                    "right-0 bottom-0 border-r-2 border-b-2 rounded-br-lg",
                  ].map((cls) => (
                    <div key={cls} className={`absolute h-9 w-9 border-accent ${cls}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          <p className="px-6 pb-8 text-center text-xs text-muted">
            Point your camera at the check-in code at the amenity.
          </p>
        </div>
      )}
    </>
  );
}
