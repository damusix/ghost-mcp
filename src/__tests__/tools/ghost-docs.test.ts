import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleGhostDocs, clearCache } from "../../tools/ghost-docs.js";

const MOCK_DOCS = `# Ghost Documentation
This is the Ghost CMS documentation.
## Posts API
Create and manage posts.
## Members API
Manage your members and subscriptions.
## Webhooks
Listen for events in Ghost.
`;

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("ghost-docs handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => MOCK_DOCS,
    });
  });

  it("returns usage hint when no params provided", async () => {
    const result = await handleGhostDocs({});
    expect(result).toContain("Provide one of");
  });

  it("returns full content with all: true", async () => {
    const result = await handleGhostDocs({ all: true });
    expect(result).toBe(MOCK_DOCS);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("filters lines case-insensitively with search", async () => {
    const result = await handleGhostDocs({ search: "posts api" });
    expect(result).toContain("Posts API");
  });

  it("returns no matches message when search finds nothing", async () => {
    const result = await handleGhostDocs({ search: "xyznonexistent" });
    expect(result).toBe("No matches found.");
  });

  it("applies regex pattern matching", async () => {
    const result = await handleGhostDocs({ regex: "/members/i" });
    expect(result).toContain("Members API");
  });

  it("supports regex without delimiter syntax", async () => {
    const result = await handleGhostDocs({ regex: "Webhook" });
    expect(result).toContain("Webhooks");
  });

  it("caches docs and does not re-fetch within TTL", async () => {
    await handleGhostDocs({ all: true });
    await handleGhostDocs({ all: true });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("re-fetches after cache is cleared", async () => {
    await handleGhostDocs({ all: true });
    clearCache();
    await handleGhostDocs({ all: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("handles fetch errors gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    const result = await handleGhostDocs({ all: true });
    expect(result).toContain("Error");
  });
});
