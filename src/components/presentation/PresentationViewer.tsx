"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Presentation, Slide } from "@/lib/presentation";
import { ScaledSlide } from "./SlideView";

type Mode = "preview" | "edit";
// Intro: thumbnails load in one after another
const LOADING_AHEAD = 2; // how many blurred "loading" slides show ahead of the sharp ones
const MAX_STEP = 220; // ms per slide, at most
const MAX_INTRO_TIME = 1800; // the whole intro never takes longer than this

type ThumbState = "ready" | "loading" | "hidden";

export default function PresentationViewer({
  presentation,
}: {
  presentation: Presentation;
}) {
  const { theme, title } = presentation;

  // The slides live in state now, so they can be edited
  const [slides, setSlides] = useState<Slide[]>(presentation.slides);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>("preview");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);

  const lastIndex = slides.length - 1;
  const slide = slides[active];
  const canEdit = mode === "edit" && !isFullscreen; // never edit while presenting
  // ---------- Intro reveal ----------
  const [revealed, setRevealed] = useState(0); // how many slides are sharp
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = presentation.slides.length;

    if (reduceMotion || total === 0) {
      setIntroDone(true);
      return;
    }

    // More slides = shorter steps, so the intro always stays under MAX_INTRO_TIME
    const step = Math.min(MAX_STEP, MAX_INTRO_TIME / total);
    let count = 0;

    const timer = setInterval(() => {
      count += 1;
      setRevealed(count);
      if (count >= total) {
        clearInterval(timer);
        setIntroDone(true);
      }
    }, step);

    return () => clearInterval(timer);
  }, [presentation.slides.length]);

  function getThumbState(i: number): ThumbState {
    if (introDone || i < revealed) return "ready";
    if (i < revealed + LOADING_AHEAD) return "loading";
    return "hidden";
  }

  // ---------- Navigation ----------
  const goTo = useCallback(
    (i: number) => setActive(Math.max(0, Math.min(lastIndex, i))),
    [lastIndex]
  );
  const next = useCallback(() => setActive((i) => Math.min(lastIndex, i + 1)), [lastIndex]);
  const prev = useCallback(() => setActive((i) => Math.max(0, i - 1)), []);

  // ---------- Editing ----------
  function updateSlide(updated: Slide) {
    setSlides((all) => all.map((s) => (s.id === updated.id ? updated : s)));
  }

  function moveSlide(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target > lastIndex) return;

    setSlides((all) => {
      const copy = [...all];
      [copy[index], copy[target]] = [copy[target], copy[index]]; // swap the two
      return copy;
    });
    setActive(target); // follow the slide you moved
  }

  function duplicateSlide(index: number) {
    const copy: Slide = { ...slides[index], id: crypto.randomUUID() };
    setSlides((all) => [...all.slice(0, index + 1), copy, ...all.slice(index + 1)]);
    setActive(index + 1);
  }

  function deleteSlide(index: number) {
    if (slides.length === 1) return; // always keep at least one slide
    setSlides((all) => all.filter((_, i) => i !== index));
    setActive(Math.min(index, slides.length - 2));
  }

  function addSlide() {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      layout: "bullets",
      title: "New slide",
      bullets: ["Add your first point"],
    };
    setSlides((all) => [...all.slice(0, active + 1), newSlide, ...all.slice(active + 1)]);
    setActive(active + 1);
  }

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

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // ---------- Keyboard shortcuts ----------
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't steal the arrow keys or "F" while someone is typing on a slide
      const target = e.target as HTMLElement;
      if (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(lastIndex);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, goTo, lastIndex, toggleFullscreen]);

  useEffect(() => {
    thumbRefs.current[active]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  function handleDownload() {
    // TODO: export to .pptx (pptxgenjs) or request the file from the backend
  }

  return (
    <main className="min-h-screen w-full bg-[#0A0D18] px-4 pb-16 pt-28 md:px-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B0D17]">
        {/* ---------- Toolbar ---------- */}
        <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-3 py-3 md:px-5">
          <Link
            href="/create"
            aria-label="Back to your content"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10"
          >
            <ArrowLeftIcon />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#8A8FA3]">Presentation · {slides.length} slides</p>
            <h1 className="truncate text-sm font-semibold text-white md:text-base">{title}</h1>
          </div>

          {/* Preview / Edit toggle */}
          <div role="group" aria-label="Mode" className="flex rounded-xl border border-white/15 p-1">
            {(["preview", "edit"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`h-9 rounded-lg px-3 text-sm font-medium capitalize transition ${
                  mode === m ? "bg-white text-[#0B0D17]" : "text-[#C9CBD6] hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-medium text-white transition hover:bg-white/10 sm:flex"
          >
            <PlayIcon />
            Present
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex h-11 items-center gap-2 rounded-xl bg-[#6C47FF] px-4 text-sm font-semibold text-white transition hover:bg-[#5B38EE]"
          >
            <DownloadIcon />
            <span className="hidden sm:inline">Download</span>
          </button>
        </header>

        <div className="flex flex-col lg:flex-row">
          {/* ---------- Thumbnails ---------- */}
          <nav
            aria-label="Slides"
            className="order-2 flex gap-3 overflow-x-auto border-t border-white/10 p-4 lg:order-1 lg:max-h-[calc(100vh-200px)] lg:w-60 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:border-r lg:border-t-0"
          >
                        {slides.map((s, i) => {
              const isActive = i === active;
              const thumbState = getThumbState(i);

              return (
                <div
                  key={s.id}
                  ref={(el) => {
                    thumbRefs.current[i] = el;
                  }}
                  className={`flex shrink-0 items-start gap-2 transition-[opacity,filter,transform] duration-500 ease-out ${
                    thumbState === "ready"
                      ? "translate-y-0 scale-100 opacity-100 blur-0"
                      : thumbState === "loading"
                        ? "translate-y-0 scale-[0.97] opacity-60 blur-[6px]"
                        : "translate-y-3 scale-[0.97] opacity-0 blur-[6px]"
                  }`}
                >
                  <span
                    className={`w-4 pt-1 text-right text-xs tabular-nums ${
                      isActive ? "text-white" : "text-[#6F7386]"
                    }`}
                  >
                    {i + 1}
                  </span>

                  <div className="w-40 lg:w-full">
                    <div
                      className={`relative overflow-hidden rounded-lg ring-2 transition ${
                        isActive ? "ring-[#7C5CFF]" : "ring-white/5 hover:ring-white/25"
                      }`}
                    >
                      <div aria-hidden="true" className="pointer-events-none">
                        <ScaledSlide slide={s} theme={theme} index={i} total={slides.length} deckTitle={title} />
                      </div>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        disabled={thumbState !== "ready"} // can't open a slide that's still "loading"
                        aria-label={`Go to slide ${i + 1}`}
                        aria-current={isActive ? "true" : undefined}
                        className="absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:cursor-wait"
                      />
                    </div>

                    {mode === "edit" && isActive && (
                      <div className="mt-2 flex justify-between gap-1">
                        <ThumbAction label="Move slide up" onClick={() => moveSlide(i, -1)} disabled={i === 0}>
                          <ChevronIcon direction="up" />
                        </ThumbAction>
                        <ThumbAction label="Move slide down" onClick={() => moveSlide(i, 1)} disabled={i === lastIndex}>
                          <ChevronIcon direction="down" />
                        </ThumbAction>
                        <ThumbAction label="Duplicate slide" onClick={() => duplicateSlide(i)}>
                          <CopyIcon />
                        </ThumbAction>
                        <ThumbAction label="Delete slide" onClick={() => deleteSlide(i)} disabled={slides.length === 1} danger>
                          <TrashIcon />
                        </ThumbAction>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {mode === "edit" && (
              <button
                type="button"
                onClick={addSlide}
                className="ml-6 flex h-[90px] w-40 shrink-0 items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 text-sm text-[#C9CBD6] transition hover:border-white/40 hover:text-white lg:w-auto"
              >
                <PlusIcon />
                Add slide
              </button>
            )}
          </nav>

          {/* ---------- Main slide ---------- */}
          <section className="order-1 flex flex-1 flex-col items-center justify-center gap-5 bg-[#0E1120] p-4 md:p-8 lg:order-2">
            {canEdit && (
              <p className="text-xs text-[#9B7BFF]">
                Click any text on the slide to edit it · Enter to save · Esc to cancel
              </p>
            )}

            <div
              ref={stageRef}
              className={
                isFullscreen
                  ? "flex h-full w-full items-center justify-center bg-black"
                  : "w-full max-w-5xl"
              }
            >
              <div
                key={slide.id}
                className="animate-slide-enter w-full overflow-hidden rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                style={isFullscreen ? { maxWidth: "calc(100vh * 16 / 9)" } : undefined}
              >
                <ScaledSlide
                  slide={slide}
                  theme={theme}
                  index={active}
                  total={slides.length}
                  deckTitle={title}
                  onEdit={canEdit ? updateSlide : undefined}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={prev}
                disabled={active === 0}
                aria-label="Previous slide"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronIcon direction="left" />
              </button>

              <p className="min-w-[64px] text-center text-sm tabular-nums text-[#C9CBD6]" aria-live="polite">
                {active + 1} / {slides.length}
              </p>

              <button
                type="button"
                onClick={next}
                disabled={active === lastIndex}
                aria-label="Next slide"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronIcon direction="right" />
              </button>
            </div>

            {!canEdit && (
              <p className="hidden text-xs text-[#6F7386] md:block">
                Use ← → to move between slides · F to present
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* ---------- Small action button under a thumbnail ---------- */

function ThumbAction({
  label,
  onClick,
  disabled = false,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 flex-1 items-center justify-center rounded-lg border border-white/10 transition disabled:opacity-30 ${
        danger
          ? "text-[#E58A9A] hover:bg-[#D9667A]/15"
          : "text-[#C9CBD6] hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- Icons ---------- */

function ArrowLeftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" | "up" | "down" }) {
  const paths = {
    left: "M15 18l-6-6 6-6",
    right: "M9 18l6-6-6-6",
    up: "M18 15l-6-6-6 6",
    down: "M6 9l6 6 6-6",
  };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[direction]} />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 5v14l12-7z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}