"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

// The word that rotates in the heading
const WORDS = ["Web page", "Presentation", "Document"];
const WORD_HOLD_TIME = 2600; // ms each word stays before switching

export default function CtaBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const isFirstWord = useRef(true);
  const [index, setIndex] = useState(0);

  // ---------- Rotating word ----------
  // Every few seconds: slide the current word up and out, then switch to the next
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return; // keep "Web page" still

    const timer = setInterval(() => {
      gsap.to(wordRef.current, {
        yPercent: -100,
        autoAlpha: 0,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => setIndex((i) => (i + 1) % WORDS.length),
      });
    }, WORD_HOLD_TIME);

    return () => clearInterval(timer);
  }, []);

  // Each time the word changes, slide the new one up from below
  useGSAP(
    () => {
      if (isFirstWord.current) {
        isFirstWord.current = false; // the first word doesn't need to slide in
        return;
      }
      gsap.fromTo(
        wordRef.current,
        { yPercent: 100, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }
      );
    },
    { dependencies: [index], scope: sectionRef }
  );

  // ---------- Scroll entrance (circles + text only; the button is always visible) ----------
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true, // play one time, then leave everything visible
          },
        });

        tl.from("[data-circle]", {
          scale: 0.6,
          autoAlpha: 0,
          duration: 1.2,
          stagger: 0.15,
        }).from(
          "[data-reveal]",
          { autoAlpha: 0, y: 30, duration: 0.7, stagger: 0.12 },
          "-=1"
        );
      });

      // Undo everything when the component unmounts (or React runs this twice in dev)
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full overflow-hidden bg-[#6A47EA] px-6 py-20 md:py-28"
    >
      {/* Decorative circles on the right */}
      <div
        aria-hidden="true"
        data-circle
        className="absolute -right-40 -top-32 -z-10 h-[520px] w-[520px] rounded-full bg-white/10"
      />
      <div
        aria-hidden="true"
        data-circle
        className="absolute -bottom-40 right-[18%] -z-10 h-[340px] w-[340px] rounded-full bg-white/10"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-10 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          {/* Screen readers get one clear sentence instead of a word that keeps changing */}
          <h2
            data-reveal
            aria-label="Your next web page, presentation, or document is one prompt away."
            className={`font-heading text-[36px] font-bold leading-[1.05] text-white sm:text-[48px] md:text-[64px] ${bricolage.variable}`}
          >
            <span aria-hidden="true">
              Your next{" "}
              {/* Mask: hides the word while it slides in and out */}
              <span className="-mb-[0.15em] inline-block overflow-hidden pb-[0.15em] align-bottom">
                <span ref={wordRef} className="inline-block">
                  {WORDS[index]}
                </span>
              </span>{" "}
              is one prompt away.
            </span>
          </h2>

          <p
            data-reveal
            className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/90"
          >
            Start with a prompt, a file, or a URL. Choose your format and let
            Ledify do the rest.
          </p>
        </div>

        <Link
          href="/#get-started"
          className="shrink-0 rounded-xl bg-[#0B0D17] px-14 py-5 text-lg font-semibold text-white transition hover:bg-[#1A1D2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}