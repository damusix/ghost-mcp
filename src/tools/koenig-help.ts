import { z } from 'zod';
import { blockHelp } from '../koenig/index.js';

export const koenigHelpSchema = z.object({
    block: z
        .string()
        .optional()
        .describe(
            'A block type (e.g. "callout", "image") for its fields + a JSON example. Omit to list all block types.',
        ),
});

export type KoenigHelpInput = z.infer<typeof koenigHelpSchema>;

export function handleKoenigHelp(input: KoenigHelpInput): string {
    return blockHelp(input.block);
}
