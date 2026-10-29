"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getDraft,
  setDraft as saveDraft,
  type OutputFormat,
  type DocumentFormat,
} from "@/lib/draftStore";

type FormatOption = {
  id: OutputFormat;
  title: string;
  description: string;
  icon: ReactNode;
};

const FORMATS: FormatOption[] = [
  {
    id: "presentation",
    title: "Presentation",
    description: "Turn your content into a structured slide deck.",
    icon: <PresentationIcon />,
  },
  {
    id: "webpage",
    title: "Web Page",
    description: "Turn your content into a structured web page.",
    icon: <WebPageIcon />,
  },
  {
    id: "document",
    title: "Document",
    description: "Turn your content into a structured written document.",
    icon: <DocumentIcon />,
  },
];

const SLIDE_PRESETS = [5, 8, 10, 12];
const MIN_SLIDES = 3;
const MAX_SLIDES = 20;
const DEFAULT_SLIDES = 8;

const DOCUMENT_FORMATS: { id: DocumentFormat; label: string }[] = [
  { id: "docx", label: "Doc" },
  { id: "pdf", label: "PDF" },
];

export default function FormatPicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<OutputFormat | null>(null);
  const [slideCount, setSlideCount] = useState(DEFAULT_SLIDES);
  const [documentFormat, setDocumentFormat] = useState<DocumentFormat>("docx");

  const showSlideOptions = selected === "presentation";

  useEffect(() => {
    const draft = getDraft();
    if (!draft) {
      router.replace("/create");
      return;
    }
    setSelected(draft.format ?? null);
    setSlideCount(draft.options?.slideCount ?? DEFAULT_SLIDES);
    setDocumentFormat(draft.options?.documentFormat ?? "docx");
  }, [router]);

  function changeSlideCount(amount: number) {
    // Keep the number between MIN_SLIDES and MAX_SLIDES
    setSlideCount((n) => Math.min(MAX_SLIDES, Math.max(MIN_SLIDES, n + amount)));
  }

  function handleStart() {
    const draft = getDraft();
    if (!draft || !selected) return;

    // Each format only keeps the settings that belong to it
    const options =
      selected === "presentation"
        ? { slideCount }
        : selected === "document"
          ? { documentFormat }
          : undefined;

    saveDraft({ ...draft, format: selected, options });
    router.push("/create/generating");
  }

  return (
    <main className="min-h-screen w-full bg-[#0A0D18] px-6 pb-24 pt-32">
      <div className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B0D17] px-6 py-10 md:px-12 md:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(59,42,158,0.3),transparent)]"
        />

        <Link
          href="/create"
          aria-label="Back to your content"
          className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10"
        >
          <ArrowLeftIcon />
        </Link>

        <h1 className="font-heading mt-2 text-center text-[28px] font-bold leading-tight text-white md:text-[36px]">
          Choose an output format
        </h1>

        <fieldset className="mx-auto mt-10 max-w-3xl">
          <legend className="sr-only">Output format</legend>

          <div className="grid gap-5 sm:grid-cols-3">
            {FORMATS.map((format) => {
              const isSelected = selected === format.id;
              const showDocOptions = format.id === "document" && isSelected;

              return (
                // Wrapper so the popover can sit on the card's corner
                <div key={format.id} className="relative">
                  <label
                    className={`relative block h-full cursor-pointer rounded-xl border p-5 text-left transition duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-white has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#0B0D17] ${
                      isSelected
                        ? "border-[#7C5CFF] bg-[#7C5CFF]/10 shadow-[0_12px_40px_rgba(124,92,255,0.25)]"
                        : "border-white/10 bg-[#141826]/80 hover:-translate-y-1 hover:border-white/25"
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format.id}
                      checked={isSelected}
                      onChange={() => setSelected(format.id)}
                      className="sr-only"
                    />

                    {/* Purple tab on the top-right edge */}
                    <span
                      aria-hidden="true"
                      className="absolute right-4 top-0 h-[3px] w-12 rounded-b-full bg-[#6C47FF]"
                    />

                    {isSelected && !showDocOptions && (
                      <span
                        aria-hidden="true"
                        className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-[#6C47FF] text-white"
                      >
                        <CheckIcon />
                      </span>
                    )}

                    {/* Icon in a rounded box */}
                    <div
                      aria-hidden="true"
                      className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[#1C2030] text-[#8B6CFF]"
                    >
                      {format.icon}
                    </div>

                    <span className="mt-5 block text-[15px] font-semibold text-white">
                      {format.title}
                    </span>
                    <span className="mt-1.5 block text-xs leading-relaxed text-[#C9CBD6]">
                      {format.description}
                    </span>
                  </label>

                  {/* Doc / PDF choice, only for a selected Document card */}
                  {showDocOptions && (
                    <div
                      role="group"
                      aria-labelledby="doc-format-label"
                      className="absolute right-3 top-3 z-10 w-40 rounded-xl bg-[#E4E4E7] p-3 text-left shadow-[0_12px_30px_rgba(0,0,0,0.4)] md:-right-8 md:top-0"
                    >
                      <p
                        id="doc-format-label"
                        className="text-[13px] font-semibold leading-tight text-[#0B0D17]"
                      >
                        Select document format:
                      </p>
                      {DOCUMENT_FORMATS.map((f) => (
                        <label
                          key={f.id}
                          className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-medium text-[#0B0D17]"
                        >
                          <input
                            type="radio"
                            name="documentFormat"
                            value={f.id}
                            checked={documentFormat === f.id}
                            onChange={() => setDocumentFormat(f.id)}
                            className="h-3.5 w-3.5 accent-[#0B0D17]"
                          />
                          {f.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>

        {/* Slide options: open only when Presentation is picked */}
        <div
          inert={!showSlideOptions}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            showSlideOptions ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-5 md:flex md:items-center md:justify-between md:gap-6">
              <div>
                <p id="slide-count-label" className="text-sm font-medium text-white">
                  Number of slides
                </p>
                <p className="mt-1 text-xs text-[#8A8FA3]">
                  Pick a preset or set your own ({MIN_SLIDES}–{MAX_SLIDES}).
                </p>
              </div>

              <div
                role="group"
                aria-labelledby="slide-count-label"
                className="mt-4 flex flex-wrap items-center gap-3 md:mt-0"
              >
                {SLIDE_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSlideCount(n)}
                    aria-pressed={slideCount === n}
                    className={`h-11 min-w-11 rounded-full border px-4 text-sm font-medium transition ${
                      slideCount === n
                        ? "border-[#7C5CFF] bg-[#6C47FF] text-white"
                        : "border-white/15 text-[#C9CBD6] hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}

                <span className="px-1 text-sm text-[#6F7386]">or</span>

                {/* Stepper for any number in range */}
                <div className="flex items-center rounded-full border border-white/15">
                  <button
                    type="button"
                    onClick={() => changeSlideCount(-1)}
                    disabled={slideCount <= MIN_SLIDES}
                    aria-label="Fewer slides"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-30"
                  >
                    <MinusIcon />
                  </button>
                  <span
                    aria-live="polite"
                    className="w-14 text-center text-sm font-semibold tabular-nums text-white"
                  >
                    {slideCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeSlideCount(1)}
                    disabled={slideCount >= MAX_SLIDES}
                    aria-label="More slides"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-30"
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleStart}
            disabled={!selected}
            className="rounded-xl bg-[#6C47FF] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#5B38EE] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#6C47FF]"
          >
            Start generating
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------- Format icons (outline, purple via currentColor) ---------- */

function PresentationIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M12 16v4M8 20h8" />
      <path d="M8 13v-2M12 13V8M16 13v-3" />
    </svg>
  );
}

function WebPageIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 8.5h18" />
      <path d="M6 6.3h.01M8.3 6.3h.01M10.6 6.3h.01" />
      <rect x="6" y="11" width="5" height="5" rx="0.8" />
      <path d="M14 12h4M14 15h4" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 16.5h6M9 9.5h2" />
    </svg>
  );
}

/* ---------- Other icons ---------- */

function ArrowLeftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}