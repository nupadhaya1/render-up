"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SquareChevronLeft, SquareChevronRight, Maximize2 } from "lucide-react";

type Props = {
  images: string[];
  aspect?: string; // e.g. "aspect-[16/9]" | "aspect-square"
  className?: string;
};

export default function ImageCarousel({
  images,
  aspect = "aspect-[16/9]",
  className = "",
}: Props) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // reset loader every time index changes
    setImageLoaded(false);
  }, [index, lightboxOpen]);

  const touchStartX = useRef<number | null>(null);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key.toLowerCase() === "escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(delta) > 40) (delta > 0 ? prev : next)();
    touchStartX.current = null;
  };

  return (
    <div className={`select-none ${className}`}>
      {/* Main frame */}
      <div
        className={`relative h-full w-full overflow-hidden rounded-xl border border-black/10 ${className.includes("flex-1") ? "" : aspect}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Slide track */}
        <div
          className="flex h-full w-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={src + i} className="relative h-full w-full shrink-0">
              {/* Edge-to-edge fill */}
              <Image
                src={src}
                alt={`Slide ${i + 1}`}
                fill
                priority={i === 0}
                className="object-cover" // fills the frame edge-to-edge
                sizes="(max-width: 768px) 100vw, 66vw"
              />
            </div>
          ))}
        </div>

        {/* Controls (square chevrons) */}
        <button
          aria-label="Previous"
          onClick={prev}
          className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-md bg-black/50 p-2 text-white backdrop-blur hover:bg-black/60"
        >
          <SquareChevronLeft className="h-6 w-6" />
        </button>
        <button
          aria-label="Next"
          onClick={next}
          className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-md bg-black/50 p-2 text-white backdrop-blur hover:bg-black/60"
        >
          <SquareChevronRight className="h-6 w-6" />
        </button>

        {/* Lightbox toggle */}
        <button
          aria-label="Open full screen"
          onClick={() => setLightboxOpen(true)}
          className="absolute top-2 right-2 z-10 rounded-md bg-black/45 p-2 text-white backdrop-blur hover:bg-black/60"
          title="Open viewer"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Dots */}
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full bg-white/50 ring-1 ring-black/20 ${i === index ? "scale-110 bg-white" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Lightbox viewer */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 rounded-md bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
          >
            Close
          </button>

          <button
            aria-label="Previous"
            onClick={prev}
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-md bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <SquareChevronLeft className="h-7 w-7" />
          </button>

          {/* Image wrapper with spinner */}
          <div className="relative flex h-[80vh] w-[90vw] items-center justify-center">
            {/* Spinner */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
              </div>
            )}

            <Image
              src={images[index] ?? ""}
              alt={`Full image ${index + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
              onLoadingComplete={() => setImageLoaded(true)}
            />
          </div>

          <button
            aria-label="Next"
            onClick={next}
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-md bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <SquareChevronRight className="h-7 w-7" />
          </button>
        </div>
      )}
    </div>
  );
}
