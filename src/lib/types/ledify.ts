// Shared types for Ledify's input and generated output.
// These describe the shape of data moving between the Create page,
// the API layer, and the Preview page. Once Francis's backend is
// ready, its responses should match OutputResult below.

export type InputMethod = "prompt" | "file" | "url";

export type OutputFormat = "presentation" | "webpage" | "document";

export interface GenerateRequest {
  inputMethod: InputMethod;
  // Exactly one of these is set, matching inputMethod.
  prompt?: string;
  file?: File;
  url?: string;
  format: OutputFormat;
}

// --- Output shapes (one per format) ---
// These are placeholders until the backend's real response shape is agreed.

export interface Slide {
  heading: string;
  bullets: string[];
}

export interface PresentationOutput {
  type: "presentation";
  title: string;
  slides: Slide[];
}

export interface DocumentSection {
  heading: string;
  body: string;
}

export interface DocumentOutput {
  type: "document";
  title: string;
  sections: DocumentSection[];
}

export interface WebpageBlock {
  kind: "heading" | "paragraph" | "list";
  content: string | string[];
}

export interface WebpageOutput {
  type: "webpage";
  title: string;
  blocks: WebpageBlock[];
}

export type OutputResult = PresentationOutput | DocumentOutput | WebpageOutput;

export interface GenerateResponse {
  id: string;
  result: OutputResult;
}