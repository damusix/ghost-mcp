#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { useGhostApiSchema, handleUseGhostApi } from './tools/use-ghost-api.js';
import { ghostApiHelpSchema, handleGhostApiHelp } from './tools/ghost-api-help.js';
import { ghostDocsSchema, handleGhostDocs } from './tools/ghost-docs.js';

const GHOST_API_MODE = process.env.GHOST_API_MODE || 'admin';

const server = new McpServer({
    name: 'ghost-mcp',
    version: '0.1.0',
});

server.tool(
    'use_ghost_api',
    'Execute a Ghost API action (browse, read, add, edit, delete posts, pages, tags, members, newsletters, and more)',
    useGhostApiSchema.shape,
    async ({ api, action, payload }) => {
        const result = await handleUseGhostApi({ api, action, payload }, GHOST_API_MODE);
        return { content: [{ type: 'text' as const, text: result }] };
    },
);

server.tool(
    'ghost_api_help',
    'Get help on available Ghost API actions — list all actions or get detailed schema info for a specific action',
    ghostApiHelpSchema.shape,
    async ({ action, api }) => {
        const result = handleGhostApiHelp({ action, api });
        return { content: [{ type: 'text' as const, text: result }] };
    },
);

server.tool(
    'ghost_docs',
    'Search Ghost CMS documentation — fetch full docs, search by text, or match with regex',
    ghostDocsSchema.shape,
    async ({ all, search, regex }) => {
        const result = await handleGhostDocs({ all, search, regex });
        return { content: [{ type: 'text' as const, text: result }] };
    },
);

async function main(): Promise<void> {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
