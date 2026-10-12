"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { DEVICE_WIDTHS, type Device, type WebPage } from "@/lib/webpage";
import WebPageView from "./webpage";

type Mode = "preview" | "edit";

const DEVICES: { id: Device; label: string; icon: ReactNode }[] = [
  { id: "desktop", label: "Desktop", icon: <DesktopIcon /> },
  { id: "tablet", label: "Tablet", icon: <TabletIcon /> },
  { id: "mobile", label: "Mobile", icon: <MobileIcon /> },
];

export default function WebPageViewer({ webpage }: { webpage: WebPage }) {
  const [page, setPage] = useState<WebPage>(webpage);
  const [device, setDevice] = useState<Device>("desktop");
  const [mode, setMode] = useState<Mode>("preview");
  const canEdit = mode === "edit";

  function handleDownload() {
    // TODO: export as an HTML file, or request a deployable site from the backend
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
            <p className="text-xs text-[#8A8FA3]">Web page</p>
            <h1 className="truncate text-sm font-semibold text-white md:text-base">{page.title}</h1>
          </div>

          {/* Device preview */}
          <div role="group" aria-label="Preview size" className="flex rounded-xl border border-white/15 p-1">
            {DEVICES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDevice(d.id)}
                aria-pressed={device === d.id}
                aria-label={d.label}
                title={d.label}
                className={`flex h-9 w-10 items-center justify-center rounded-lg transition ${
                  device === d.id ? "bg-white text-[#0B0D17]" : "text-[#C9CBD6] hover:text-white"
                }`}
              >
                {d.icon}
              </button>
            ))}
          </div>

          {/* Preview / Edit */}
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
            onClick={handleDownload}
            className="flex h-11 items-center gap-2 rounded-xl bg-[#6C47FF] px-4 text-sm font-semibold text-white transition hover:bg-[#5B38EE]"
          >
            <DownloadIcon />
            <span className="hidden sm:inline">Download</span>
          </button>
        </header>

        {/* ---------- Preview area ---------- */}
        <section className="bg-[#0E1120] p-4 md:p-8">
          {canEdit && (
            <p className="mb-4 text-center text-xs text-[#9B7BFF]">
              Click any text to edit it · hover an image to replace it
            </p>
          )}

          <ScaledFrame width={DEVICE_WIDTHS[device]}>
            <div className="overflow-hidden rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <BrowserBar />
              <WebPageView page={page} device={device} onEdit={canEdit ? setPage : undefined} />
            </div>
          </ScaledFrame>
        </section>
      </div>
    </main>
  );
}

/* ---------- Draws the page at the device's width, then scales it to fit ---------- */

function ScaledFrame({ width, children }: { width: number; children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const observer = new ResizeObserver(() => {
      setAvailable(outer.clientWidth);
      setContentHeight(inner.offsetHeight);
    });
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  // Never scale up: a 390px phone preview stays 390px and sits in the middle
  const scale = available ? Math.min(1, available / width) : 1;

  return (
    <div ref={outerRef} className="w-full">
      <div
        className="mx-auto overflow-hidden transition-[width] duration-300"
        style={{ width: width * scale, height: contentHeight ? contentHeight * scale : undefined }}
      >
        <div ref={innerRef} style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function BrowserBar() {
  return (
    <div className="flex items-center gap-2 bg-[#E9E9EC] px-4 py-3">
      <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
      <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
      <span className="h-3 w-3 rounded-full bg-[#28C840]" />
      <span className="ml-3 rounded-md bg-white px-3 py-1 text-xs text-[#6B6B6B]">Preview</span>
    </div>
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

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

function DesktopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function TabletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}