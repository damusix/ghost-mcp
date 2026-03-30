import { z } from "zod";
import type { ActionDefinition } from "../registry.js";

const browseParams = z.object({
  include: z.string().optional().describe('Related data to include (e.g. "newsletters,labels")'),
  filter: z.string().optional().describe('NQL filter expression (e.g. "status:paid")'),
  limit: z
    .union([z.number(), z.literal("all")])
    .optional()
    .describe("Number of results per page"),
  page: z.number().optional().describe("Page number"),
  order: z.string().optional().describe("Sort order"),
});

const readParams = z.object({
  id: z.string().describe("Member ID"),
  include: z.string().optional().describe("Related data to include"),
});

const memberWriteFields = {
  email: z.string().describe("Member email address"),
  name: z.string().optional().describe("Member name"),
  note: z.string().optional().describe("Private note about the member"),
  labels: z
    .array(z.union([z.object({ id: z.string() }), z.object({ name: z.string() })]))
    .optional()
    .describe("Labels to assign"),
  newsletters: z
    .array(z.object({ id: z.string() }))
    .optional()
    .describe("Newsletters to subscribe the member to"),
  comped: z.boolean().optional().describe("Whether the member has a complimentary subscription"),
};

const addSchema = z.object({
  ...memberWriteFields,
  email: z.string().describe("Member email address (required)"),
});

const editSchema = z.object({
  id: z.string().describe("Member ID (required)"),
  ...memberWriteFields,
  email: z.string().optional().describe("Member email address"),
});

export const adminMemberActions: ActionDefinition[] = [
  {
    name: "members.browse",
    api: "admin",
    method: "GET",
    path: "/members/",
    inputSchema: browseParams,
    description: "Browse all members with filtering and pagination",
    example: { filter: "status:paid", include: "newsletters", limit: 20 },
  },
  {
    name: "members.read",
    api: "admin",
    method: "GET",
    path: "/members/{id}/",
    inputSchema: readParams,
    description: "Read a single member by ID",
  },
  {
    name: "members.add",
    api: "admin",
    method: "POST",
    path: "/members/",
    inputSchema: addSchema,
    description: "Create a new member",
    example: { email: "member@example.com", name: "New Member", labels: [{ name: "VIP" }] },
  },
  {
    name: "members.edit",
    api: "admin",
    method: "PUT",
    path: "/members/{id}/",
    inputSchema: editSchema,
    description: "Update an existing member",
  },
];
