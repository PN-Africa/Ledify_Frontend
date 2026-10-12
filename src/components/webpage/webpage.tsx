"use client";

import { useRef } from "react";
import EditableText from "@/components/input/EditableText";
import type { Device, WebPage, WebSection, WebTheme } from "@/lib/webpage";

type WebPageViewProps = {
  page: WebPage;
  device: Device;
  onEdit?: (page: WebPage) => void;
};

export default function WebPageView({ page, device, onEdit }: WebPageViewProps) {
  const { theme } = page;
  const editing = Boolean(onEdit);
  const isMobile = device === "mobile";
  const px = sidePadding(device);

  function updatePage(changes: Partial<WebPage>) {
    onEdit?.({ ...page, ...changes });
  }

  function updateSection(updated: WebSection) {
    onEdit?.({
      ...page,
      sections: page.sections.map((s) => (s.id === updated.id ? updated : s)),
    });
  }

  return (
    <div style={{ background: theme.background, color: theme.text }}>
      {/* ---------- Navbar ---------- */}
      <header
        className={`animate-section-in flex items-center justify-between py-5 ${px}`}
        style={{ animationDelay: "0s" }}
      >
        <EditableText
          value={page.brand}
          onCommit={editing ? (brand) => updatePage({ brand }) : undefined}
          className="font-heading text-lg font-bold"
        />

        {isMobile ? (
          <MenuIcon />
        ) : (
          <>
            <nav className="flex gap-8 text-sm">
              {page.navLinks.map((link, i) => (
                <EditableText
                  key={i}
                  value={link}
                  onCommit={
                    editing
                      ? (text) => updatePage({ navLinks: page.navLinks.map((l, j) => (j === i ? text : l)) })
                      : undefined
                  }
                />
              ))}
            </nav>
            <span
              className="rounded-lg px-4 py-2.5 text-sm font-semibold"
              style={{ background: theme.accent, color: theme.accentText }}
            >
              <EditableText
                value={page.navButton}
                onCommit={editing ? (navButton) => updatePage({ navButton }) : undefined}
              />
            </span>
          </>
        )}
      </header>

      {/* ---------- Sections, loading in one after another ---------- */}
      {page.sections.map((section, i) => (
        <div
          key={section.id}
          className="animate-section-in"
          style={{ animationDelay: `${(i + 1) * 0.12}s` }}
        >
          <SectionView
            section={section}
            theme={theme}
            device={device}
            onChange={editing ? updateSection : undefined}
          />
        </div>
      ))}

      {/* ---------- Footer ---------- */}
      <footer
        className={`animate-section-in flex items-center justify-between border-t py-8 text-sm ${px}`}
        style={{
          animationDelay: `${(page.sections.length + 1) * 0.12}s`,
          borderColor: theme.surface,
          color: theme.muted,
        }}
      >
        <span className="font-heading font-bold" style={{ color: theme.text }}>
          {page.brand}
        </span>
        <EditableText
          value={`© ${page.footerText}`}
          onCommit={editing ? (text) => updatePage({ footerText: text.replace(/^©\s*/, "") }) : undefined}
        />
      </footer>
    </div>
  );
}

/* ---------- One section ---------- */

function SectionView({
  section,
  theme,
  device,
  onChange,
}: {
  section: WebSection;
  theme: WebTheme;
  device: Device;
  onChange?: (section: WebSection) => void;
}) {
  const isMobile = device === "mobile";
  const isDesktop = device === "desktop";
  const px = sidePadding(device);

  switch (section.type) {
    case "hero":
      return (
        <section className="relative overflow-hidden" style={{ height: isMobile ? 460 : 560 }}>
          <EditableImage
            src={section.image}
            alt=""
            className="absolute inset-0"
            onReplace={onChange && ((image) => onChange({ ...section, image }))}
          />
          {/* Dark gradient so white text is readable on any photo */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />

          {/* pointer-events-none lets clicks reach the image's "Replace" button,
              while the text itself stays clickable */}
          <div className={`pointer-events-none relative flex h-full max-w-2xl flex-col justify-center text-white ${px}`}>
            <EditableText
              as="h1"
              value={section.heading}
              onCommit={onChange && ((heading) => onChange({ ...section, heading }))}
              className={`font-heading pointer-events-auto block font-bold leading-[1.05] ${
                isMobile ? "text-[36px]" : isDesktop ? "text-[60px]" : "text-[48px]"
              }`}
            />
            <EditableText
              as="p"
              value={section.subheading}
              onCommit={onChange && ((subheading) => onChange({ ...section, subheading }))}
              className="pointer-events-auto mt-5 block max-w-lg text-lg text-white/85"
            />
            <span className="pointer-events-auto mt-8 self-start rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#1A1A1A]">
              <EditableText
                value={section.buttonLabel}
                onCommit={onChange && ((buttonLabel) => onChange({ ...section, buttonLabel }))}
              />
            </span>
          </div>
        </section>
      );

    case "products": {
      const updateItem = (id: string, changes: Partial<(typeof section.items)[number]>) =>
        onChange?.({
          ...section,
          items: section.items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
        });

      return (
        <section className={`py-16 ${px}`}>
          <EditableText
            as="h2"
            value={section.heading}
            onCommit={onChange && ((heading) => onChange({ ...section, heading }))}
            className="font-heading block text-[32px] font-bold"
          />
          <div className={`mt-8 grid gap-5 ${isDesktop ? "grid-cols-4" : "grid-cols-2"}`}>
            {section.items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl" style={{ background: theme.surface }}>
                <EditableImage
                  src={item.image}
                  alt={item.name}
                  className="aspect-[4/5] w-full"
                  onReplace={onChange && ((image) => updateItem(item.id, { image }))}
                />
                <div className="p-4">
                  <EditableText
                    as="h3"
                    value={item.name}
                    onCommit={onChange && ((name) => updateItem(item.id, { name }))}
                    className="block font-semibold"
                  />
                  <EditableText
                    as="p"
                    value={item.price}
                    onCommit={onChange && ((price) => updateItem(item.id, { price }))}
                    className="mt-1 block text-sm"
                    style={{ color: theme.muted }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      );
    }

    case "features": {
      const updateItem = (id: string, changes: Partial<(typeof section.items)[number]>) =>
        onChange?.({
          ...section,
          items: section.items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
        });

      return (
        <section className={`py-16 ${px}`} style={{ background: theme.surface }}>
          <EditableText
            as="h2"
            value={section.heading}
            onCommit={onChange && ((heading) => onChange({ ...section, heading }))}
            className="font-heading block text-[32px] font-bold"
          />
          <div className={`mt-8 grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
            {section.items.map((item, i) => (
              <div key={item.id} className="rounded-2xl p-6" style={{ background: theme.background }}>
                <span className="text-sm font-semibold" style={{ color: theme.muted }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <EditableText
                  as="h3"
                  value={item.title}
                  onCommit={onChange && ((title) => updateItem(item.id, { title }))}
                  className="font-heading mt-2 block text-xl font-semibold"
                />
                <EditableText
                  as="p"
                  value={item.body}
                  onCommit={onChange && ((body) => updateItem(item.id, { body }))}
                  className="mt-2 block text-[15px] leading-relaxed"
                  style={{ color: theme.muted }}
                />
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "cta":
      return (
        <section className={`py-16 ${px}`}>
          <div
            className={`flex gap-6 rounded-3xl ${isMobile ? "flex-col p-8" : "items-center justify-between p-12"}`}
            style={{ background: theme.accent, color: theme.accentText }}
          >
            <div>
              <EditableText
                as="h2"
                value={section.heading}
                onCommit={onChange && ((heading) => onChange({ ...section, heading }))}
                className="font-heading block text-[32px] font-bold"
              />
              <EditableText
                as="p"
                value={section.body}
                onCommit={onChange && ((body) => onChange({ ...section, body }))}
                className="mt-2 block opacity-80"
              />
            </div>
            <span
              className="shrink-0 self-start rounded-lg px-6 py-3 text-sm font-semibold"
              style={{ background: theme.accentText, color: theme.accent }}
            >
              <EditableText
                value={section.buttonLabel}
                onCommit={onChange && ((buttonLabel) => onChange({ ...section, buttonLabel }))}
              />
            </span>
          </div>
        </section>
      );
  }
}

/* ---------- Image with a "Replace" option in Edit mode ---------- */

function EditableImage({
  src,
  alt,
  className = "",
  onReplace,
}: {
  src: string;
  alt: string;
  className?: string;
  onReplace?: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />

      {onReplace && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              // A temporary local URL so the new image shows instantly
              if (file) onReplace(URL.createObjectURL(file));
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-semibold text-white opacity-0 transition hover:bg-black/45 hover:opacity-100 focus-visible:bg-black/45 focus-visible:opacity-100"
          >
            Replace image
          </button>
        </>
      )}
    </div>
  );
}

function sidePadding(device: Device) {
  if (device === "mobile") return "px-5";
  if (device === "tablet") return "px-10";
  return "px-16";
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}