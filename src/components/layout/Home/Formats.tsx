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

const FORMATS = [
  {
    title: "Presentation",
    description:
      "Get your ideas organised into slides with clear headings, key points, supporting content, and a conclusion.",
    preview: <PresentationPreview />,
  },
  {
    title: "Web Page",
    description:
      "Give Ledify the information and get a structured page with a hero, content sections, and a clear closing section.",
    preview: <WebPagePreview />,
  },
  {
    title: "Documents",
    description:
      "Get your content organised with headings, sections, paragraphs, and lists that are easy to read.",
    preview: <DocumentPreview />,
  },
];

export default function Formats() {
  const sectionRef = useRef<HTMLElement>(null);

    useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Shared settings: play when scrolling down into view,
        // reverse when scrolling back up above it, then replay next time
        const replay = "play none none reverse";

        // 1. Label, heading, paragraph
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

        // 2. Cards, one after another
        gsap.from("[data-card]", {
          autoAlpha: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          clearProps: "transform",
          scrollTrigger: {
            trigger: "[data-cards]",
            start: "top 80%",
            toggleActions: replay,
          },
        });

        // 3. Bars grow up from the bottom
        gsap.from("[data-bar]", {
          scaleY: 0,
          transformOrigin: "bottom",
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: 0.08,
          delay: 0.5,
          scrollTrigger: {
            trigger: "[data-cards]",
            start: "top 80%",
            toggleActions: replay,
          },
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="w-full bg-[#0A0D18] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <p data-reveal className="text-xs uppercase tracking-wide text-[#8A8FA3]">
          One starting point. Three ways to use it.
        </p>

        <h2
          data-reveal
          className={`font-heading mt-3 max-w-md text-[32px] font-bold leading-[1.1] text-[#F5F3FF] md:text-[40px] ${bricolage.variable}`}
        >
          Bring the content. Choose the format.
        </h2>

        <p
          data-reveal
          className="mt-5 max-w-lg text-[15px] leading-relaxed text-[#C9CBD6]"
        >
          Whether you&apos;re starting with an idea, an existing file, or a
          reference link, Ledify helps take the information you already have
          and puts it into a format that works for you.
        </p>

        <div data-cards className="mt-12 grid gap-6 md:grid-cols-3">
          {FORMATS.map((format) => (
            <article
              key={format.title}
              data-card
              className="rounded-2xl border border-white/10 bg-[#12162A] p-6 transition-[border-color,translate] duration-300 hover:-translate-y-1 hover:border-[#7C5CFF]/40"
            >
              <div aria-hidden="true">{format.preview}</div>

              <h3
                className={`font-heading mt-6 text-lg font-semibold text-[#F5F3FF] ${bricolage.variable}`}
              >
                {format.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#C9CBD6]">
                {format.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Mini illustrations ---------- */

function PresentationPreview() {
  return (
    <div className="flex h-[130px] flex-col rounded-xl bg-[#2A2D3A] p-4">
      <div className="h-3 w-full rounded-full bg-[#6C47FF]" />
      <div className="mt-2 h-1.5 w-full rounded-full bg-[#7A8088]" />
      <div className="mt-auto flex items-end gap-2">
        <div data-bar className="h-8 flex-1 rounded-md bg-[#7A8088]" />
        <div data-bar className="h-12 flex-1 rounded-md bg-[#7A8088]" />
        <div data-bar className="h-10 flex-1 rounded-md bg-[#7A8088]" />
        <div data-bar className="h-16 flex-1 rounded-md bg-[#6C47FF]" />
      </div>
    </div>
  );
}

function WebPagePreview() {
  return (
    <div className="flex h-[130px] flex-col justify-between rounded-xl bg-[#2A2D3A] p-4">
      <div className="h-14 w-full rounded-lg bg-[#6C47FF]" />
      <div className="flex gap-2">
        <div className="h-8 flex-1 rounded-md bg-[#C9CDD3]" />
        <div className="h-8 flex-1 rounded-md bg-[#7A8088]" />
        <div className="h-8 flex-1 rounded-md bg-[#7A8088]" />
      </div>
    </div>
  );
}

function DocumentPreview() {
  return (
    <div className="h-[130px] rounded-xl bg-[#EEF1F5] p-4">
      <div className="h-3 w-1/2 rounded-full bg-[#6C47FF]" />
      <div className="mt-4 space-y-2.5">
        <div className="h-1.5 w-[90%] rounded-full bg-[#7A8088]" />
        <div className="h-1.5 w-3/4 rounded-full bg-[#7A8088]" />
        <div className="h-1.5 w-[55%] rounded-full bg-[#7A8088]" />
      </div>
    </div>
  );
}