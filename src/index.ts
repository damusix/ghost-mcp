#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { useGhostApiSchema, handleUseGhostApi } from './tools/use-ghost-api.js';
import { ghostApiHelpSchema, handleGhostApiHelp } from './tools/ghost-api-help.js';
import { ghostDocsSchema, handleGhostDocs } from './tools/ghost-docs.js';
import { composePostSchema, handleComposePost } from './tools/compose-post.js';
import { composeLexicalSchema, handleComposeLexical } from './tools/compose-lexical.js';
import { koenigHelpSchema, handleKoenigHelp } from './tools/koenig-help.js';
import { blockHelp } from './koenig/index.js';

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

server.tool(
    'compose_post',
    'Create or update a Ghost post from structured Koenig content blocks (paragraphs, headings, lists, callouts, images, buttons, etc.). PREFER THIS over use_ghost_api with raw html/lexical — it produces clean, natively-editable posts. Pass blocks inline for short posts, or write them to a JSON file and pass `blockFile` (absolute path) for long posts. Omit `id` to create, set `id`+`updated_at` to update. Call koenig_help to discover block types and fields.',
    composePostSchema.shape,
    async (input) => {
        const result = await handleComposePost(input, GHOST_API_MODE);
        return { content: [{ type: 'text' as const, text: result }] };
    },
);

server.tool(
    'compose_lexical',
    'Compile Koenig content blocks into a Lexical JSON string without creating a post (for preview/inspection). Same block shape as compose_post.',
    composeLexicalSchema.shape,
    async (input) => {
        const result = handleComposeLexical(input);
        return { content: [{ type: 'text' as const, text: result }] };
    },
);

server.tool(
    'koenig_help',
    'List Koenig content block types, or get the fields and a JSON example for one block. Use before compose_post to build clean, editable posts instead of raw HTML.',
    koenigHelpSchema.shape,
    async ({ block }) => {
        const result = handleKoenigHelp({ block });
        return { content: [{ type: 'text' as const, text: result }] };
    },
);

server.registerPrompt(
    'compose_ghost_post',
    {
        description:
            'Guidance for composing clean, editable Ghost posts from Koenig blocks instead of raw HTML.',
    },
    () => ({
        messages: [
            {
                role: 'assistant' as const,
                content: {
                    type: 'text' as const,
                    text: [
                        'When writing Ghost post content, do NOT push raw HTML into the API. Compose the post from structured Koenig blocks via the `compose_post` tool — this yields clean, natively-editable posts.',
                        'Workflow: (1) call `koenig_help` to see block types; (2) build a `blocks` array — prose as paragraph/heading/list/quote blocks (their `text` supports inline **bold**, _italic_, `code`, [links](url)), and rich features as cards (callout, image, button, bookmark, embed, codeblock, toggle, gallery, etc.); (3) call `compose_post`. Use the `html` block ONLY when no native block fits.',
                        'For a short post, pass `blocks` inline. For a long post, write the blocks JSON to an absolute path (e.g. under tmp/), optionally validate it with `compose_lexical` (`blockFile`), then call `compose_post` with `blockFile` — this avoids re-sending the whole array on each edit.',
                        blockHelp(),
                    ].join('\n\n'),
                },
            },
        ],
    }),
);

async function main(): Promise<void> {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
