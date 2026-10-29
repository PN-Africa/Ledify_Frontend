"use client";

import { useRef, type ReactNode } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  MIN_PROMPT_LENGTH,
  MAX_PROMPT_LENGTH,
  MAX_FILE_SIZE_MB,
  ACCEPTED_FILE_LABEL,
} from "@/lib/limits";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const bricolage = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

type FaqItem = { question: string; answer: ReactNode };

// Exactly like the Figma: each inner list is one column, top to bottom
const COLUMNS: FaqItem[][] = [
  [
    {
      question: "Is Ledify free?",
      answer: "Yes. Ledify is free to use, with no subscription required.",
    },
    {
      question: "Can Ledify access any URL?",
      answer:
        "No. The page needs to be publicly accessible. Ledify can't read pages that require a login or payment.",
    },
  ],
  [
    {
      question: "Can I use a URL as my input?",
      answer:
        "Yes. You can paste a URL and Ledify will check whether the page can be reached and read.",
    },
    {
      question: "What can I create with Ledify?",
      answer:
        "You can create a presentation, web page, or document from your content.",
    },
  ],
  [
    {
      question: "How long can my prompt be?",
      answer: (
        <>
          Your prompt can be between{" "}
          <strong className="font-semibold text-[#F5F3FF]">
            {MIN_PROMPT_LENGTH} and {MAX_PROMPT_LENGTH.toLocaleString()}
          </strong>{" "}
          characters.
        </>
      ),
    },
    {
      question: "How large can my file be?",
      answer: (
        <>
          There&apos;s a maximum file-size limit of{" "}
          <strong className="font-semibold text-[#F5F3FF]">
            {MAX_FILE_SIZE_MB} MB
          </strong>
          .
        </>
      ),
    },
  ],
  [
    {
      question: "What types of files can I upload?",
      answer: `You can upload ${ACCEPTED_FILE_LABEL} files. Ledify uses the content in your file to create your chosen output.`,
    },
  ],
];

export default function Faq() {
  const pageRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Heading and subtitle fade up when the page opens
        gsap.from("[data-reveal]", {
          autoAlpha: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
        });

        // Cards fade up one after another when the grid scrolls into view
        gsap.from("[data-faq]", {
          autoAlpha: 0,
          y: 24,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.06,
          delay: 0.2,
          clearProps: "transform",
          scrollTrigger: {
            trigger: "[data-faq-grid]",
            start: "top 90%",
            once: true, // play one time, then leave everything visible
          },
        });
      });

      // Undo everything on unmount (and when React runs this twice in dev)
      return () => mm.revert();
    },
    { scope: pageRef }
  );

  return (
    <main ref={pageRef} className="w-full bg-[#0A0D18] px-6 pb-20 pt-32 md:pb-24">
      <div className="mx-auto max-w-4xl">
        <h1
          data-reveal
          className={`font-heading text-[28px] font-bold leading-tight text-[#F5F3FF] md:text-[32px] ${bricolage.variable}`}
        >
          One more thing.
        </h1>

        <p
          data-reveal
          className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-[#C9CBD6]"
        >
          Before you get started, here&apos;s some information that could make
          using Ledify even easier.
        </p>

        <div
          data-faq-grid
          className="mt-8 grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {COLUMNS.map((column, i) => (
            <div key={i} className="flex flex-col gap-3">
              {column.map((faq) => (
                <article
                  key={faq.question}
                  data-faq
                  className="rounded-lg border border-white/10 bg-[#161A2C] p-4 transition-[border-color,translate] duration-300 hover:-translate-y-1 hover:border-[#7C5CFF]/40"
                >
                  <h2 className="text-sm font-medium leading-snug text-[#F5F3FF]">
                    {faq.question}
                  </h2>
                  <div aria-hidden="true" className="mt-2 h-px w-6 bg-white/25" />
                  <p className="mt-3 text-xs leading-relaxed text-[#C9CBD6]">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}