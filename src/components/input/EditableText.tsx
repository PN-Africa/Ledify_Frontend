"use client";

import type { CSSProperties, KeyboardEvent } from "react";

type EditableTextProps = {
  value: string;
  onCommit?: (text: string) => void;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  style?: CSSProperties;
  allowEmpty?: boolean;
};

export default function EditableText({
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
      e.currentTarget.blur();
    }
    if (e.key === "Escape") {
      e.currentTarget.textContent = value;
      e.currentTarget.blur();
    }
  }

  return (
    <Tag
      key={value}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onKeyDown={handleKeyDown}
      onBlur={(e) => {
        const text = e.currentTarget.textContent?.trim() ?? "";
        if (!text && !allowEmpty) {
          e.currentTarget.textContent = value;
          return;
        }
        if (text !== value) onCommit(text);
      }}
      className={`${className} cursor-text rounded-md outline-none ring-offset-4 ring-offset-transparent transition-shadow hover:ring-2 hover:ring-[#9B7BFF]/50 focus:ring-2 focus:ring-[#9B7BFF]`}
      style={style}
    >
      {value}
    </Tag>
  );
}