import { z } from 'zod';
import { compose, ComposeError } from '../koenig/index.js';

export const composeLexicalSchema = z.object({
    blocks: z
        .array(z.object({ type: z.string() }).passthrough())
        .describe(
            'Ordered content blocks (same shape as compose_post). Returns the Lexical JSON string without creating a post.',
        ),
});

export type ComposeLexicalInput = z.infer<typeof composeLexicalSchema>;

export function handleComposeLexical(input: ComposeLexicalInput): string {
    try {
        const lexical = compose(input.blocks);
        return JSON.stringify({ lexical });
    } catch (err) {
        if (err instanceof ComposeError) {
            return JSON.stringify({ error: 'composition failed', issues: err.issues });
        }
        throw err;
    }
}
