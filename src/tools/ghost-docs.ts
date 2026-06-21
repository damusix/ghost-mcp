import { z } from 'zod';
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

export async function handleGhostDocs(input: GhostDocsInput): Promise<string> {
    const { all, search, regex } = input;

    if (!all && !search && !regex) {
        return 'Provide one of: `all: true` to get full docs, `search` for text search, or `regex` for pattern matching.';
    }

    const response = await docsApi.get('/llms.txt');
    const content = String(response.data);

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
