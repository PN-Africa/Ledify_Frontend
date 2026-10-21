"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  previewUrl: string;
  downloadUrl: string;
};

export default function DocumentPreview({ previewUrl, downloadUrl }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <main className="min-h-screen bg-[#0A0D18] px-4 pb-16 pt-28 md:px-8">
      {/* Toolbar */}
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
        <Link href="/create" className="text-sm text-[#C9CBD6] transition hover:text-white">
          ← Start new
        </Link>
        <a
          href={downloadUrl}
          download
          className="rounded-xl bg-[#6C47FF] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B38EE]"
        >
          Download .docx
        </a>
      </div>

      {/* Document frame */}
      <div className="relative mx-auto mt-6 h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0B0D17] text-sm text-[#C9CBD6]">
            Loading document…
          </div>
        )}
        {/* TODO: if the preview turns out to be HTML (not PDF), add sandbox="" here */}
        <iframe
          src={previewUrl}
          title="Generated document preview"
          onLoad={() => setLoaded(true)}
          className="h-full w-full"
        />
      </div>
    </main>
  );
}