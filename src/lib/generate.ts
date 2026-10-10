import type { Draft } from "./draftStore";

// Set to true to test the error screen
const SIMULATE_ERROR = false;
const FAKE_DURATION = 5000; // ms

export type GenerateResult = {
  id: string;
};
// body.append("slideCount", String(draft.options?.slideCount ?? ""));


export async function generateContent(draft: Draft): Promise<GenerateResult> {
  // TODO: replace this whole function with the real API call, for example:
  // const body = new FormData();
  // body.append("prompt", draft.prompt);
  // body.append("format", draft.format ?? "");
  // draft.files.forEach((file) => body.append("files", file));
  // draft.links.forEach((link) => body.append("links", link));
  // const res = await fetch("/api/generate", { method: "POST", body });
  // if (!res.ok) throw new Error("Generation failed");
  // return res.json();

  void draft; // stops the "unused variable" warning until the real call is added
  await new Promise((resolve) => setTimeout(resolve, FAKE_DURATION));

  if (SIMULATE_ERROR) throw new Error("Generation failed");
  return { id: crypto.randomUUID() };
}