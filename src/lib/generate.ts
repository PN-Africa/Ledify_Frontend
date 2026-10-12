import type { Draft } from "./draftStore";

// Set to true to test the error screen
const SIMULATE_ERROR = false;
const FAKE_DURATION = 5000; // ms

export type GenerateResult = {
  id: string;
};

export async function generateContent(draft: Draft): Promise<GenerateResult> {
 

  void draft; // stops the "unused variable" warning until the real call is added
  await new Promise((resolve) => setTimeout(resolve, FAKE_DURATION));

  if (SIMULATE_ERROR) throw new Error("Generation failed");
  return { id: crypto.randomUUID() };
}