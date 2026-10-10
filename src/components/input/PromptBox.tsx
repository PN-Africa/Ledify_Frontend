"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type { Draft } from "@/lib/draftStore";
import {
  MIN_PROMPT_LENGTH,
  MAX_PROMPT_LENGTH,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  ACCEPTED_FILES,
} from "@/lib/limits";

const MAX_FILES = 5;
const MAX_LINKS = 3;

const PLACEHOLDER_PROMPTS = [
  "Create a 5-slide presentation about AI in healthcare...",
  "Build a landing page for my soap business...",
  "Write a project proposal for a school water dispenser...",
  "Turn my lecture notes into a clean study guide...",
  "Make a pitch deck for a fintech startup in Lagos...",
];

function useTypewriter(phrases: string[], enabled: boolean) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const current = phrases[index];
    const finishedTyping = !isDeleting && text === current;
    const finishedDeleting = isDeleting && text === "";

    let delay = isDeleting ? 25 : 55;
    if (finishedTyping) delay = 1800;
    if (finishedDeleting) delay = 400;

    const timer = setTimeout(() => {
      if (finishedTyping) {
        setIsDeleting(true);
      } else if (finishedDeleting) {
        setIsDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      } else {
        setText(current.slice(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, index, isDeleting, enabled, phrases]);

  return text;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type PromptBoxProps = {
  initialDraft?: Draft; // pre-fill the box (used on /create)
  onContinue: (draft: Draft) => void; // each page decides where Continue goes
  variant?: "hero" | "page"; // small style differences between the two pages
};

export default function PromptBox({
  initialDraft,
  onContinue,
  variant = "hero",
}: PromptBoxProps) {
  // useState only uses these starting values on the first render
  const [prompt, setPrompt] = useState(initialDraft?.prompt ?? "");
  const [files, setFiles] = useState<File[]>(initialDraft?.files ?? []);
  const [links, setLinks] = useState<string[]>(initialDraft?.links ?? []);
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const promptIsValid = prompt.trim().length >= MIN_PROMPT_LENGTH;
  const hasAttachments = files.length > 0 || links.length > 0;
  const canContinue = promptIsValid || hasAttachments;
   const showLengthWarning =
    variant === "page" && prompt.length > 0 && !promptIsValid && !hasAttachments;

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    if (showLinkInput) linkInputRef.current?.focus();
  }, [showLinkInput]);

  const typedPlaceholder = useTypewriter(
    PLACEHOLDER_PROMPTS,
    !reducedMotion && prompt.length === 0
  );
  const placeholder = reducedMotion
    ? PLACEHOLDER_PROMPTS[0]
    : `${typedPlaceholder}|`;

  // ---------- Files ----------
  function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;

    setError(null);
    const next = [...files];

    for (const file of Array.from(selected)) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" is bigger than ${MAX_FILE_SIZE_MB} MB.`);
        continue;
      }
      const alreadyAdded = next.some(
        (f) => f.name === file.name && f.size === file.size
      );
      if (alreadyAdded) continue;
      if (next.length >= MAX_FILES) {
        setError(`You can attach up to ${MAX_FILES} files.`);
        break;
      }
      next.push(file);
    }

    setFiles(next);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // ---------- Links ----------
  function addLink() {
    const value = linkInput.trim();
    if (!value) return;

    let url: URL;
    try {
      url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    } catch {
      setError("That doesn't look like a valid link.");
      return;
    }

    if (!url.hostname.includes(".")) {
      setError("That doesn't look like a valid link.");
      return;
    }
    if (links.length >= MAX_LINKS) {
      setError(`You can add up to ${MAX_LINKS} links.`);
      return;
    }

    if (!links.includes(url.href)) setLinks([...links, url.href]);
    setLinkInput("");
    setShowLinkInput(false);
    setError(null);
  }

  function handleLinkKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addLink();
    }
    if (e.key === "Escape") {
      setShowLinkInput(false);
      setLinkInput("");
    }
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  // ---------- Continue ----------
  const isPage = variant === "page";

  const continueEnabled = isPage ? canContinue : true;

  function handleContinue() {
    if (!continueEnabled) return;
    onContinue({ prompt: prompt.trim(), files, links });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleContinue();
    }
  }



  return (
    <div className="flex w-full flex-col items-center">
      <div className="group relative w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-0.5 rounded-[30px] bg-gradient-to-r from-[#7C5CFF]/70 via-[#3B04FF]/40 to-[#C8F560]/40 opacity-60 blur-md transition-opacity duration-300 group-focus-within:opacity-100"
        />

        <div className="relative rounded-[28px] border border-white/10 bg-[#0E0C16]/90 p-4 text-left shadow-[0_8px_40px_rgba(124,92,255,0.25)] backdrop-blur-xl">
          <label htmlFor="prompt-input" className="sr-only">
            Describe what you want to create
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) =>
              setPrompt(e.target.value.slice(0, MAX_PROMPT_LENGTH))
            }
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder={placeholder}
            className="block min-h-[140px] w-full resize-none bg-transparent px-2 pt-2 text-base leading-relaxed text-[#F5F3FF] placeholder:text-[#6F6B82] focus:outline-none md:text-lg"
          />

          {hasAttachments && (
            <ul className="mt-3 flex flex-wrap gap-2 px-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${file.size}`}
                  className="flex max-w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-3 pr-1.5 text-sm text-[#F5F3FF]"
                >
                  <FileIcon />
                  <span className="max-w-[180px] truncate">{file.name}</span>
                  <span className="text-xs text-[#8A859E]">
                    {formatSize(file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove ${file.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A7A3BA] transition hover:bg-white/10 hover:text-white"
                  >
                    <XIcon />
                  </button>
                </li>
              ))}
              {links.map((link, i) => (
                <li
                  key={link}
                  className="flex max-w-full items-center gap-2 rounded-xl border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 py-1.5 pl-3 pr-1.5 text-sm text-[#F5F3FF]"
                >
                  <LinkIcon size={14} />
                  <span className="max-w-[220px] truncate">
                    {new URL(link).hostname + new URL(link).pathname}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    aria-label={`Remove link ${link}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A7A3BA] transition hover:bg-white/10 hover:text-white"
                  >
                    <XIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showLinkInput && (
            <div className="mt-3 flex items-center gap-2 px-2">
              <label htmlFor="link-input" className="sr-only">
                Paste a link
              </label>
              <input
                id="link-input"
                ref={linkInputRef}
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={handleLinkKeyDown}
                placeholder="Paste a link, e.g. https://example.com/article"
                className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-[#F5F3FF] placeholder:text-[#6F6B82] focus:border-[#7C5CFF] focus:outline-none"
              />
              <button
                type="button"
                onClick={addLink}
                className="h-11 rounded-xl bg-[#7C5CFF] px-4 text-sm font-semibold text-white transition hover:bg-[#6B4BF0]"
              >
                Add
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between px-2 text-xs">
            <span
              className={showLengthWarning ? "text-[#E2795D]" : "text-[#6F6B82]"}
            >
              Min. {MIN_PROMPT_LENGTH} characters
            </span>
            <span className="text-[#8A859E]">
              {prompt.length}/{MAX_PROMPT_LENGTH}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between px-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_FILES}
              onChange={handleFilesSelected}
              className="hidden"
            />

            {/* Hero: round "+" button. Create page: purple "Upload file" pill */}
            {isPage ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 items-center gap-1.5 rounded-full bg-[#6C47FF] px-4 text-sm font-medium text-white transition hover:bg-[#5B38EE]"
              >
                <PlusIcon size={16} />
                Upload file
              </button>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach files"
                title="Attach files"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-[#F5F3FF] transition hover:bg-white/10"
              >
                <PlusIcon size={20} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowLinkInput((open) => !open)}
              aria-label="Add a link"
              aria-expanded={showLinkInput}
              title="Add a link"
              className={`flex h-11 w-11 items-center justify-center rounded-full text-[#F5F3FF] transition ${
                showLinkInput ? "bg-[#7C5CFF]/30" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <LinkIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-[#E2795D]">
          {error}
        </p>
      )}

      {/* Hero: white button. Create page: purple button with an arrow */}
      <button
        type="button"
        disabled={!continueEnabled}
        onClick={handleContinue}
        className={`mt-8 flex items-center gap-2 rounded-xl px-10 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
          isPage
            ? "bg-[#6C47FF] text-white hover:bg-[#5B38EE] disabled:hover:bg-[#6C47FF]"
            : "bg-white text-[#0B0A10] hover:bg-[#E9E6F5] disabled:hover:bg-white"
        }`}
      >
        Continue
        {isPage && <ArrowRightIcon />}
      </button>
    </div>
  );
}

/* ---------- Icons ---------- */

function PlusIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function LinkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}