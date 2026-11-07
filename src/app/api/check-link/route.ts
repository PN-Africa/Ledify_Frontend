import { NextResponse } from "next/server";

const TIMEOUT_MS = 8000; // give up if the site takes longer than 8 seconds

// Safety: don't let anyone use our server to reach private/internal addresses
function isPrivateHost(hostname: string) {
  const h = hostname.toLowerCase();
  return (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local") ||
    h === "0.0.0.0" ||
    h.startsWith("[") || // IPv6 addresses like [::1]
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    /^169\.254\./.test(h)
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const raw = typeof body?.url === "string" ? body.url : "";

  // 1. Is it a proper web address?
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid" });
  }

  if (!["http:", "https:"].includes(url.protocol) || isPrivateHost(url.hostname)) {
    return NextResponse.json({ ok: false, reason: "invalid" });
  }

  // 2. Visit the page and look at the answer
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LedifyLinkCheck/1.0)",
        Accept: "text/html,*/*",
      },
    });

    await res.body?.cancel(); // we only need the status, not the whole page

    if (res.ok) {
      return NextResponse.json({ ok: true, status: res.status });
    }
    return NextResponse.json({ ok: false, reason: "status", status: res.status });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json({ ok: false, reason: timedOut ? "timeout" : "unreachable" });
  }
}