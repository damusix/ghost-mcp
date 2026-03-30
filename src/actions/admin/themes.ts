import { z } from "zod";
import type { ActionDefinition } from "../registry.js";

const uploadSchema = z.object({
  file: z.string().describe("URL to a theme ZIP file to download and upload"),
});

const activateSchema = z.object({
  name: z.string().describe("Theme name to activate"),
});

export const adminThemeActions: ActionDefinition[] = [
  {
    name: "themes.upload",
    api: "admin",
    method: "POST",
    path: "/themes/upload/",
    inputSchema: uploadSchema,
    description: "Upload a theme ZIP file to Ghost. Provide a URL to the ZIP file.",
    example: { file: "https://example.com/theme.zip" },
  },
  {
    name: "themes.activate",
    api: "admin",
    method: "PUT",
    path: "/themes/{name}/activate/",
    inputSchema: activateSchema,
    description: "Activate an installed theme by name",
    example: { name: "casper" },
  },
];
