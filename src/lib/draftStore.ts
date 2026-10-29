export type OutputFormat = "presentation" | "webpage" | "document";
// Extra settings per format. More can be added later (tone, length, ...)

export type DocumentFormat = "docx" | "pdf";
export type DraftOptions = {
  slideCount?: number;        // presentations only
  documentFormat?: DocumentFormat; // documents only
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