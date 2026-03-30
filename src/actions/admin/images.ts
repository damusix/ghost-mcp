import { z } from "zod";
import type { ActionDefinition } from "../registry.js";

const uploadSchema = z.object({
  file: z.string().describe("Image URL to download and upload, or base64-encoded image data"),
  ref: z.string().optional().describe("Optional reference name for the uploaded image"),
});

export const adminImageActions: ActionDefinition[] = [
  {
    name: "images.upload",
    api: "admin",
    method: "POST",
    path: "/images/upload/",
    inputSchema: uploadSchema,
    description:
      "Upload an image to Ghost. Provide a URL (which will be downloaded) or base64-encoded image data.",
    example: { file: "https://example.com/photo.jpg", ref: "hero-image" },
  },
];
