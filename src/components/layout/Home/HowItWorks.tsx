"use client";

import { useRef } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const bricolage = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const STEPS = [
  {
    number: "01",
    title: "Provide your content",
    description:
      "Type a prompt, drop a file, or paste a link. Rough notes are welcome.",
    preview: <ProvidePreview />,
  },
  {
    number: "02",
    title: "Pick a format",
    description:
      "Presentation, web page or document. Ledify shapes the structure to fit.",
    preview: <PickPreview />,
  },
  {
    number: "03",
    title: "Get a polished result",
    description:
      "Layout, hierarchy, and visuals handled. Preview your content, then download.",
    preview: <ResultPreview />,
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const replay = "play none none reverse";

        // Header: label, heading, paragraph
        gsap.from("[data-reveal]", {
          autoAlpha: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: replay,
          },
        });

        // One timeline for the cards and what happens inside them,
        // so everything plays (and reverses) in the right order
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: "[data-steps]",
            start: "top 80%",
            toggleActions: replay,
          },
        });

        tl.from("[data-step]", {
          autoAlpha: 0,
          y: 40,
          duration: 0.8,
          stagger: 0.15,
          clearProps: "transform",
        })
          // Step 1: the prompt bar, then the file and link chips pop in
          .from("[data-input]", { autoAlpha: 0, y: 8, duration: 0.4 }, "-=0.5")
          .from(
            "[data-chip]",
            { autoAlpha: 0, scale: 0.8, duration: 0.35, stagger: 0.1, ease: "back.out(2)" },
            "-=0.2"
          )
          // Step 2: the three format options drop in, the purple one is "picked"
          .from(
            "[data-option]",
            { autoAlpha: 0, y: 12, duration: 0.4, stagger: 0.08 },
            "-=0.4"
          )
          .from(
            "[data-picked]",
            { scale: 0.9, duration: 0.4, ease: "back.out(2.5)" },
            "-=0.1"
          )
          // Step 3: the finished slide appears and its text lines draw in
          .from(
            "[data-result]",
            { autoAlpha: 0, scale: 0.85, duration: 0.5, ease: "back.out(1.6)" },
            "-=0.3"
          )
          .from(
            "[data-result-line]",
            { scaleX: 0, transformOrigin: "left", duration: 0.4, stagger: 0.08 },
            "-=0.2"
          );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="w-full scroll-mt-24 bg-[#14121F] px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <p data-reveal className="text-xs uppercase tracking-wide text-[#8A8FA3]">
          How Ledify works
        </p>

        <h2
          data-reveal
          className={`font-heading mt-3 max-w-xl text-[32px] font-bold leading-[1.1] text-[#F5F3FF] md:text-[40px] ${bricolage.variable}`}
        >
          From content to creation in a few steps.
        </h2>

        <p data-reveal className="mt-5 text-[15px] leading-relaxed text-[#C9CBD6]">
          Give Ledify your content, choose your format, and let AI handle the
          structure.
        </p>

        <ol data-steps className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.number}
              data-step
              className="rounded-2xl border border-white/10 bg-[#12162A] p-6 transition-[border-color,translate] duration-300 hover:-translate-y-1 hover:border-[#7C5CFF]/40"
            >
              <div aria-hidden="true">{step.preview}</div>

              <p className="mt-6 text-xs text-[#8A8FA3]">{step.number}</p>
              <h3
                className={`font-heading mt-1 text-lg font-semibold text-[#F5F3FF] ${bricolage.variable}`}
              >
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#C9CBD6]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Mini illustrations ---------- */

function ProvidePreview() {
  return (
    <div className="flex h-[130px] flex-col justify-center gap-3 rounded-xl bg-[#2A2D3A] p-4">
      <div
        data-input
        className="truncate rounded-md border border-[#9AA0AC] bg-[#3A3E4C] px-2.5 py-1.5 text-[10px] text-[#E6E8EE]"
      >
        Create a 5-slide presentation about how AI
      </div>
      <div className="flex gap-2">
        <span data-chip className="rounded-md bg-[#4A4E5C] px-2.5 py-1 text-[10px] text-[#C9CBD6]">
          example.pdf
        </span>
        <span data-chip className="rounded-md bg-[#4A4E5C] px-2.5 py-1 text-[10px] text-[#C9CBD6]">
          example.com
        </span>
      </div>
    </div>
  );
}

function PickPreview() {
  return (
    <div className="flex h-[130px] items-center gap-2 rounded-xl bg-[#2A2D3A] p-3">
      {/* The "picked" format */}
      <div data-option className="flex-1">
        <div
          data-picked
          className="flex h-[76px] flex-col justify-end gap-1.5 rounded-md bg-[#6C47FF] p-2"
        >
          <div className="h-1.5 w-4/5 rounded-full bg-white" />
          <div className="h-1 w-1/2 rounded-full bg-white/60" />
        </div>
      </div>
      {/* The other two options */}
      {[0, 1].map((i) => (
        <div key={i} data-option className="flex-1">
          <div className="flex h-[76px] flex-col justify-end gap-1.5 rounded-md bg-[#4A4E5C] p-2">
            <div className="h-1.5 w-4/5 rounded-full bg-[#9AA0AC]" />
            <div className="h-1 w-1/2 rounded-full bg-[#7A8088]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultPreview() {
  return (
    <div className="flex h-[130px] items-start justify-center rounded-xl bg-[#2A2D3A] px-6 pt-2.5">
      <div
        data-result
        className="flex h-[104px] w-full flex-col gap-1.5 rounded-md bg-[#6C47FF] p-3"
      >
        <div data-result-line className="h-1.5 w-[85%] rounded-full bg-white" />
        <div data-result-line className="h-1 w-[55%] rounded-full bg-white/70" />
        <div data-result-line className="h-1 w-[40%] rounded-full bg-white/70" />
      </div>
    </div>
  );
}