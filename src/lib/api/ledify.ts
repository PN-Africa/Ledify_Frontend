const API_URL = process.env.NEXT_PUBLIC_API_URL;

// A simple helper for handling JSON responses
async function handleResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong. Please try again."
    );
  }

  return data;
}

// Generating content now happens in generate.ts via generateContent(draft) —
// these three are the old per-input-type functions it replaced.

// 1. Get a specific slide from a presentation
export async function getSlide(
  previewId: string,
  slideNumber: number
) {
  const response = await fetch(
    `${API_URL}/api/presentations/${previewId}/slides/${slideNumber}`
  );

  return handleResponse(response);
}

// 2. Download a presentation
export async function downloadPresentation(previewId: string) {
  const response = await fetch(
    `${API_URL}/api/presentations/${previewId}/download`
  );

  if (!response.ok) {
    throw new Error("Failed to download presentation.");
  }

  // Read the response as a downloadable file
  const file = await response.blob();

  // Create a temporary download link
  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = "ledify-presentation.pptx";
  link.click();

  URL.revokeObjectURL(downloadUrl);
}