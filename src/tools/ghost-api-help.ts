import { z } from "zod";
import { listActions, getActionHelp, type ApiType } from "../actions/registry.js";

export const ghostApiHelpSchema = z.object({
  action: z
    .string()
    .optional()
    .describe(
      'Specific action name to get detailed help for (e.g. "posts.add"). Omit to see all available actions.',
    ),
  api: z.enum(["admin", "content"]).optional().describe("Filter actions by API type"),
});

export type GhostApiHelpInput = z.infer<typeof ghostApiHelpSchema>;

export function handleGhostApiHelp(input: GhostApiHelpInput): string {
  const { action, api } = input;

  if (action) {
    const help = getActionHelp(action, api as ApiType | undefined);
    if (!help) {
      return `Unknown action "${action}". Use ghost_api_help without arguments to see all available actions.`;
    }
    return help;
  }

  // List all actions grouped by resource and API
  const actions = listActions(api as ApiType | undefined);
  const grouped: Record<string, Record<string, typeof actions>> = {};

  for (const a of actions) {
    if (!grouped[a.api]) grouped[a.api] = {};
    const resource = a.name.split(".")[0];
    if (!grouped[a.api][resource]) grouped[a.api][resource] = [];
    grouped[a.api][resource].push(a);
  }

  const lines: string[] = ["# Ghost API Actions", ""];

  for (const [apiType, resources] of Object.entries(grouped)) {
    lines.push(`## ${apiType.charAt(0).toUpperCase() + apiType.slice(1)} API`, "");
    for (const [resource, resourceActions] of Object.entries(resources)) {
      lines.push(`### ${resource}`);
      for (const a of resourceActions) {
        lines.push(`- **${a.name}** — ${a.description}`);
      }
      lines.push("");
    }
  }

  lines.push(
    "---",
    "",
    "Use `ghost_api_help` with `action` parameter for detailed schema info on any action.",
  );
  return lines.join("\n");
}
