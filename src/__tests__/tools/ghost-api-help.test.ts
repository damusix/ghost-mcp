import { describe, it, expect } from "vitest";
import { handleGhostApiHelp } from "../../tools/ghost-api-help.js";

describe("ghost-api-help handler", () => {
  it("returns grouped action list when no action specified", () => {
    const result = handleGhostApiHelp({});
    expect(result).toContain("Ghost API Actions");
    expect(result).toContain("Admin API");
    expect(result).toContain("Content API");
    expect(result).toContain("posts.browse");
    expect(result).toContain("posts.add");
  });

  it("filters by admin API", () => {
    const result = handleGhostApiHelp({ api: "admin" });
    expect(result).toContain("Admin API");
    expect(result).not.toContain("Content API");
  });

  it("filters by content API", () => {
    const result = handleGhostApiHelp({ api: "content" });
    expect(result).toContain("Content API");
    expect(result).not.toContain("Admin API");
  });

  it("returns detailed schema info for a specific action", () => {
    const result = handleGhostApiHelp({ action: "posts.add" });
    expect(result).toContain("posts.add");
    expect(result).toContain("title");
    expect(result).toContain("required");
    expect(result).toContain("POST");
    expect(result).toContain("Parameters");
  });

  it("returns helpful error for unknown action", () => {
    const result = handleGhostApiHelp({ action: "nonexistent.action" });
    expect(result).toContain("Unknown action");
    expect(result).toContain("ghost_api_help");
  });

  it("includes descriptions from Zod .describe()", () => {
    const result = handleGhostApiHelp({ action: "posts.browse" });
    expect(result).toContain("filter");
    expect(result).toContain("NQL");
  });

  it("shows example payload when available", () => {
    const result = handleGhostApiHelp({ action: "posts.browse" });
    expect(result).toContain("Example Payload");
  });
});
