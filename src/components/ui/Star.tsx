interface StarProps {
  className?: string;
  delay?: number; // seconds, so multiple stars don't blink in sync
}

export default function Star({ className = "", delay = 0 }: StarProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`animate-twinkle ${className}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
    </svg>
  );
}