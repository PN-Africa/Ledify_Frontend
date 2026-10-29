"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getDraft,
  clearDraft,
  type Draft,
  type OutputFormat,
} from "@/lib/draftStore";
import { generateContent } from "@/lib/generate";
import { saveResult } from "@/lib/resultStore";
const STEPS = [
  "Reading your content",
  "Structuring the information",
  "Creating your output",
  "Preparing your preview",
];

const STEP_DURATION = 1600; // ms before moving to the next step
const MIN_TOTAL_TIME = STEP_DURATION * (STEPS.length - 1); // let the steps play even if generation is fast

// How full the bar is while each step is active (100 when everything is done)
const STEP_PROGRESS = [14, 40, 66, 88];

const FORMAT_LABELS: Record<OutputFormat, string> = {
  presentation: "Presentation",
  webpage: "Web Page",
  document: "Document",
};

type Status = "generating" | "error";

export default function Generating() {
  const router = useRouter();
  const [draft, setDraftState] = useState<Draft | null>(null);
  const [status, setStatus] = useState<Status>("generating");
  const [activeStep, setActiveStep] = useState(0); // STEPS.length = all done
  const [attempt, setAttempt] = useState(0); // goes up on "Try again" to restart

  const allDone = activeStep >= STEPS.length;
  const progress = allDone ? 100 : STEP_PROGRESS[activeStep];

  // 1. Load the draft. Without a prompt AND a format, there's nothing to generate
  useEffect(() => {
    const saved = getDraft();
    if (!saved || !saved.format) {
      router.replace("/create");
      return;
    }
    setDraftState(saved);
  }, [router]);

  // 2. Move through the steps on a timer. The last step waits for the real result
  useEffect(() => {
    if (!draft || status !== "generating") return;
    if (activeStep >= STEPS.length - 1) return;

    const timer = setTimeout(() => setActiveStep((s) => s + 1), STEP_DURATION);
    return () => clearTimeout(timer);
  }, [draft, status, activeStep]);

  // 3. Run the generation (again each time "attempt" changes)
// 3. Run the generation (again each time "attempt" changes)
useEffect(() => {
  if (!draft) return;
  const controller = new AbortController();
  let redirectTimer: ReturnType<typeof setTimeout> | undefined;

  const minWait = new Promise((resolve) => setTimeout(resolve, MIN_TOTAL_TIME));

  Promise.all([generateContent(draft, controller.signal), minWait])
    .then(([result]) => {
      if (controller.signal.aborted) return;
      saveResult(result);
      clearDraft();
      setActiveStep(STEPS.length);
      redirectTimer = setTimeout(() => {
        router.push(`/create/result?id=${result.id}`);
      }, 700);
    })
    .catch((error) => {
      if (controller.signal.aborted) return; // we cancelled it on purpose, not a real error
      console.error("Generation failed:", error);
      setStatus("error");
    });

  return () => {
    controller.abort();          // actually stops the first request
    clearTimeout(redirectTimer); // stops a pending redirect
  };
}, [draft, attempt, router]);
  function handleTryAgain() {
    setStatus("generating");
    setActiveStep(0);
    setAttempt((a) => a + 1);
  }

  function handleStartNew() {
    clearDraft();
    router.push("/create");
  }

   const formatLabel = draft?.format ? FORMAT_LABELS[draft.format] : "";
  const slideCount =
    draft?.format === "presentation" ? draft.options?.slideCount : undefined;
  const outputDescription = slideCount
    ? `${slideCount}-slide presentation`
    : formatLabel.toLowerCase();

  return (
    <main className="min-h-screen w-full bg-[#0A0D18] px-6 pb-24 pt-32">
      <div
        className={`relative isolate mx-auto max-w-5xl overflow-hidden rounded-3xl border bg-[#0B0D17] px-6 py-12 text-center transition-colors duration-500 md:px-16 md:py-16 ${
          status === "error" ? "border-[#D9667A]/25" : "border-white/10"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(59,42,158,0.35),transparent)]"
        />

        <Link
          href="/create/format"
          aria-label="Back to format choice"
          className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10"
        >
          <ArrowLeftIcon />
        </Link>

        {status === "generating" ? (
          <div className="pb-6">
            {/* Output pill */}
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4">
              <span className="rounded-full bg-[#6C47FF] px-2.5 py-1 text-xs font-medium text-white">
                Output
              </span>
            <span className="text-base font-medium text-[#0B0D17]">
  {formatLabel}
  {slideCount ? ` · ${slideCount} slides` : ""}
</span>
            </div>

            <h1 className="font-heading mt-6 text-[28px] font-bold leading-tight text-white md:text-[40px]">
              Your content is being created.
            </h1>
           <p className="mt-3 text-[15px] text-[#C9CBD6]">
            Ledify is turning your input into a structured {outputDescription}.
          </p>

            {/* Progress bar */}
            <div
              role="progressbar"
              aria-label="Generation progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="relative mx-auto mt-8 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/15"
            >
              <div
                className="absolute inset-0 origin-left overflow-hidden rounded-full bg-gradient-to-r from-[#6C47FF] to-[#9B7BFF] transition-transform duration-[1200ms] ease-out"
                style={{ transform: `scaleX(${progress / 100})` }}
              >
                <span className="animate-shimmer absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              </div>
            </div>

            {/* Steps */}
            <ul className="mx-auto mt-10 flex w-fit flex-col items-start gap-3.5">
              {STEPS.map((step, i) => {
                const state =
                  i < activeStep ? "done" : i === activeStep ? "active" : "pending";
                return (
                  <li
                    key={step}
                    className={`flex items-center gap-3 text-sm transition-colors duration-300 ${
                      state === "pending" ? "text-[#6F7386]" : "text-white"
                    }`}
                  >
                    <StepIcon state={state} />
                    {step}
                  </li>
                );
              })}
            </ul>
              
            {/* Screen readers hear each new step without seeing the animation */}
            <p aria-live="polite" className="sr-only">
              {allDone ? "Done. Opening your preview." : STEPS[activeStep]}
            </p>
          </div>
        ) : (
          <div className="pb-10 pt-6">
            <div className="animate-check-pop mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D9667A] text-white">
              <XIcon />
            </div>

            <h1
              role="alert"
              className="font-heading mt-5 text-[28px] font-bold leading-tight text-white md:text-[40px]"
            >
              We couldn&apos;t generate your content
            </h1>
            <p className="mt-3 text-[15px] text-[#C9CBD6]">
              Something went wrong while creating your output. Please try again.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
             <button
  type="button"
  onClick={handleTryAgain}
                className="rounded-xl bg-[#6C47FF] px-9 py-3 text-sm font-semibold text-white transition hover:bg-[#5B38EE]"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={handleStartNew}
                className="rounded-xl bg-white px-9 py-3 text-sm font-semibold text-[#0B0D17] transition hover:bg-[#E9E6F5]"
              >
                Start new
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------- Step icon: done / active / pending ---------- */

function StepIcon({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done") {
    return (
      <span className="animate-check-pop flex h-5 w-5 items-center justify-center rounded-full bg-[#6C47FF] text-white">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12l5 5 9-10" />
        </svg>
      </span>
    );
  }

  if (state === "active") {
    return (
      <span
        aria-hidden="true"
        className="h-5 w-5 rounded-full border-2 border-[#6C47FF]/30 border-t-[#9B7BFF] motion-safe:animate-spin"
      />
    );
  }

  return (
    <span aria-hidden="true" className="h-5 w-5 rounded-full border-2 border-[#4A4E5C]" />
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}