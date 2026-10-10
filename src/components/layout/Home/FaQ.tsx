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

// Order matters: the layout fills column 1 top-to-bottom, then column 2, etc.
const FAQS: FaqItem[] = [
  {
    question: "Is Ledify free?",
    answer: "Yes. Ledify is free to use, with no subscription required.",
  },
  {
    question: "Can Ledify access any URL?",
    answer:
      "No. The page needs to be publicly accessible. Ledify can't read pages that require a login or payment.",
  },
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
  {
    question: "What types of files can I upload?",
    answer: `You can upload ${ACCEPTED_FILE_LABEL} files. Ledify uses the content in your file to create your chosen output.`,
  },
];

export default function Faq() {
  const pageRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Header plays straight away when the page opens
        gsap.from("[data-reveal]", {
          autoAlpha: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
        });

        // Cards: on a big screen they're already in view, so this plays on load.
        // On a phone, the lower cards wait until you scroll to them.
        gsap.utils.toArray<HTMLElement>("[data-faq]").forEach((card, i) => {
          gsap.from(card, {
            autoAlpha: 0,
            y: 30,
            duration: 0.6,
            ease: "power3.out",
            delay: 0.3 + (i % 4) * 0.08,
            clearProps: "transform",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          });
        });
      });
    },
    { scope: pageRef }
  );

  return (
    <main
      ref={pageRef}
      className="min-h-screen w-full bg-[#0A0D18] px-6 pb-24 pt-36 md:pb-32"
    >
      <div className="mx-auto max-w-5xl">
        <h1
          data-reveal
          className={`font-heading text-[36px] font-bold leading-[1.1] text-[#F5F3FF] md:text-[48px] ${bricolage.variable}`}
        >
          One more thing.
        </h1>

        <p
          data-reveal
          className="mt-4 max-w-md text-[15px] leading-relaxed text-[#C9CBD6]"
        >
          Before you get started, here&apos;s some information that can make
          using Ledify even easier.
        </p>

        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-4">
          {FAQS.map((faq) => (
            <article
              key={faq.question}
              data-faq
              className="mb-5 break-inside-avoid rounded-xl border border-white/10 bg-[#161A2C] p-5 transition-[border-color,translate] duration-300 hover:-translate-y-1 hover:border-[#7C5CFF]/40"
            >
              <h2 className="text-[17px] font-medium leading-snug text-[#F5F3FF]">
                {faq.question}
              </h2>
              <div aria-hidden="true" className="mt-3 h-px w-10 bg-white/25" />
              <p className="mt-4 text-sm leading-relaxed text-[#C9CBD6]">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}