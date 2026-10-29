
import type { Draft, OutputFormat } from "./draftStore";

// Set to true to test the error screen without hitting the real backend
const SIMULATE_ERROR = false;

// Set to true to test the loading screen without hitting the real backend
const SIMULATE_LOADING = false;

const FAKE_DURATION = 5000; // ms

export type GeneratedSlide = {
  number: number;
  title: string;
  imageUrl: string;
};

export type GenerateResult = {
  id: string;
  format: OutputFormat;
  title?: string;
  previewUrl?: string;
  siteUrl?: string;
  downloadUrl?: string;
  slides?: GeneratedSlide[];
};
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function generateContent(
  draft: Draft,
  signal?: AbortSignal
): Promise<GenerateResult> {
  if (!API_URL) {
    throw new Error(
      "Backend URL is missing. Please check your .env.local file."
    );
  }

  if (SIMULATE_LOADING) {
    await new Promise((resolve) =>
      setTimeout(resolve, FAKE_DURATION)
    );
  }

  if (SIMULATE_ERROR) {
    throw new Error(
      "Simulated error for testing the error screen."
    );
  }

  // The backend expects outputType.
  const outputType = draft.format ?? "presentation";

  let response: Response;

  // 1. Generate content from an uploaded file
  if (draft.files.length > 0) {
    const formData = new FormData();

    formData.append("file", draft.files[0]);
    formData.append("outputType", outputType);

    if (draft.prompt?.trim()) {
      formData.append("prompt", draft.prompt.trim());
    }

    if (draft.options?.slideCount) {
      formData.append(
        "slideCount",
        String(draft.options.slideCount)
      );
    }

    response = await fetch(`${API_URL}/api/generate/file`, {
      method: "POST",
      body: formData,
      signal,
    });
  }

  // 2. Generate content from a website URL
  else if (draft.link.length > 0) {
    response = await fetch(
      `${API_URL}/api/generate/urlPrompt`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urlPrompt: draft.link[0],
          prompt: draft.prompt?.trim(),
          outputType,
          slideCount: draft.options?.slideCount,
        }),
        signal,
      }
    );
  }

  // 3. Generate content from a text prompt
  else {
    const payload = {
      textPrompt: draft.prompt?.trim(),
      outputType,
      slideCount: draft.options?.slideCount,
    };

    console.log("Text generation payload:", payload);

    response = await fetch(
      `${API_URL}/api/generate/textPrompt`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal,
      }
    );
  }

  // Read the backend response
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const details = [
      data?.errorCode,
      data?.stage,
    ]
      .filter(Boolean)
      .join(" at ");

    throw new Error(
      (data?.message ||
        `Generation failed with status ${response.status}`) +
        (details ? ` (${details})` : "")
    );
  }

  // Extract the generated result
  const result = data?.data?.result;
  const preview = result?.preview;
  const artifacts = result?.artifacts;

console.log("DOC:", JSON.stringify(artifacts, null, 2));
  // The backend returns previewId inside preview.
  // Keep artifacts.id as a fallback for compatibility.
  const previewId =
    preview?.previewId ?? artifacts?.id;

  if (!previewId) {
    console.error("Unexpected backend response:", data);

    throw new Error(
      "Generation completed, but the backend did not return a preview ID."
    );
  }

  // Convert backend paths to full URLs
  const fullUrl = (path?: string) => {
    if (!path) return undefined;

    // Leave absolute URLs unchanged
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return `${API_URL!.replace(/\/$/, "")}/${path.replace(
      /^\//,
      ""
    )}`;
  };

    return {
    id: String(previewId),
    format: outputType,
    title: preview?.title,
    previewUrl: fullUrl(preview?.previewUrl ?? artifacts?.previewUrl),
    siteUrl: fullUrl(preview?.siteUrl ?? artifacts?.siteUrl),
    downloadUrl: fullUrl(preview?.downloads?.pptx ?? artifacts?.downloadUrl),
    slides: preview?.slides?.map(
      (s: { slideNumber: number; title: string; url: string }) => ({
        number: s.slideNumber,
        title: s.title,
        imageUrl: s.url, // "/api/presentations/..." loads through our proxy
      })
    ),
  };
}
