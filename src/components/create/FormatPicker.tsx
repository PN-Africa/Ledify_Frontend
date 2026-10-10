"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getDraft,
  setDraft as saveDraft,
  type OutputFormat,
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
    description: "Get a structured page with a hero, sections, and a clear ending.",
    icon: <WebPageIcon />,
  },
  {
    id: "document",
    title: "Document",
    description: "Organise your content into headings, sections, and lists.",
    icon: <DocumentIcon />,
  },
];

const SLIDE_PRESETS = [5, 8, 10, 12];
const MIN_SLIDES = 3;
const MAX_SLIDES = 20;
const DEFAULT_SLIDES = 8;

export default function FormatPicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<OutputFormat | null>(null);
  const [slideCount, setSlideCount] = useState(DEFAULT_SLIDES);

  const showSlideOptions = selected === "presentation";

  useEffect(() => {
    const draft = getDraft();
    if (!draft) {
      router.replace("/create");
      return;
    }
    setSelected(draft.format ?? null);
    setSlideCount(draft.options?.slideCount ?? DEFAULT_SLIDES);
  }, [router]);

  function changeSlideCount(amount: number) {
    // Keep the number between MIN_SLIDES and MAX_SLIDES
    setSlideCount((n) => Math.min(MAX_SLIDES, Math.max(MIN_SLIDES, n + amount)));
  }

  function handleStart() {
    const draft = getDraft();
    if (!draft || !selected) return;

    saveDraft({
      ...draft,
      format: selected,
      // Only presentations have a slide count
      options: selected === "presentation" ? { slideCount } : undefined,
    });
    router.push("/create/generating");
  }

  return (
    <main className="min-h-screen w-full bg-[#0A0D18] px-6 pb-24 pt-32">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B0D17] px-6 py-12 md:px-16 md:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(59,42,158,0.35),transparent)]"
        />

        <Link
          href="/create"
          aria-label="Back to your content"
          className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10"
        >
          <ArrowLeftIcon />
        </Link>

        <h1 className="font-heading mt-4 text-center text-[32px] font-bold leading-tight text-white md:text-[48px]">
          Choose an output format
        </h1>

        <fieldset className="mx-auto mt-12 max-w-5xl">
          <legend className="sr-only">Output format</legend>

          <div className="grid gap-6 md:grid-cols-3">
            {FORMATS.map((format) => {
              const isSelected = selected === format.id;

              return (
                <label
                  key={format.id}
                  className={`relative cursor-pointer rounded-2xl border p-8 text-left transition duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-white has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#0B0D17] ${
                    isSelected
                      ? "border-[#7C5CFF] bg-[#7C5CFF]/10 shadow-[0_12px_40px_rgba(124,92,255,0.3)]"
                      : "border-[#7C5CFF]/40 bg-[#0D0B1A] hover:-translate-y-1 hover:border-[#7C5CFF]/80"
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

                  <span
                    aria-hidden="true"
                    className="absolute left-8 top-0 h-1 w-20 rounded-b-full bg-[#6C47FF]"
                  />

                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-[#6C47FF] text-white"
                    >
                      <CheckIcon />
                    </span>
                  )}

                  <div aria-hidden="true">{format.icon}</div>

                  <span className="font-heading mt-6 block text-xl font-semibold text-white">
                    {format.title}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-[#C9CBD6]">
                    {format.description}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Slide options: slides open only when Presentation is picked */}
        <div
          inert={!showSlideOptions}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            showSlideOptions ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:flex md:items-center md:justify-between md:gap-6">
              <div>
                <p id="slide-count-label" className="font-medium text-white">
                  Number of slides
                </p>
                <p className="mt-1 text-sm text-[#8A8FA3]">
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

        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={handleStart}
            disabled={!selected}
            className="rounded-xl bg-[#6C47FF] px-8 py-4 text-base font-semibold text-white transition hover:bg-[#5B38EE] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#6C47FF]"
          >
            Start generating
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------- Icons ---------- */

function PresentationIcon() {
  return (
    <div className="flex h-[58px] w-[106px] flex-col rounded-md bg-[#2A2D3A] p-1.5">
      <div className="h-1.5 w-full rounded-full bg-[#6C47FF]" />
      <div className="mt-1 h-0.5 w-full rounded-full bg-[#7A8088]" />
      <div className="mt-auto flex items-end gap-1">
        <div className="h-3 flex-1 rounded-sm bg-[#7A8088]" />
        <div className="h-5 flex-1 rounded-sm bg-[#7A8088]" />
        <div className="h-4 flex-1 rounded-sm bg-[#7A8088]" />
        <div className="h-6 flex-1 rounded-sm bg-[#6C47FF]" />
      </div>
    </div>
  );
}

function WebPageIcon() {
  return (
    <div className="flex h-[58px] w-[106px] flex-col justify-between rounded-md bg-[#2A2D3A] p-1.5">
      <div className="h-6 w-full rounded bg-[#6C47FF]" />
      <div className="flex gap-1">
        <div className="h-3.5 flex-1 rounded-sm bg-[#C9CDD3]" />
        <div className="h-3.5 flex-1 rounded-sm bg-[#7A8088]" />
        <div className="h-3.5 flex-1 rounded-sm bg-[#7A8088]" />
      </div>
    </div>
  );
}

function DocumentIcon() {
  return (
    <div className="h-[58px] w-[106px] rounded-md bg-[#EEF1F5] p-2">
      <div className="h-1.5 w-1/2 rounded-full bg-[#6C47FF]" />
      <div className="mt-2 space-y-1">
        <div className="h-0.5 w-[90%] rounded-full bg-[#7A8088]" />
        <div className="h-0.5 w-3/4 rounded-full bg-[#7A8088]" />
        <div className="h-0.5 w-[55%] rounded-full bg-[#7A8088]" />
      </div>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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