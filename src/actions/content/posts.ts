import { z } from "zod";
import type { ActionDefinition } from "../registry.js";

const browseParams = z.object({
  include: z
    .string()
    .optional()
    .describe('Comma-separated list of related data (e.g. "authors,tags")'),
  formats: z.string().optional().describe('Content formats: "html", "plaintext" (comma-separated)'),
  filter: z.string().optional().describe('NQL filter expression (e.g. "tag:news+featured:true")'),
  limit: z
    .union([z.number(), z.literal("all")])
    .optional()
    .describe('Number of results per page (default: 15, max: 100, or "all")'),
  page: z.number().optional().describe("Page number for pagination"),
  order: z.string().optional().describe('Sort order (e.g. "published_at DESC")'),
  fields: z.string().optional().describe("Comma-separated list of fields to return"),
});

const readParams = z.object({
  id: z.string().describe("Post ID"),
  include: z.string().optional().describe("Related data to include"),
  formats: z.string().optional().describe("Content formats to return"),
});

const readBySlugParams = z.object({
  slug: z.string().describe("Post slug"),
  include: z.string().optional().describe("Related data to include"),
  formats: z.string().optional().describe("Content formats to return"),
});

export const contentPostActions: ActionDefinition[] = [
  {
    name: "posts.browse",
    api: "content",
    method: "GET",
    path: "/posts/",
    inputSchema: browseParams,
    description: "Browse published posts (Content API — read-only)",
    example: { filter: "tag:news", include: "authors,tags", limit: 10 },
  },
  {
    name: "posts.read",
    api: "content",
    method: "GET",
    path: "/posts/{id}/",
    inputSchema: readParams,
    description: "Read a published post by ID (Content API)",
  },
  {
    name: "posts.read_by_slug",
    api: "content",
    method: "GET",
    path: "/posts/slug/{slug}/",
    inputSchema: readBySlugParams,
    description: "Read a published post by slug (Content API)",
  },
];
