"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDraft, type OutputFormat } from "@/lib/draftStore";
import { getResult } from "@/lib/resultStore";
import type { GenerateResult } from "@/lib/generate";
import { SAMPLE_PRESENTATION } from "@/lib/presentation";
import PresentationViewer from "@/components/presentation/PresentationViewer";
import WebPagePreview from "@/components/webpage/webpagePreview";
import DocumentPreview from "@/components/DocumentViewer/DocumentViewer";
import SlideImageViewer from "@/components/presentation/SlideImageViewer";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// Turn "https://backend.../api/..." into "/api/..." so it goes through
// our Next.js proxy (see rewrites in next.config.ts)
function toProxyPath(url: string) {
  return url.replace(API_URL, "");
}

export default function ResultView() {
  const [format, setFormat] = useState<OutputFormat | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  useEffect(() => {
    // Read the id from the URL (?id=...) and find the saved result
    const id = new URLSearchParams(window.location.search).get("id");
    const saved = id ? getResult(id) : null;

    setResult(saved);
    setFormat(saved?.format ?? getDraft()?.format ?? "presentation");
  }, []);

  // Still reading the saved result: show an empty dark page
  if (!format) {
    return <main className="min-h-screen bg-[#0A0D18]" />;
  }

    // Presentation: show the slide pictures the backend made
  if (format === "presentation") {
    if (!result?.slides?.length) return <NotFound />;

    return (
      <SlideImageViewer
        title={result.title ?? "Presentation"}
        slides={result.slides}
        downloadUrl={result.downloadUrl ? toProxyPath(result.downloadUrl) : undefined}
      />
    );
  }

  // Web page and document both need a saved result with a download link
  if (!result || !result.downloadUrl) {
    return <NotFound />;
  }

  if (format === "webpage") {
    if (!result.siteUrl) return <NotFound />;

    return (
      <WebPagePreview
        previewUrl={toProxyPath(result.siteUrl)}
        downloadUrl={toProxyPath(result.downloadUrl)}
      />
    );
  }

  // Document
  if (!result.previewUrl) return <NotFound />;

  return (
    <DocumentPreview
      previewUrl={toProxyPath(result.previewUrl)}
      downloadUrl={toProxyPath(result.downloadUrl)}
    />
  );
}

/* ---------- Shown when no saved result matches the id ---------- */

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0D18] px-6 text-center">
      <h1 className="font-heading text-2xl font-bold text-white">
        We couldn&apos;t find this result
      </h1>
      <Link
        href="/create"
        className="rounded-xl bg-[#6C47FF] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B38EE]"
      >
        Create something new
      </Link>
    </main>
  );
}