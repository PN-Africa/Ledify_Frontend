export type OutputFormat = "presentation" | "webpage" | "document";

// Extra settings per format. More can be added later (tone, length, ...)
export type DraftOptions = {
  slideCount?: number;
};

export type Draft = {
  prompt: string;
  files: File[];
  link: string[];
  format?: OutputFormat;
  options?: DraftOptions;
};

let draft: Draft | null = null;

export function setDraft(next: Draft) {
  draft = next;
}

export function getDraft() {
  return draft;
}

export function clearDraft() {
  draft = null;
}