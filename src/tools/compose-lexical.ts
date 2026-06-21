import { z } from 'zod';
import { compose, ComposeError } from '../koenig/index.js';
import { resolveBlocks } from './blocks-source.js';

export const composeLexicalSchema = z.object({
    blocks: z
        .array(z.object({ type: z.string() }).passthrough())
        .optional()
        .describe('Ordered content blocks (same shape as compose_post), inline.'),
    blockFile: z
        .string()
        .optional()
        .describe(
            'Absolute path to a JSON file of blocks. Use to validate a file you are building before calling compose_post. Provide exactly one of `blocks` or `blockFile`.',
        ),
});

export type ComposeLexicalInput = z.infer<typeof composeLexicalSchema>;

export function handleComposeLexical(input: ComposeLexicalInput): string {
    try {
        const blocks = resolveBlocks({ blocks: input.blocks, blockFile: input.blockFile });
        const lexical = compose(blocks);
        return JSON.stringify({ lexical });
    } catch (err) {
        if (err instanceof ComposeError) {
            return JSON.stringify({ error: 'composition failed', issues: err.issues });
        }
        return JSON.stringify({
            error: 'invalid blocks input',
            message: err instanceof Error ? err.message : String(err),
        });
    }
}
