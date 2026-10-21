"use client";

import { useState } from "react";
import Link from "next/link";

const VIEWPORTS = { desktop: 1280, tablet: 768, mobile: 390 } as const;
type Viewport = keyof typeof VIEWPORTS;

type Props = {
  previewUrl: string;
  downloadUrl: string;
};

export default function WebPagePreview({ previewUrl, downloadUrl }: Props) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [loaded, setLoaded] = useState(false);

  return (
    <main className="min-h-screen bg-[#0A0D18] px-4 pb-16 pt-28 md:px-8">
      {/* Toolbar */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link href="/create" className="text-sm text-[#C9CBD6] transition hover:text-white">
          ← Start new
        </Link>

        <div className="flex rounded-full bg-white/10 p-1">
          {(Object.keys(VIEWPORTS) as Viewport[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setViewport(v)}
              aria-pressed={viewport === v}
              className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
                viewport === v ? "bg-[#6C47FF] text-white" : "text-[#C9CBD6] hover:text-white"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <a
          href={downloadUrl}
          className="rounded-xl bg-[#6C47FF] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B38EE]"
        >
          Download
        </a>
      </div>

      {/* Preview frame */}
      <div className="mx-auto mt-6 flex justify-center">
        <div
          className="relative h-[75vh] overflow-hidden rounded-2xl border border-white/10 bg-white transition-[width] duration-300"
          style={{ width: VIEWPORTS[viewport], maxWidth: "100%" }}
        >
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0B0D17] text-sm text-[#C9CBD6]">
              Loading preview…
            </div>
          )}
          <iframe
            src={previewUrl}
            title="Generated web page preview"
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            className="h-full w-full"
          />
        </div>
      </div>
    </main>
  );
}