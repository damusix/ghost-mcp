import { z } from "zod";
import type { ActionDefinition } from "../registry.js";

const browseParams = z.object({
  include: z.string().optional().describe('Related data to include (e.g. "count.posts")'),
  filter: z.string().optional().describe("NQL filter expression"),
  limit: z
    .union([z.number(), z.literal("all")])
    .optional()
    .describe("Number of results per page"),
  page: z.number().optional().describe("Page number"),
  order: z.string().optional().describe("Sort order"),
  fields: z.string().optional().describe("Comma-separated list of fields to return"),
});

const readParams = z.object({
  id: z.string().describe("Tag ID"),
  include: z.string().optional().describe("Related data to include"),
});

const readBySlugParams = z.object({
  slug: z.string().describe("Tag slug"),
  include: z.string().optional().describe("Related data to include"),
});

export const contentTagActions: ActionDefinition[] = [
  {
    name: "tags.browse",
    api: "content",
    method: "GET",
    path: "/tags/",
    inputSchema: browseParams,
    description: "Browse all tags (Content API — read-only)",
    example: { include: "count.posts", limit: "all" },
  },
  {
    name: "tags.read",
    api: "content",
    method: "GET",
    path: "/tags/{id}/",
    inputSchema: readParams,
    description: "Read a tag by ID (Content API)",
  },
  {
    name: "tags.read_by_slug",
    api: "content",
    method: "GET",
    path: "/tags/slug/{slug}/",
    inputSchema: readBySlugParams,
    description: "Read a tag by slug (Content API)",
  },
];
