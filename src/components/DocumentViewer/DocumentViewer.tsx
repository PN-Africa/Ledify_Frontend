"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

// One A4 page at screen size (96 dpi): 210 × 297 mm
const PAGE_W = 794;
const PAGE_H = 1123;

// Thumbnail intro: same feel as the presentation viewer
const LOADING_AHEAD = 2; // blurred "loading" thumbnails ahead of the sharp ones
const MAX_STEP = 220; // ms per thumbnail, at most
const MAX_INTRO_TIME = 1800; // the whole intro never takes longer than this

type ThumbState = "ready" | "loading" | "hidden";

type Props = {
  previewUrl: string;
  downloadUrl: string;
};

export default function DocumentPreview({ previewUrl, downloadUrl }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pageCount, setPageCount] = useState(0); // 0 = not measured yet
  const [active, setActive] = useState(0);

  const [revealed, setRevealed] = useState(0); // how many thumbnails are sharp
  const [introDone, setIntroDone] = useState(false);

  const lastIndex = Math.max(0, pageCount - 1);

  // ---------- 1. Fetch the document HTML once ----------
  useEffect(() => {
    const controller = new AbortController();

    fetch(previewUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Preview failed with status ${res.status}`);
        return res.text();
      })
      .then((text) => {
        // <base> keeps the document's own styles and images loading from the right place
        const base = `<base href="${new URL(previewUrl, window.location.href).href}">`;
        const withBase = /<head[^>]*>/i.test(text)
          ? text.replace(/<head[^>]*>/i, (head) => head + base)
          : base + text;
        setHtml(withBase);
      })
      .catch((error) => {
        if (controller.signal.aborted) return; // we left the page, not a real error
        console.error(error);
        setFailed(true);
      });

    return () => controller.abort();
  }, [previewUrl]);

  // ---------- 2. Reveal thumbnails one after another ----------
  useEffect(() => {
    if (pageCount === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setIntroDone(true);
      return;
    }

    // More pages = shorter steps, so the intro stays under MAX_INTRO_TIME
    const step = Math.min(MAX_STEP, MAX_INTRO_TIME / pageCount);
    let count = 0;

    const timer = setInterval(() => {
      count += 1;
      setRevealed(count);
      if (count >= pageCount) {
        clearInterval(timer);
        setIntroDone(true);
      }
    }, step);

    return () => clearInterval(timer);
  }, [pageCount]);

  function getThumbState(i: number): ThumbState {
    if (introDone || i < revealed) return "ready";
    if (i < revealed + LOADING_AHEAD) return "loading";
    return "hidden";
  }

  // ---------- 3. Navigation ----------
  const next = useCallback(() => setActive((i) => Math.min(lastIndex, i + 1)), [lastIndex]);
  const prev = useCallback(() => setActive((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") prev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev]);

  return (
    <main className="min-h-screen w-full bg-[#0A0D18] px-4 pb-16 pt-28 md:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B0D17]">
        {/* ---------- Toolbar ---------- */}
        <header className="flex items-center justify-between border-b border-white/10 px-3 py-3 md:px-5">
          <Link
            href="/create"
            aria-label="Back to create"
            className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10"
          >
            <ArrowLeftIcon />
          </Link>

          <a
            href={downloadUrl}
            download
            aria-label="Download document (.docx)"
            title="Download .docx"
            className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10"
          >
            <DownloadIcon />
          </a>
        </header>

        {failed ? (
          // ---------- Could not load the preview ----------
          <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
            <p className="text-white">We couldn&apos;t load the document preview.</p>
            <a
              href={downloadUrl}
              download
              className="rounded-xl bg-[#6C47FF] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B38EE]"
            >
              Download .docx instead
            </a>
          </div>
        ) : !html ? (
          // ---------- Still loading ----------
          <p className="px-6 py-24 text-center text-sm text-[#C9CBD6]">Loading document…</p>
        ) : (
          <div className="flex flex-col lg:flex-row">
            {/* ---------- Page thumbnails ---------- */}
            <nav
              aria-label="Pages"
              className="order-2 flex gap-4 overflow-x-auto border-t border-white/10 p-4 lg:order-1 lg:max-h-[calc(100vh-220px)] lg:w-48 lg:shrink-0 lg:flex-col lg:items-center lg:overflow-y-auto lg:overflow-x-hidden lg:border-r lg:border-t-0"
            >
              {Array.from({ length: pageCount }, (_, i) => {
                const isActive = i === active;
                const state = getThumbState(i);

                return (
                  <div
                    key={i}
                    className={`flex w-24 shrink-0 flex-col items-center gap-1.5 transition-[opacity,filter,transform] duration-500 ease-out lg:w-28 ${
                      state === "ready"
                        ? "translate-y-0 scale-100 opacity-100 blur-0"
                        : state === "loading"
                          ? "translate-y-0 scale-[0.97] opacity-60 blur-[6px]"
                          : "translate-y-3 scale-[0.97] opacity-0 blur-[6px]"
                    }`}
                  >
                    <div
                      className={`relative w-full overflow-hidden rounded-md ring-2 transition ${
                        isActive ? "ring-[#7C5CFF]" : "ring-white/10 hover:ring-white/30"
                      }`}
                    >
                      <div aria-hidden="true" className="pointer-events-none">
                        <PageFrame html={html} page={i} title={`Page ${i + 1} thumbnail`} />
                      </div>
                      {/* Invisible button on top, so the whole thumbnail is clickable */}
                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        disabled={state !== "ready"}
                        aria-label={`Go to page ${i + 1}`}
                        aria-current={isActive ? "page" : undefined}
                        className="absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:cursor-wait"
                      />
                    </div>
                    <span className={`text-xs tabular-nums ${isActive ? "text-white" : "text-[#6F7386]"}`}>
                      {i + 1}
                    </span>
                  </div>
                );
              })}
            </nav>

            {/* ---------- Current page ---------- */}
            <section className="order-1 flex flex-1 flex-col items-center gap-5 bg-[#0E1120] p-4 md:p-8 lg:order-2">
              <div className="w-full max-w-2xl overflow-hidden rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <PageFrame
                  html={html}
                  page={active}
                  title={`Document page ${active + 1}`}
                  onMeasure={setPageCount}
                />
              </div>

              {pageCount > 0 && (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={prev}
                    disabled={active === 0}
                    aria-label="Previous page"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronIcon direction="left" />
                  </button>
                  <p className="min-w-[64px] text-center text-sm tabular-nums text-[#C9CBD6]" aria-live="polite">
                    {active + 1} / {pageCount}
                  </p>
                  <button
                    type="button"
                    onClick={next}
                    disabled={active === lastIndex}
                    aria-label="Next page"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronIcon direction="right" />
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------- One A4 "window" into the document ---------- */

function PageFrame({
  html,
  page,
  title,
  onMeasure,
}: {
  html: string;
  page: number; // which page to show (0 = first)
  title: string;
  onMeasure?: (pageCount: number) => void; // only the main view measures
}) {
  const [boxRef, width] = useElementWidth<HTMLDivElement>();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const scale = width / PAGE_W;

  // Scroll the document inside the frame so this page is at the top
  const scrollToPage = useCallback(() => {
    frameRef.current?.contentWindow?.scrollTo(0, page * PAGE_H);
  }, [page]);

  useEffect(() => {
    scrollToPage();
  }, [scrollToPage]);
  function handleLoad() {
    const measure = () => {
      const doc = frameRef.current?.contentDocument;
      if (doc && onMeasure) {
        const total = Math.ceil(doc.documentElement.scrollHeight / PAGE_H);
        onMeasure(Math.max(1, total));
      }
      scrollToPage();
    };

    measure(); // right away
    setTimeout(measure, 1500); // again, once the preview's scripts have drawn the document
  }

  return (
    <div ref={boxRef} className="relative aspect-[210/297] w-full overflow-hidden bg-white">
      {width > 0 && (
        <iframe
          ref={frameRef}
          srcDoc={html}
          title={title}
          // Same origin so we can measure and scroll it; no scripts allowed inside
          sandbox="allow-same-origin"
          scrolling="no"
          onLoad={handleLoad}
          className="absolute left-0 top-0 origin-top-left border-0"
          style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}

/* ---------- Measures how wide an element is ---------- */

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

/* ---------- Icons ---------- */

function ArrowLeftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}