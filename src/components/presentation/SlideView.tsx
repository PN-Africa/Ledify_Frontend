"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
  type Slide,
  type Theme,
} from "@/lib/presentation";

type SlideProps = {
  slide: Slide;
  theme: Theme;
  index: number;
  total: number;
  deckTitle: string;
  onEdit?: (slide: Slide) => void; // given = the slide can be edited
};

/* ---------- Text that becomes editable in Edit mode ---------- */

type EditableTextProps = {
  value: string;
  onCommit?: (text: string) => void;
  as?: "h2" | "h3" | "p" | "span";
  className?: string;
  style?: CSSProperties;
  allowEmpty?: boolean; // bullets: empty = delete the bullet
};

function EditableText({
  value,
  onCommit,
  as: Tag = "span",
  className = "",
  style,
  allowEmpty = false,
}: EditableTextProps) {
  if (!onCommit) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur(); // Enter = done
    }
    if (e.key === "Escape") {
      e.currentTarget.textContent = value; // Esc = cancel
      e.currentTarget.blur();
    }
  }

  return (
    <Tag
      key={value} // a new value from outside resets the editable text
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onKeyDown={handleKeyDown}
      onBlur={(e) => {
        const text = e.currentTarget.textContent?.trim() ?? "";
        if (!text && !allowEmpty) {
          e.currentTarget.textContent = value; // never leave a title empty
          return;
        }
        if (text !== value) onCommit(text);
      }}
      className={`${className} cursor-text rounded-md outline-none ring-offset-4 ring-offset-transparent transition-shadow hover:ring-2 hover:ring-white/30 focus:ring-2 focus:ring-[#9B7BFF]`}
      style={style}
    >
      {value}
    </Tag>
  );
}
/* ---------- One slide, always drawn at 960 × 540 ---------- */

export function SlideView({ slide, theme, index, total, deckTitle, onEdit }: SlideProps) {
  return (
    <div
      className="relative flex flex-col overflow-hidden p-16"
      style={{
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        background: theme.background,
        color: theme.text,
      }}
    >
      <SlideLayout slide={slide} theme={theme} onEdit={onEdit} />

      {slide.layout !== "title" && (
        <div
          className="pointer-events-none absolute inset-x-16 bottom-7 flex justify-between text-[13px]"
          style={{ color: theme.muted }}
        >
          <span>{deckTitle}</span>
          <span>
            {index + 1} / {total}
          </span>
        </div>
      )}
    </div>
  );
}

function SlideLayout({
  slide,
  theme,
  onEdit,
}: {
  slide: Slide;
  theme: Theme;
  onEdit?: (slide: Slide) => void;
}) {
  switch (slide.layout) {
    case "title":
      return (
        <>
          <Circle theme={theme} className="-right-24 -top-24 h-[420px] w-[420px]" />
          <Circle theme={theme} className="-bottom-32 right-44 h-[260px] w-[260px] opacity-60" />
          <div className="relative mt-auto mb-8">
            <AccentBar theme={theme} />
            <EditableText
              as="h2"
              value={slide.title}
              onCommit={onEdit && ((title) => onEdit({ ...slide, title }))}
              className="font-heading block max-w-[640px] text-[68px] font-bold leading-[1.02]"
            />
            {slide.subtitle && (
              <EditableText
                as="p"
                value={slide.subtitle}
                onCommit={onEdit && ((subtitle) => onEdit({ ...slide, subtitle }))}
                className="mt-5 block max-w-[520px] text-[22px] leading-snug"
                style={{ color: theme.muted }}
              />
            )}
          </div>
        </>
      );

    case "bullets":
      return (
        <>
          <AccentBar theme={theme} />
          <EditableText
            as="h2"
            value={slide.title}
            onCommit={onEdit && ((title) => onEdit({ ...slide, title }))}
            className="font-heading block text-[44px] font-bold leading-tight"
          />
          <ul className="mt-10 space-y-5">
            {slide.bullets.map((bullet, i) => (
              <li key={`${i}-${bullet}`} className="flex gap-4 text-[24px] leading-snug">
                <span
                  className="mt-[11px] h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: theme.accent }}
                />
                <EditableText
                  value={bullet}
                  allowEmpty
                  onCommit={
                    onEdit &&
                    ((text) =>
                      onEdit({
                        ...slide,
                        // Empty text deletes the bullet, otherwise replace it
                        bullets: text
                          ? slide.bullets.map((b, j) => (j === i ? text : b))
                          : slide.bullets.filter((_, j) => j !== i),
                      }))
                  }
                />
              </li>
            ))}
          </ul>
          {onEdit && slide.bullets.length < 6 && (
            <button
              type="button"
              onClick={() => onEdit({ ...slide, bullets: [...slide.bullets, "New point"] })}
              className="mt-5 self-start rounded-lg border border-dashed px-4 py-2 text-[16px] transition hover:opacity-80"
              style={{ borderColor: theme.muted, color: theme.muted }}
            >
              + Add point
            </button>
          )}
        </>
      );

    case "cards": {
      const updateCard = (i: number, field: "heading" | "body", text: string) =>
        onEdit?.({
          ...slide,
          cards: slide.cards.map((card, j) => (j === i ? { ...card, [field]: text } : card)),
        });

      return (
        <>
          <AccentBar theme={theme} />
          <EditableText
            as="h2"
            value={slide.title}
            onCommit={onEdit && ((title) => onEdit({ ...slide, title }))}
            className="font-heading block text-[44px] font-bold leading-tight"
          />
          <div className="mt-10 grid grid-cols-3 gap-6">
            {slide.cards.map((card, i) => (
              <div key={i} className="rounded-2xl p-7" style={{ background: theme.surface }}>
                <span className="text-[15px] font-semibold" style={{ color: theme.accent }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <EditableText
                  as="h3"
                  value={card.heading}
                  onCommit={onEdit && ((text) => updateCard(i, "heading", text))}
                  className="font-heading mt-3 block text-[24px] font-semibold leading-tight"
                />
                <EditableText
                  as="p"
                  value={card.body}
                  onCommit={onEdit && ((text) => updateCard(i, "body", text))}
                  className="mt-3 block text-[17px] leading-snug"
                  style={{ color: theme.muted }}
                />
              </div>
            ))}
          </div>
        </>
      );
    }

    case "statement":
      return (
        <div className="my-auto max-w-[760px]">
          <span className="font-heading block text-[120px] leading-[0.6]" style={{ color: theme.accent }}>
            &ldquo;
          </span>
          <EditableText
            as="p"
            value={slide.statement}
            onCommit={onEdit && ((statement) => onEdit({ ...slide, statement }))}
            className="font-heading mt-6 block text-[44px] font-semibold leading-[1.15]"
          />
          {slide.caption && (
            <EditableText
              as="p"
              value={slide.caption}
              onCommit={onEdit && ((caption) => onEdit({ ...slide, caption }))}
              className="mt-6 block text-[15px] font-medium uppercase tracking-widest"
              style={{ color: theme.muted }}
            />
          )}
        </div>
      );

    case "closing":
      return (
        <>
          <Circle theme={theme} className="-left-28 -bottom-28 h-[360px] w-[360px]" />
          <div className="relative m-auto text-center">
            <EditableText
              as="h2"
              value={slide.title}
              onCommit={onEdit && ((title) => onEdit({ ...slide, title }))}
              className="font-heading block text-[84px] font-bold leading-none"
            />
            {slide.subtitle && (
              <EditableText
                as="p"
                value={slide.subtitle}
                onCommit={onEdit && ((subtitle) => onEdit({ ...slide, subtitle }))}
                className="mt-5 block text-[24px]"
                style={{ color: theme.muted }}
              />
            )}
          </div>
        </>
      );
  }
}

function AccentBar({ theme }: { theme: Theme }) {
  return <div className="mb-5 h-1.5 w-16 shrink-0 rounded-full" style={{ background: theme.accent }} />;
}

function Circle({ theme, className }: { theme: Theme; className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-full ${className}`}
      style={{ background: theme.surface }}
    />
  );
}

/* ---------- Scales a 960 × 540 slide to fit any width ---------- */

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

export function ScaledSlide(props: SlideProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const scale = width / SLIDE_WIDTH;

  return (
    <div ref={ref} className="relative aspect-video w-full overflow-hidden">
      {width > 0 && (
        <div
          className="absolute left-0 top-0"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          <SlideView {...props} />
        </div>
      )}
    </div>
  );
}

export type { ReactNode };