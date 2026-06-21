import { z } from 'zod';
import { compose, ComposeError } from '../koenig/index.js';
import { handleUseGhostApi } from './use-ghost-api.js';
import { resolveBlocks } from './blocks-source.js';

const blockSchema = z
    .object({
        type: z
            .string()
            .describe(
                'Block type: paragraph, heading, list, quote, aside, image, gallery, video, audio, file, bookmark, embed, html, markdown, codeblock, callout, toggle, button, header, cta, signup, product, divider, paywall, email, email-cta. Run koenig_help for fields.',
            ),
    })
    .passthrough();

const composeFields = {
    blocks: z
        .array(blockSchema)
        .optional()
        .describe(
            'Ordered content blocks (inline). Prefer native blocks (paragraph/heading/list/quote) and cards over raw html. Prose `text` supports inline **bold**, _italic_, `code`, [links](url). Use koenig_help to discover block fields. For long posts, write the blocks to a JSON file and pass `blockFile` instead.',
        ),
    blockFile: z
        .string()
        .optional()
        .describe(
            'Absolute path to a local JSON file containing the blocks — either a bare array `[...]` or `{ "blocks": [...] }`. Use this for long posts: compose/edit the file (validating with compose_lexical), then pass the path instead of re-sending the whole array. Provide exactly one of `blocks` or `blockFile`. Writing to an absolute path under tmp/ is recommended.',
        ),
    title: z.string().optional().describe('Post title (required when creating a new post)'),
    id: z.string().optional().describe('Post ID to update. Omit to create a new post.'),
    updated_at: z
        .string()
        .optional()
        .describe(
            "Required when updating (id set): the post's current updated_at, for collision detection. Get it via posts.read.",
        ),
    status: z
        .enum(['published', 'draft', 'scheduled'])
        .optional()
        .describe('Post status (default draft)'),
    tags: z
        .array(z.union([z.object({ id: z.string() }), z.object({ name: z.string() })]))
        .optional()
        .describe('Tags to assign (by id or name)'),
    feature_image: z.string().optional().describe('Feature image URL'),
    excerpt: z.string().optional().describe('Custom excerpt (maps to custom_excerpt)'),
    slug: z.string().optional().describe('Custom URL slug'),
    visibility: z.string().optional().describe('public, members, paid, or tiers'),
};

export const composePostSchema = z.object(composeFields);

export type ComposePostInput = z.infer<typeof composePostSchema>;

export async function handleComposePost(input: ComposePostInput, mode: string): Promise<string> {
    let lexical: string;
    try {
        const blocks = resolveBlocks({ blocks: input.blocks, blockFile: input.blockFile });
        lexical = compose(blocks);
    } catch (error) {
        if (error instanceof ComposeError) {
            return JSON.stringify({ error: 'composition failed', issues: error.issues });
        }
        return JSON.stringify({
            error: 'invalid blocks input',
            message: error instanceof Error ? error.message : String(error),
        });
    }

    const { blocks: _blocks, blockFile: _blockFile, id, excerpt, ...rest } = input;
    const payload: Record<string, unknown> = { ...rest, lexical };
    if (excerpt !== undefined) {
        payload.custom_excerpt = excerpt;
    }

    if (id) {
        return handleUseGhostApi(
            { api: 'admin', action: 'posts.edit', payload: { id, ...payload } },
            mode,
        );
    }
    return handleUseGhostApi({ api: 'admin', action: 'posts.add', payload }, mode);
}
