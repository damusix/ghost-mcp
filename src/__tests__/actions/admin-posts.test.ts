import { describe, it, expect } from "vitest";
import { getAction } from "../../actions/registry.js";

describe("Admin Post Action Schemas", () => {
  describe("posts.add", () => {
    const action = getAction("posts.add", "admin")!;

    it("is registered", () => {
      expect(action).toBeDefined();
      expect(action.method).toBe("POST");
    });

    it("requires title", () => {
      const result = action.inputSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("accepts valid payload with title", () => {
      const result = action.inputSchema.safeParse({ title: "Test Post" });
      expect(result.success).toBe(true);
    });

    it("accepts all optional fields", () => {
      const result = action.inputSchema.safeParse({
        title: "Test Post",
        status: "draft",
        lexical: "{}",
        tags: [{ name: "Test" }],
        authors: [{ id: "123" }],
        featured: true,
        visibility: "public",
        custom_excerpt: "excerpt",
        meta_title: "SEO Title",
        meta_description: "SEO Desc",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid status value", () => {
      const result = action.inputSchema.safeParse({
        title: "Test",
        status: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("posts.edit", () => {
    const action = getAction("posts.edit", "admin")!;

    it("is registered", () => {
      expect(action).toBeDefined();
      expect(action.method).toBe("PUT");
    });

    it("requires id and updated_at", () => {
      const result = action.inputSchema.safeParse({});
      expect(result.success).toBe(false);

      const result2 = action.inputSchema.safeParse({ id: "123" });
      expect(result2.success).toBe(false);
    });

    it("accepts id and updated_at", () => {
      const result = action.inputSchema.safeParse({
        id: "123",
        updated_at: "2024-01-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("title is optional for edit", () => {
      const result = action.inputSchema.safeParse({
        id: "123",
        updated_at: "2024-01-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("posts.browse", () => {
    const action = getAction("posts.browse", "admin")!;

    it("is registered as GET", () => {
      expect(action).toBeDefined();
      expect(action.method).toBe("GET");
    });

    it("accepts all query params", () => {
      const result = action.inputSchema.safeParse({
        include: "authors,tags",
        filter: "status:published",
        limit: 10,
        page: 1,
        order: "published_at DESC",
        formats: "html,lexical",
        fields: "title,slug",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty payload", () => {
      const result = action.inputSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("accepts limit as 'all'", () => {
      const result = action.inputSchema.safeParse({ limit: "all" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid limit type", () => {
      const result = action.inputSchema.safeParse({ limit: "invalid" });
      expect(result.success).toBe(false);
    });
  });

  describe("posts.delete", () => {
    const action = getAction("posts.delete", "admin")!;

    it("requires id", () => {
      const fail = action.inputSchema.safeParse({});
      expect(fail.success).toBe(false);

      const pass = action.inputSchema.safeParse({ id: "abc123" });
      expect(pass.success).toBe(true);
    });
  });

  describe("posts.copy", () => {
    const action = getAction("posts.copy", "admin")!;

    it("requires id", () => {
      const fail = action.inputSchema.safeParse({});
      expect(fail.success).toBe(false);

      const pass = action.inputSchema.safeParse({ id: "abc123" });
      expect(pass.success).toBe(true);
    });
  });
});
