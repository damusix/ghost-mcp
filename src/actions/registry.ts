import { z } from "zod";

// Admin actions
import { adminPostActions } from "./admin/posts.js";
import { adminPageActions } from "./admin/pages.js";
import { adminTagActions } from "./admin/tags.js";
import { adminTierActions } from "./admin/tiers.js";
import { adminNewsletterActions } from "./admin/newsletters.js";
import { adminOfferActions } from "./admin/offers.js";
import { adminMemberActions } from "./admin/members.js";
import { adminUserActions } from "./admin/users.js";
import { adminImageActions } from "./admin/images.js";
import { adminThemeActions } from "./admin/themes.js";
import { adminWebhookActions } from "./admin/webhooks.js";
import { adminSiteActions } from "./admin/site.js";

// Content actions
import { contentPostActions } from "./content/posts.js";
import { contentPageActions } from "./content/pages.js";
import { contentTagActions } from "./content/tags.js";
import { contentAuthorActions } from "./content/authors.js";
import { contentTierActions } from "./content/tiers.js";
import { contentSettingsActions } from "./content/settings.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type ApiType = "admin" | "content";

export interface ActionDefinition {
  name: string;
  api: ApiType;
  method: HttpMethod;
  path: string;
  inputSchema: z.ZodType;
  description: string;
  example?: Record<string, unknown>;
}

const registry = new Map<string, ActionDefinition>();

export function registerAction(action: ActionDefinition): void {
  registry.set(`${action.api}:${action.name}`, action);
}

export function registerActions(actions: ActionDefinition[]): void {
  for (const action of actions) {
    registerAction(action);
  }
}

export function getAction(name: string, api?: ApiType): ActionDefinition | undefined {
  if (api) {
    return registry.get(`${api}:${name}`);
  }
  // Try admin first, then content
  return registry.get(`admin:${name}`) || registry.get(`content:${name}`);
}

export function listActions(api?: ApiType): ActionDefinition[] {
  const actions = Array.from(registry.values());
  if (api) {
    return actions.filter((a) => a.api === api);
  }
  return actions;
}

export function getActionHelp(name: string, api?: ApiType): string | undefined {
  const action = getAction(name, api);
  if (!action) return undefined;

  const schema = action.inputSchema;
  const lines: string[] = [
    `## ${action.name}`,
    "",
    action.description,
    "",
    `- **API:** ${action.api}`,
    `- **Method:** ${action.method}`,
    `- **Path:** ${action.path}`,
    "",
  ];

  // Extract schema info
  if (schema instanceof z.ZodObject) {
    lines.push("### Parameters", "");
    const shape = schema.shape as Record<string, z.ZodType>;
    for (const [key, field] of Object.entries(shape)) {
      const isOptional = field.isOptional();
      const desc = field.description || "";
      lines.push(`- **${key}**${isOptional ? " (optional)" : " (required)"}: ${desc}`);
    }
    lines.push("");
  }

  if (action.example) {
    lines.push(
      "### Example Payload",
      "",
      "```json",
      JSON.stringify(action.example, null, 2),
      "```",
      "",
    );
  }

  return lines.join("\n");
}

// Register all actions
function initRegistry(): void {
  const allActions = [
    ...adminPostActions,
    ...adminPageActions,
    ...adminTagActions,
    ...adminTierActions,
    ...adminNewsletterActions,
    ...adminOfferActions,
    ...adminMemberActions,
    ...adminUserActions,
    ...adminImageActions,
    ...adminThemeActions,
    ...adminWebhookActions,
    ...adminSiteActions,
    ...contentPostActions,
    ...contentPageActions,
    ...contentTagActions,
    ...contentAuthorActions,
    ...contentTierActions,
    ...contentSettingsActions,
  ];
  registerActions(allActions);
}

initRegistry();
