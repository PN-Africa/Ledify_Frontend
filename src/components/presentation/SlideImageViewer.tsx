"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { GeneratedSlide } from "@/lib/generate";

type Props = {
  title: string;
  slides: GeneratedSlide[];
  downloadUrl?: string;
};

export default function SlideImageViewer({ title, slides, downloadUrl }: Props) {
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const lastIndex = slides.length - 1;
  const slide = slides[active];

  // ---------- Navigation ----------
  const next = useCallback(() => setActive((i) => Math.min(lastIndex, i + 1)), [lastIndex]);
  const prev = useCallback(() => setActive((i) => Math.max(0, i - 1)), []);

  // ---------- Present (fullscreen) ----------
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await stageRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Some browsers block fullscreen
    }
  }, []);

  // ---------- Keyboard: arrows to move, F to present ----------
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, toggleFullscreen]);

  return (
    <main className="min-h-screen w-full bg-[#0A0D18] px-4 pb-16 pt-28 md:px-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B0D17]">
        {/* ---------- Toolbar ---------- */}
        <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-3 py-3 md:px-5">
          <Link
            href="/create"
            aria-label="Back to create"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10"
          >
            ←
          </Link>

          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#8A8FA3]">Presentation · {slides.length} slides</p>
            <h1 className="truncate text-sm font-semibold text-white md:text-base">{title}</h1>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden h-11 items-center rounded-xl border border-white/15 px-4 text-sm font-medium text-white transition hover:bg-white/10 sm:flex"
          >
            Present
          </button>

          {downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="flex h-11 items-center rounded-xl bg-[#6C47FF] px-4 text-sm font-semibold text-white transition hover:bg-[#5B38EE]"
            >
              Download .pptx
            </a>
          )}
        </header>

        <div className="flex flex-col lg:flex-row">
          {/* ---------- Thumbnails ---------- */}
          <nav
            aria-label="Slides"
            className="order-2 flex gap-3 overflow-x-auto border-t border-white/10 p-4 lg:order-1 lg:max-h-[calc(100vh-200px)] lg:w-60 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-t-0"
          >
            {slides.map((s, i) => (
              <button
                key={s.number}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${s.number}`}
                aria-current={i === active ? "true" : undefined}
                className={`w-40 shrink-0 overflow-hidden rounded-lg ring-2 transition lg:w-full ${
                  i === active ? "ring-[#7C5CFF]" : "ring-white/5 hover:ring-white/25"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.imageUrl} alt="" className="aspect-video w-full object-cover" />
              </button>
            ))}
          </nav>

          {/* ---------- Main slide ---------- */}
          <section className="order-1 flex flex-1 flex-col items-center justify-center gap-5 bg-[#0E1120] p-4 md:p-8 lg:order-2">
                            <div
                ref={stageRef}
                className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl bg-black"
                >
                {/* All slides are loaded at once and stacked; only the current one is visible */}
                {slides.map((s, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                    key={s.number}
                    src={s.imageUrl}
                    alt={`Slide ${s.number}: ${s.title}`}
                    aria-hidden={i !== active}
                    className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ${
                        i === active ? "opacity-100" : "opacity-0"
                    }`}
                    />
                ))}
                </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={prev}
                disabled={active === 0}
                aria-label="Previous slide"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 disabled:opacity-30"
              >
                ‹
              </button>
              <p className="min-w-[64px] text-center text-sm tabular-nums text-[#C9CBD6]" aria-live="polite">
                {active + 1} / {slides.length}
              </p>
              <button
                type="button"
                onClick={next}
                disabled={active === lastIndex}
                aria-label="Next slide"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 disabled:opacity-30"
              >
                ›
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}