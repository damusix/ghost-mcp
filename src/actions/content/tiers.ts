import { z } from "zod";
import type { ActionDefinition } from "../registry.js";

const browseParams = z.object({
  include: z
    .string()
    .optional()
    .describe('Related data to include (e.g. "monthly_price,yearly_price,benefits")'),
  filter: z
    .string()
    .optional()
    .describe('NQL filter expression (e.g. "type:paid+active:true+visibility:public")'),
  limit: z
    .union([z.number(), z.literal("all")])
    .optional()
    .describe("Number of results per page"),
  page: z.number().optional().describe("Page number"),
});

export const contentTierActions: ActionDefinition[] = [
  {
    name: "tiers.browse",
    api: "content",
    method: "GET",
    path: "/tiers/",
    inputSchema: browseParams,
    description: "Browse all tiers (Content API — read-only)",
    example: { include: "monthly_price,yearly_price,benefits" },
  },
];
