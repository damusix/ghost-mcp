import { z } from 'zod';
import { attempt } from '@logosdx/utils';
import { docsApi } from '../ghost-client.js';

export const ghostDocsSchema = z.object({
    all: z.boolean().optional().describe('Return the full Ghost documentation (llms.txt)'),
    search: z
        .string()
        .optional()
        .describe('Case-insensitive substring search across the documentation'),
    regex: z.string().optional().describe('Regex pattern string to match (e.g. "/pattern/i")'),
});

export type GhostDocsInput = z.infer<typeof ghostDocsSchema>;

async function fetchDocs(): Promise<string> {
    const [response, err] = await attempt(async () => docsApi.get('/llms.txt'));
    if (err) {
        throw new Error(`Failed to fetch Ghost docs: ${err.message}`);
    }
    return response!.data as string;
}

export async function handleGhostDocs(input: GhostDocsInput): Promise<string> {
    const { all, search, regex } = input;

    if (!all && !search && !regex) {
        return 'Provide one of: `all: true` to get full docs, `search` for text search, or `regex` for pattern matching.';
    }

    let content: string;
    try {
        content = await fetchDocs();
    } catch (error) {
        return `Error: ${(error as Error).message}`;
    }

    if (all) {
        return content;
    }

    const lines = content.split('\n');
    const matchedLines: string[] = [];

    if (search) {
        const searchLower = search.toLowerCase();
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(searchLower)) {
                // Include context: 1 line before and after
                const start = Math.max(0, i - 1);
                const end = Math.min(lines.length - 1, i + 1);
                for (let j = start; j <= end; j++) {
                    const line = `${j + 1}: ${lines[j]}`;
                    if (!matchedLines.includes(line)) {
                        matchedLines.push(line);
                    }
                }
            }
        }
    }

    if (regex) {
        // Parse regex string: /pattern/flags or just pattern
        let pattern: RegExp;
        const regexMatch = regex.match(/^\/(.+)\/([gimsuy]*)$/);
        if (regexMatch) {
            pattern = new RegExp(regexMatch[1], regexMatch[2]);
        } else {
            pattern = new RegExp(regex);
        }

        for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
                const start = Math.max(0, i - 1);
                const end = Math.min(lines.length - 1, i + 1);
                for (let j = start; j <= end; j++) {
                    const line = `${j + 1}: ${lines[j]}`;
                    if (!matchedLines.includes(line)) {
                        matchedLines.push(line);
                    }
                }
            }
        }
    }

    if (matchedLines.length === 0) {
        return 'No matches found.';
    }

    return matchedLines.join('\n');
}
