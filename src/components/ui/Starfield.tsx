"use client";

import { useEffect, useState } from "react";

type Star = {
  left: number;
  top: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
};

const STAR_COUNT = 40; // use the number you had before

function createStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, () => {
    const size = Math.random() * 3 + 1.5;
    return {
      left: Math.random() * 100,
      top: Math.random() * 100,
      size,
      color: Math.random() > 0.8 ? "#C9B8FF" : "#FFFFFF",
      duration: Math.random() * 2 + 1.8,
      delay: Math.random() * 3,
    };
  });
}

export default function Starfield({ className = "" }: { className?: string }) {
  // Start empty: the server and the browser's first render now match
  const [stars, setStars] = useState<Star[]>([]);

  // Runs only in the browser, after hydration, so Math.random() is safe here
  useEffect(() => {
    setStars(createStars());
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-0 -z-10 ${className}`}
    >
      {stars.map((star, i) => {
        const big = star.size > 3;
        return (
          <span
            key={i}
            className="animate-twinkle-dot absolute rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              boxShadow: `0 0 ${big ? 10 : 5}px ${big ? 2 : 1}px ${star.color}99`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}