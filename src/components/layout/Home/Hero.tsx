"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Bricolage_Grotesque } from "next/font/google";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import Starfield from "@/components/ui/Starfield";
import PromptBox from "@/components/input/PromptBox";
import { setDraft, type Draft } from "@/lib/draftStore";

gsap.registerPlugin(useGSAP, SplitText);

const bricolage = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function Hero() {
  const router = useRouter();

  
  function handleContinue(draft: Draft) {
    setDraft(draft);
    router.push("/create");
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLSpanElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.set(containerRef.current, { autoAlpha: 1 });

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(splitRef.current, {
          type: "words",
          mask: "words",
        });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(split.words, { yPercent: 110, duration: 0.9, stagger: 0.06 })
          .from(
            highlightRef.current,
            { autoAlpha: 0, y: 24, filter: "blur(10px)", duration: 0.9 },
            "-=0.4"
          )
          .from(subRef.current, { autoAlpha: 0, y: 16, duration: 0.6 }, "-=0.5")
          .from(promptRef.current, { autoAlpha: 0, y: 24, duration: 0.7 }, "-=0.4");

        return () => split.revert();
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="get-started"
      className="animate-wave-bg relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black px-6 pb-24 pt-32 text-center"
    >
      <Starfield className="h-[900px]" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-40 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#7C5CFF]/20 blur-[120px]"
      />

      <div
        ref={containerRef}
        className="invisible relative mx-auto w-full max-w-4xl"
      >
        <h1
          className={`font-heading text-[32px] font-bold leading-tight text-[#F5F3FF] sm:text-[40px] sm:leading-[48px] md:text-[65px] md:leading-[72px] ${bricolage.variable}`}
        >
          <span ref={splitRef}>
            Turn any idea into a polished presentation, page, or document,
          </span>{" "}
          <span
            ref={highlightRef}
            className="inline-block bg-gradient-to-r from-[#FFFFFF] to-[#3B04FF] bg-clip-text text-transparent"
          >
            instantly.
          </span>
        </h1>

        <p ref={subRef} className="mx-auto mt-6 max-w-xl text-[#A7A3BA]">
          Drop in a prompt, a file, or a link. Ledify structures it, designs
          it, and hands back something you can actually use.
        </p>

        <div ref={promptRef} className="mt-12 w-full">
          <PromptBox onContinue={handleContinue} variant="hero" />
        </div>
      </div>
    </section>
  );
}