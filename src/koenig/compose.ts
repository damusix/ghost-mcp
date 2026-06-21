// compose(blocks) -> a valid Lexical document string for the Ghost `lexical`
// field. Aggregates per-block errors so the LLM gets actionable feedback.
import { buildBlock } from './blocks.js';
import type { LexicalNode } from './cards.js';
import { isRecord } from './util.js';

export interface ComposeIssue {
    index: number;
    type: string;
    message: string;
}

export class ComposeError extends Error {
    constructor(public issues: ComposeIssue[]) {
        const detail = issues.map((i) => `[#${i.index} ${i.type}] ${i.message}`).join('; ');
        super(
            `composition failed (${issues.length} issue${issues.length === 1 ? '' : 's'}): ${detail}`,
        );
        this.name = 'ComposeError';
    }
}

export function composeRoot(blocks: unknown[]): LexicalNode {
    if (!Array.isArray(blocks) || blocks.length === 0) {
        throw new ComposeError([
            { index: -1, type: '(none)', message: 'blocks must be a non-empty array' },
        ]);
    }
    const children: LexicalNode[] = [];
    const issues: ComposeIssue[] = [];
    blocks.forEach((block, index) => {
        try {
            children.push(buildBlock(block));
        } catch (error) {
            issues.push({
                index,
                type: isRecord(block) && typeof block.type === 'string' ? block.type : '(invalid)',
                message: error instanceof Error ? error.message : String(error),
            });
        }
    });
    if (issues.length > 0) {
        throw new ComposeError(issues);
    }
    return {
        root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children },
    };
}

export function compose(blocks: unknown[]): string {
    return JSON.stringify(composeRoot(blocks));
}
