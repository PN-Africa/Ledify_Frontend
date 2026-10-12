"use client";

import { useEffect, useState } from "react";
import { getDraft, type OutputFormat } from "@/lib/draftStore";
import { SAMPLE_PRESENTATION } from "@/lib/presentation";
import { SAMPLE_WEBPAGE } from "@/lib/webpage";
import { SAMPLE_DOCUMENT } from "@/lib/document";
import PresentationViewer from "@/components/presentation/PresentationViewer";
import WebPageViewer from "@/components/webpage/WebPageViewer";
import DocumentViewer from "@/components/DocumentViewer/DocumentViewer";

export default function ResultView() {
  const [format, setFormat] = useState<OutputFormat | null>(null);

  useEffect(() => {
    // Show the sample for the format the user picked (presentation if none)
    setFormat(getDraft()?.format ?? "presentation");
  }, []);

  if (!format) {
    return <main className="min-h-screen bg-[#0A0D18]" />;
  }

  if (format === "presentation") {
    return <PresentationViewer presentation={SAMPLE_PRESENTATION} />;
  }
  if (format === "webpage") {
    return <WebPageViewer webpage={SAMPLE_WEBPAGE} />;
  }
  return <DocumentViewer doc={SAMPLE_DOCUMENT} />;
}