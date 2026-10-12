"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import EditableText from "@/components/input/EditableText";
import type { DocBlock, DocumentData } from "@/lib/document";
import { downloadDocumentPdf } from "@/lib/exportDocumentPdf";

type Mode = "preview" | "edit";
type HeadingBlock = Extract<DocBlock, { type: "heading" }>;

export default function DocumentViewer({ doc: initialDoc }: { doc: DocumentData }) {
  const [doc, setDoc] = useState<DocumentData>(initialDoc);
  const [mode, setMode] = useState<Mode>("preview");
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const headingRefs = useRef(new Map<string, HTMLElement>());
  const canEdit = mode === "edit";

  const headings = useMemo(
    () => doc.blocks.filter((b): b is HeadingBlock => b.type === "heading"),
    [doc.blocks]
  );

  const readingMinutes = useMemo(() => {
    const words = doc.blocks
      .map((b) => (b.type === "bullets" ? b.items.join(" ") : b.text))
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }, [doc.blocks]);

  // ---------- Highlight the section being read ----------
  const headingKey = headings.map((h) => h.id).join(",");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      // Only count a heading as "current" when it's in the top part of the screen
      { rootMargin: "-15% 0px -70% 0px" }
    );

    headingRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headingKey]);

  function scrollToHeading(id: string) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    headingRefs.current.get(id)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  // ---------- Editing ----------
  function updateBlock(updated: DocBlock) {
    setDoc((d) => ({ ...d, blocks: d.blocks.map((b) => (b.id === updated.id ? updated : b)) }));
  }

  function removeBlock(id: string) {
    setDoc((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }));
  }

  // ---------- Download ----------
   async function handleDownload() {
    setIsDownloading(true);
    try {
      await downloadDocumentPdf(doc); // uses the edited version, not the original
    } finally {
      setIsDownloading(false); // runs even if something goes wrong
    }
  }

  const outlineButtons = headings.map((h) => (
    <li key={h.id}>
      <button
        type="button"
        onClick={() => scrollToHeading(h.id)}
        aria-current={activeId === h.id ? "true" : undefined}
        className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-snug transition ${
          activeId === h.id
            ? "bg-[#7C5CFF]/15 font-medium text-white"
            : "text-[#A7AABB] hover:bg-white/5 hover:text-white"
        }`}
      >
        {h.text}
      </button>
    </li>
  ));

  return (
    <main className="min-h-screen w-full bg-[#0A0D18] px-4 pb-16 pt-28 md:px-6">
      {/* overflow-clip (not overflow-hidden) so the sticky outline still works */}
      <div className="mx-auto max-w-7xl overflow-clip rounded-3xl border border-white/10 bg-[#0B0D17]">
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
            <p className="text-xs text-[#8A8FA3]">
              Document · {headings.length} sections · {readingMinutes} min read
            </p>
            <h1 className="truncate text-sm font-semibold text-white md:text-base">{doc.title}</h1>
          </div>

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
            disabled={isDownloading}
            className="flex h-11 items-center gap-2 rounded-xl bg-[#6C47FF] px-4 text-sm font-semibold text-white transition hover:bg-[#5B38EE] disabled:cursor-wait disabled:opacity-70"
          >
            <DownloadIcon />
            <span className="hidden sm:inline">
              {isDownloading ? "Preparing…" : "Download PDF"}
            </span>
          </button>
        </header>

        <div className="flex">
          {/* ---------- Outline (large screens) ---------- */}
          <aside className="hidden w-64 shrink-0 border-r border-white/10 lg:block">
            <nav aria-label="Document outline" className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-4">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6F7386]">
                Contents
              </p>
              <ul className="space-y-1">{outlineButtons}</ul>
            </nav>
          </aside>

          {/* ---------- The paper ---------- */}
          <section className="min-w-0 flex-1 bg-[#0E1120] p-3 md:p-10">
            {/* Outline as a dropdown on smaller screens */}
            {headings.length > 0 && (
              <details className="mb-4 rounded-xl border border-white/10 bg-[#0B0D17] lg:hidden">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-white">
                  Contents
                </summary>
                <ul className="space-y-1 px-2 pb-3">{outlineButtons}</ul>
              </details>
            )}

            {canEdit && (
              <p className="mb-4 text-center text-xs text-[#9B7BFF]">
                Click any text to edit it · clear a paragraph or bullet to remove it
              </p>
            )}

            <article className="print-area mx-auto w-full max-w-[816px] rounded-lg bg-white px-6 py-10 text-[#15131F] shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:px-16 md:py-16">
              <div className="animate-section-in">
                <EditableText
                  as="h1"
                  value={doc.title}
                  onCommit={canEdit ? (title) => setDoc((d) => ({ ...d, title })) : undefined}
                  className="font-heading block text-[32px] font-bold leading-tight md:text-[40px]"
                />
                {doc.subtitle && (
                  <EditableText
                    as="p"
                    value={doc.subtitle}
                    onCommit={canEdit ? (subtitle) => setDoc((d) => ({ ...d, subtitle })) : undefined}
                    className="mt-3 block text-lg text-[#5B5868]"
                  />
                )}
                <hr className="mt-8 border-[#E7E4EF]" />
              </div>

              {doc.blocks.map((block, i) => (
                <div
                  key={block.id}
                  id={block.id}
                  ref={
                    block.type === "heading"
                      ? (el) => {
                          if (el) headingRefs.current.set(block.id, el);
                          else headingRefs.current.delete(block.id);
                        }
                      : undefined
                  }
                  className={`animate-section-in ${block.type === "heading" ? "scroll-mt-28" : ""}`}
                  style={{ animationDelay: `${Math.min(i + 1, 12) * 0.06}s` }}
                >
                  <BlockView
                    block={block}
                    onChange={canEdit ? updateBlock : undefined}
                    onRemove={() => removeBlock(block.id)}
                  />
                </div>
              ))}
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ---------- One block of the document ---------- */

function BlockView({
  block,
  onChange,
  onRemove,
}: {
  block: DocBlock;
  onChange?: (block: DocBlock) => void;
  onRemove: () => void;
}) {
  switch (block.type) {
    case "heading":
      return (
        <EditableText
          as="h2"
          value={block.text}
          onCommit={onChange && ((text) => onChange({ ...block, text }))}
          className="font-heading mt-10 block text-[24px] font-bold leading-tight md:text-[26px]"
        />
      );

    case "subheading":
      return (
        <EditableText
          as="h3"
          value={block.text}
          onCommit={onChange && ((text) => onChange({ ...block, text }))}
          className="mt-6 block text-lg font-semibold"
        />
      );

    case "paragraph":
      return (
        <EditableText
          as="p"
          value={block.text}
          allowEmpty
          onCommit={onChange && ((text) => (text ? onChange({ ...block, text }) : onRemove()))}
          className="mt-4 block text-[16px] leading-[1.75] text-[#3A3846]"
        />
      );

    case "bullets":
      return (
        <ul className="mt-4 space-y-2">
          {block.items.map((item, i) => (
            <li key={`${i}-${item}`} className="flex gap-3 text-[16px] leading-[1.7] text-[#3A3846]">
              {/* A text bullet (not a coloured dot) so it still prints */}
              <span aria-hidden="true" className="font-bold text-[#6C47FF]">
                •
              </span>
              <EditableText
                value={item}
                allowEmpty
                onCommit={
                  onChange &&
                  ((text) => {
                    const items = text
                      ? block.items.map((it, j) => (j === i ? text : it))
                      : block.items.filter((_, j) => j !== i);
                    if (items.length === 0) onRemove();
                    else onChange({ ...block, items });
                  })
                }
              />
            </li>
          ))}
        </ul>
      );

    case "callout":
      return (
        <div className="mt-6 rounded-xl bg-[#F3F0FF] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6C47FF]">Key takeaway</p>
          <EditableText
            as="p"
            value={block.text}
            onCommit={onChange && ((text) => onChange({ ...block, text }))}
            className="mt-2 block text-[16px] font-medium leading-relaxed text-[#2A2440]"
          />
        </div>
      );
  }
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