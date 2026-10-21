import type { Presentation } from "@/lib/presentation";
import type { WebPage } from "@/lib/webpage";
import type { DocumentData } from "@/lib/document";
import type { GenerateResult } from "./generate";
export type GenerationResult =
  | { format: "presentation"; presentation: Presentation }
  | { format: "webpage"; webpage: WebPage }
  | { format: "document"; document: DocumentData };

let result: GenerationResult | null = null;

export function setResult(next: GenerationResult) {
  result = next;
}
const KEY ="ledify-results";

export function saveResult(result: GenerateResult) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    all[result.id] = result;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // storage blocked or full: the result page will show "not found"
  }
}

// Find a saved result by its id
export function getResult(id: string): GenerateResult | null {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return all[id] ?? null;
  } catch {
    return null;
  }
}