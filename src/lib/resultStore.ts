import type { Presentation } from "@/lib/presentation";
import type { WebPage } from "@/lib/webpage";
import type { DocumentData } from "@/lib/document";

export type GenerationResult =
  | { format: "presentation"; presentation: Presentation }
  | { format: "webpage"; webpage: WebPage }
  | { format: "document"; document: DocumentData };

let result: GenerationResult | null = null;

export function setResult(next: GenerationResult) {
  result = next;
}

export function getResult() {
  return result;
}