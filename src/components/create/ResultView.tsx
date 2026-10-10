"use client";

import { useEffect, useState } from "react";
import { getDraft, type OutputFormat } from "@/lib/draftStore";
import { SAMPLE_PRESENTATION } from "@/lib/presentation";
import PresentationViewer from "@/components/presentation/PresentationViewer";

export default function ResultView() {
  const [format, setFormat] = useState<OutputFormat | null>(null);

  useEffect(() => {
    // No draft (e.g. after a refresh)? Show the sample presentation for now
    setFormat(getDraft()?.format ?? "presentation");
  }, []);

  if (!format) {
    return <main className="min-h-screen bg-[#0A0D18]" />;
  }

  if (format === "presentation") {
    // TODO: load the real presentation from the backend using the id in the URL
    return <PresentationViewer presentation={SAMPLE_PRESENTATION} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0D18] px-6 text-center text-[#C9CBD6]">
      The {format === "webpage" ? "web page" : "document"} viewer is coming next.
    </main>
  );
}