import { z } from "zod";
import type { ActionDefinition } from "../registry.js";

const browseParams = z.object({
  include: z
    .string()
    .optional()
    .describe('Comma-separated list of related data (e.g. "authors,tags")'),
  formats: z.string().optional().describe('Content formats: "html", "plaintext" (comma-separated)'),
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
  id: z.string().describe("Page ID"),
  include: z.string().optional().describe("Related data to include"),
  formats: z.string().optional().describe("Content formats to return"),
});

const readBySlugParams = z.object({
  slug: z.string().describe("Page slug"),
  include: z.string().optional().describe("Related data to include"),
  formats: z.string().optional().describe("Content formats to return"),
});

export const contentPageActions: ActionDefinition[] = [
  {
    name: "pages.browse",
    api: "content",
    method: "GET",
    path: "/pages/",
    inputSchema: browseParams,
    description: "Browse published pages (Content API — read-only)",
  },
  {
    name: "pages.read",
    api: "content",
    method: "GET",
    path: "/pages/{id}/",
    inputSchema: readParams,
    description: "Read a published page by ID (Content API)",
  },
  {
    name: "pages.read_by_slug",
    api: "content",
    method: "GET",
    path: "/pages/slug/{slug}/",
    inputSchema: readBySlugParams,
    description: "Read a published page by slug (Content API)",
  },
];
