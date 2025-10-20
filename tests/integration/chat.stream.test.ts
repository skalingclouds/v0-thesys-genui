import { describe, it, expect } from "vitest";

const BASE_URL = process.env.VERCEL_AI_BASE_URL || "http://localhost:3000";

function skipIfMissingEnv() {
  if (!process.env.THESYS_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn("Skipping vercel-ai-sdk: THESYS_API_KEY not set.");
    return true;
  }
  return false;
}

describe("vercel-ai-sdk /api/chat stream", () => {
  it("streams UI message response", async () => {
    if (skipIfMissingEnv()) return;

    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "user", content: "Say ok" },
        ],
      }),
    });

    expect(res.status).toBe(200);

    const reader = res.body?.getReader();
    if (!reader) throw new Error("Missing response body reader");

    let received = 0;
    for (let i = 0; i < 8; i++) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value && value.length > 0) {
        received += value.length;
        if (received > 0) break;
      }
    }

    await reader.cancel();
    expect(received).toBeGreaterThan(0);
  }, 60_000);
});
