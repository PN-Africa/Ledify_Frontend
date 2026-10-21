"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bricolage_Grotesque } from "next/font/google";
import PromptBox from "@/components/input/PromptBox";
import { getDraft, setDraft as saveDraft, type Draft } from "@/lib/draftStore";

const bricolage = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function CreateInput() {
  const router = useRouter();
  const [draft, setDraftState] = useState<Draft | null>(null);

   useEffect(() => {
    // Anything typed on the landing page, or an empty box
    setDraftState(getDraft() ?? { prompt: "", files: [], link: [] });
  }, []);

  function handleContinue(next: Draft) {
  saveDraft(next);
  router.push("/create/format");
}

  return (
    <main className="min-h-screen w-full bg-[#0A0D18] px-6 pb-24 pt-32">
      <div className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B0D17] px-6 py-16 text-center md:px-16 md:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B2A9E]/25 blur-[110px]"
        />

        <h1
          className={`font-heading text-[32px] font-bold leading-tight text-white md:text-[40px] ${bricolage.variable}`}
        >
          What do you want to create?
        </h1>
        <p className="mt-3 text-[15px] text-[#C9CBD6]">
          Start with a prompt, upload a file, or enter a URL.
        </p>

        <div className="mx-auto mt-10 max-w-3xl">
          {draft ? (
            <PromptBox
              initialDraft={draft}
              onContinue={handleContinue}
              variant="page"
            />
          ) : (
            // Placeholder the same size as the box, so nothing jumps
            <div className="h-[250px] animate-pulse rounded-[28px] bg-white/5" />
          )}
        </div>
      </div>
    </main>
  );
}